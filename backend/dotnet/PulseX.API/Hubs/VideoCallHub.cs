using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using PulseX.API.Services;
using PulseX.Core.DTOs.VideoCall;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace PulseX.API.Hubs
{
    /// <summary>
    /// SignalR Hub for real-time video call signaling and communication
    /// Handles WebRTC signaling, media state changes, and call lifecycle events
    /// </summary>
    [Authorize]
    public class VideoCallHub : Hub
    {
        private readonly VideoCallService _videoCallService;
        private readonly ILogger<VideoCallHub> _logger;
        
        // Thread-safe connection tracking (use Redis in production for scale)
        private static readonly ConcurrentDictionary<string, UserConnection> _connections = new();
        private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, bool>> _sessionParticipants = new();
        private static readonly ConcurrentDictionary<string, DateTime> _lastIncomingDispatch = new();

        public VideoCallHub(VideoCallService videoCallService, ILogger<VideoCallHub> logger)
        {
            _videoCallService = videoCallService;
            _logger = logger;
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // CONNECTION LIFECYCLE
        // ═══════════════════════════════════════════════════════════════════════════

        public override async Task OnConnectedAsync()
        {
            var userId = GetUserId();
            var userName = GetUserName();
            var role = GetUserRole();

            _logger.LogInformation(
                "User {UserId} ({UserName}, {Role}) connected to VideoCallHub. ConnectionId: {ConnectionId}",
                userId, userName, role, Context.ConnectionId);

            _connections[Context.ConnectionId] = new UserConnection
            {
                UserId = userId,
                UserName = userName,
                Role = role,
                ConnectionId = Context.ConnectionId,
                ConnectedAt = DateTime.UtcNow
            };

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetUserId();
            
            _logger.LogInformation(
                "User {UserId} disconnected from VideoCallHub. ConnectionId: {ConnectionId}",
                userId, Context.ConnectionId);

            _connections.TryRemove(Context.ConnectionId, out var connection);

            // Notify other participants if user was in a session
            if (connection?.CurrentSessionId != null)
            {
                await LeaveSession(connection.CurrentSessionId);
            }

            await base.OnDisconnectedAsync(exception);
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // SESSION MANAGEMENT
        // ═══════════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Join a video call session
        /// </summary>
        public async Task JoinSession(string sessionId)
        {
            var userId = GetUserId();
            var userName = GetUserName();
            var role = GetUserRole();

            _logger.LogInformation(
                "User {UserId} ({Role}) joining session {SessionId}",
                userId, role, sessionId);

            // Add to SignalR group for this session
            await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);

            // Track participant using ConcurrentDictionary
            var sessionDict = _sessionParticipants.GetOrAdd(sessionId, _ => new ConcurrentDictionary<string, bool>());
            sessionDict[Context.ConnectionId] = true;

            if (_connections.TryGetValue(Context.ConnectionId, out var conn))
            {
                conn.CurrentSessionId = sessionId;
            }

            // Update session in database
            await _videoCallService.ParticipantJoinedAsync(sessionId, userId, role);

            // Notify other participants
            await Clients.OthersInGroup(sessionId).SendAsync("ParticipantJoined", new ParticipantEventDto
            {
                SessionId = sessionId,
                UserId = userId,
                UserName = userName,
                Role = role,
                EventType = "joined",
                Timestamp = DateTime.UtcNow
            });

            // Send current participants to the joiner
            var participants = await _videoCallService.GetSessionParticipantsAsync(sessionId);
            await Clients.Caller.SendAsync("SessionParticipants", participants);
        }

        /// <summary>
        /// Ring the other participant with an incoming call notification.
        /// </summary>
        public async Task NotifyIncomingCall(IncomingCallRequestDto request)
        {
            var callerUserId = GetUserId();
            var callerRole = GetUserRole();

            if (callerUserId <= 0 || request.AppointmentId <= 0)
            {
                return;
            }

            var incomingPayload = await _videoCallService.BuildIncomingCallAsync(
                request.AppointmentId,
                callerUserId,
                callerRole,
                request.SessionId);

            if (incomingPayload == null)
            {
                return;
            }

            var dedupeKey = $"{incomingPayload.SessionId}:{incomingPayload.TargetUserId}";
            var now = DateTime.UtcNow;
            if (_lastIncomingDispatch.TryGetValue(dedupeKey, out var lastAt) && (now - lastAt).TotalSeconds < 5)
            {
                return;
            }
            _lastIncomingDispatch[dedupeKey] = now;

            var targetConnectionIds = _connections.Values
                .Where(connection => connection.UserId == incomingPayload.TargetUserId)
                .Select(connection => connection.ConnectionId)
                .Distinct()
                .ToList();

            if (targetConnectionIds.Count > 0)
            {
                await Clients.Clients(targetConnectionIds).SendAsync("IncomingCall", incomingPayload);
            }

            await Clients.Caller.SendAsync("CallRinging", new
            {
                appointmentId = incomingPayload.AppointmentId,
                sessionId = incomingPayload.SessionId,
                delivered = targetConnectionIds.Count > 0,
                timestamp = now
            });
        }

        /// <summary>
        /// Notify caller that callee declined the call.
        /// </summary>
        public async Task DeclineIncomingCall(DeclineIncomingCallRequestDto request)
        {
            var declinerUserId = GetUserId();
            var declinerRole = GetUserRole();

            if (declinerUserId <= 0 || request.CallerUserId <= 0)
            {
                return;
            }

            var callerConnectionIds = _connections.Values
                .Where(connection => connection.UserId == request.CallerUserId)
                .Select(connection => connection.ConnectionId)
                .Distinct()
                .ToList();

            if (callerConnectionIds.Count == 0)
            {
                return;
            }

            await Clients.Clients(callerConnectionIds).SendAsync("IncomingCallDeclined", new
            {
                appointmentId = request.AppointmentId,
                sessionId = request.SessionId,
                declinedByUserId = declinerUserId,
                declinedByRole = declinerRole,
                timestamp = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Leave a video call session
        /// </summary>
        public async Task LeaveSession(string sessionId)
        {
            var userId = GetUserId();
            var userName = GetUserName();
            var role = GetUserRole();

            _logger.LogInformation(
                "User {UserId} ({Role}) leaving session {SessionId}",
                userId, role, sessionId);

            // Remove from SignalR group
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);

            // Update tracking
            if (_sessionParticipants.TryGetValue(sessionId, out var participants))
            {
                participants.TryRemove(Context.ConnectionId, out _);
                if (participants.IsEmpty)
                {
                    _sessionParticipants.TryRemove(sessionId, out _);
                }
            }

            if (_connections.TryGetValue(Context.ConnectionId, out var conn))
            {
                conn.CurrentSessionId = null;
            }

            // Update session in database
            await _videoCallService.ParticipantLeftAsync(sessionId, userId, role);

            // Notify other participants
            await Clients.Group(sessionId).SendAsync("ParticipantLeft", new ParticipantEventDto
            {
                SessionId = sessionId,
                UserId = userId,
                UserName = userName,
                Role = role,
                EventType = "left",
                Timestamp = DateTime.UtcNow
            });
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // WEBRTC SIGNALING
        // ═══════════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Send WebRTC SDP offer to initiate connection
        /// </summary>
        public async Task SendOffer(SdpMessageDto offer)
        {
            _logger.LogDebug("Relaying SDP offer for session {SessionId}", offer.SessionId);
            await Clients.OthersInGroup(offer.SessionId).SendAsync("ReceiveOffer", offer);
        }

        /// <summary>
        /// Send WebRTC SDP answer to complete connection
        /// </summary>
        public async Task SendAnswer(SdpMessageDto answer)
        {
            _logger.LogDebug("Relaying SDP answer for session {SessionId}", answer.SessionId);
            await Clients.OthersInGroup(answer.SessionId).SendAsync("ReceiveAnswer", answer);
        }

        /// <summary>
        /// Send ICE candidate for NAT traversal
        /// </summary>
        public async Task SendIceCandidate(IceCandidateDto candidate)
        {
            _logger.LogDebug("Relaying ICE candidate for session {SessionId}", candidate.SessionId);
            await Clients.OthersInGroup(candidate.SessionId).SendAsync("ReceiveIceCandidate", candidate);
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // MEDIA CONTROLS
        // ═══════════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Toggle video stream on/off
        /// </summary>
        public async Task ToggleVideo(string sessionId, bool isEnabled)
        {
            var userId = GetUserId();
            var role = GetUserRole();

            _logger.LogInformation(
                "User {UserId} toggled video to {State} in session {SessionId}",
                userId, isEnabled ? "ON" : "OFF", sessionId);

            // Update in database
            await _videoCallService.UpdateMediaStateAsync(sessionId, userId, role, videoEnabled: isEnabled);

            // Notify other participants
            await Clients.OthersInGroup(sessionId).SendAsync("MediaStateChanged", new
            {
                sessionId,
                userId,
                role,
                videoEnabled = isEnabled,
                timestamp = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Toggle audio stream on/off (mute/unmute)
        /// </summary>
        public async Task ToggleAudio(string sessionId, bool isEnabled)
        {
            var userId = GetUserId();
            var role = GetUserRole();

            _logger.LogInformation(
                "User {UserId} toggled audio to {State} in session {SessionId}",
                userId, isEnabled ? "UNMUTED" : "MUTED", sessionId);

            // Update in database
            await _videoCallService.UpdateMediaStateAsync(sessionId, userId, role, audioEnabled: isEnabled);

            // Notify other participants
            await Clients.OthersInGroup(sessionId).SendAsync("MediaStateChanged", new
            {
                sessionId,
                userId,
                role,
                audioEnabled = isEnabled,
                timestamp = DateTime.UtcNow
            });
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // CALL CONTROLS
        // ═══════════════════════════════════════════════════════════════════════════

        /// <summary>
        /// End the call - terminates for both parties
        /// </summary>
        public async Task EndCall(EndCallRequestDto request)
        {
            var userId = GetUserId();
            var role = GetUserRole();

            _logger.LogInformation(
                "User {UserId} ({Role}) ending call session {SessionId}. Reason: {Reason}",
                userId, role, request.SessionId, request.Reason ?? "User ended call");

            // End session in database and update appointment status
            var result = await _videoCallService.EndCallAsync(request.SessionId, userId, request.Reason);

            // Notify all participants that call has ended
            await Clients.Group(request.SessionId).SendAsync("CallEnded", new
            {
                sessionId = request.SessionId,
                endedBy = userId,
                endedByRole = role,
                reason = request.Reason ?? "Call ended",
                durationSeconds = result.DurationSeconds,
                appointmentId = result.AppointmentId,
                timestamp = DateTime.UtcNow
            });

            // Send post-consultation redirects only after a call actually connected.
            if (result.AppointmentCompleted)
            {
                await SendPostCallRedirects(request.SessionId, result.AppointmentId ?? 0, result.DurationSeconds);
            }
        }

        /// <summary>
        /// Send post-call redirect instructions to participants
        /// </summary>
        private async Task SendPostCallRedirects(string sessionId, int appointmentId, int durationSeconds)
        {
            // Get session participants
            if (!_sessionParticipants.TryGetValue(sessionId, out var connectionIds))
                return;

            foreach (var connId in connectionIds.Keys)
            {
                if (!_connections.TryGetValue(connId, out var conn))
                    continue;

                if (conn.Role == "Doctor")
                {
                    // Doctor: Redirect to E-Prescription form
                    await Clients.Client(connId).SendAsync("RedirectTo", new
                    {
                        route = $"/doctor/appointments/{appointmentId}/prescription",
                        message = "Please create an e-prescription for this consultation.",
                        appointmentId,
                        durationMinutes = durationSeconds / 60
                    });
                }
                else
                {
                    // Patient: Redirect to rating or dashboard
                    await Clients.Client(connId).SendAsync("RedirectTo", new
                    {
                        route = $"/patient/appointments/{appointmentId}/rate",
                        fallbackRoute = "/patient/dashboard",
                        message = "Your consultation has ended. Please rate your experience.",
                        appointmentId,
                        durationMinutes = durationSeconds / 60
                    });
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // CONNECTION QUALITY MONITORING
        // ═══════════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Report connection quality metrics
        /// </summary>
        public async Task ReportConnectionQuality(ConnectionQualityDto quality)
        {
            var userId = GetUserId();
            var role = GetUserRole();

            // Calculate quality level based on latency
            quality.Quality = CalculateQualityLevel(quality.LatencyMs, quality.JitterMs, quality.PacketLossPercent);

            _logger.LogDebug(
                "Connection quality report from {UserId}: Latency={Latency}ms, Quality={Quality}",
                userId, quality.LatencyMs, quality.Quality);

            // Update in database
            await _videoCallService.UpdateConnectionQualityAsync(
                quality.SessionId, userId, role, 
                quality.LatencyMs, quality.Quality);

            // Notify other participants of connection quality
            await Clients.OthersInGroup(quality.SessionId).SendAsync("ConnectionQualityUpdate", new
            {
                userId,
                role,
                latencyMs = quality.LatencyMs,
                quality = quality.Quality,
                timestamp = DateTime.UtcNow
            });
        }

        /// <summary>
        /// Calculate connection quality level from metrics
        /// </summary>
        private static string CalculateQualityLevel(int latencyMs, int jitterMs, int packetLoss)
        {
            // Scoring based on typical WebRTC thresholds
            int score = 100;

            // Latency impact (ideal < 150ms)
            if (latencyMs < 100) score -= 0;
            else if (latencyMs < 150) score -= 10;
            else if (latencyMs < 300) score -= 25;
            else if (latencyMs < 500) score -= 40;
            else score -= 60;

            // Jitter impact (ideal < 30ms)
            if (jitterMs < 20) score -= 0;
            else if (jitterMs < 50) score -= 10;
            else if (jitterMs < 100) score -= 20;
            else score -= 30;

            // Packet loss impact (ideal < 1%)
            if (packetLoss < 1) score -= 0;
            else if (packetLoss < 3) score -= 15;
            else if (packetLoss < 5) score -= 30;
            else score -= 50;

            return score switch
            {
                >= 80 => "Excellent",
                >= 60 => "Good",
                >= 40 => "Fair",
                _ => "Poor"
            };
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // HELPER METHODS
        // ═══════════════════════════════════════════════════════════════════════════

        private int GetUserId()
        {
            var claim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        private string GetUserName()
        {
            return Context.User?.FindFirst(ClaimTypes.Name)?.Value 
                ?? Context.User?.FindFirst("name")?.Value 
                ?? "Unknown";
        }

        private string GetUserRole()
        {
            // Try both short and full claim type formats
            return Context.User?.FindFirst(ClaimTypes.Role)?.Value 
                ?? Context.User?.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value
                ?? Context.User?.FindFirst("role")?.Value
                ?? "Unknown";
        }
    }

    /// <summary>
    /// Tracks connected users
    /// </summary>
    internal class UserConnection
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string ConnectionId { get; set; } = string.Empty;
        public string? CurrentSessionId { get; set; }
        public DateTime ConnectedAt { get; set; }
    }
}
