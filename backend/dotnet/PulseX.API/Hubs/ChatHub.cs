using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace PulseX.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ILogger<ChatHub> _logger;

        // userId -> active connection ids for correct multi-tab presence handling.
        private static readonly ConcurrentDictionary<int, ConcurrentDictionary<string, byte>> UserConnections = new();

        public ChatHub(ILogger<ChatHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = GetUserId();
            if (userId > 0)
            {
                var connections = UserConnections.GetOrAdd(userId, _ => new ConcurrentDictionary<string, byte>());
                connections.TryAdd(Context.ConnectionId, 0);

                if (connections.Count == 1)
                {
                    await Clients.All.SendAsync("UserOnline", new
                    {
                        userId,
                        role = GetUserRole(),
                        at = DateTime.UtcNow
                    });
                }

                _logger.LogInformation("User {UserId} connected to ChatHub. ConnectionId: {ConnectionId}", userId, Context.ConnectionId);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetUserId();

            if (userId > 0 && UserConnections.TryGetValue(userId, out var connections))
            {
                connections.TryRemove(Context.ConnectionId, out _);

                if (connections.IsEmpty)
                {
                    UserConnections.TryRemove(userId, out _);
                    await Clients.All.SendAsync("UserOffline", new
                    {
                        userId,
                        role = GetUserRole(),
                        at = DateTime.UtcNow
                    });
                }
            }

            _logger.LogInformation("User {UserId} disconnected from ChatHub. ConnectionId: {ConnectionId}", userId, Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        public Task JoinConversation(int appointmentId)
        {
            return Groups.AddToGroupAsync(Context.ConnectionId, GetConversationGroup(appointmentId));
        }

        public Task LeaveConversation(int appointmentId)
        {
            return Groups.RemoveFromGroupAsync(Context.ConnectionId, GetConversationGroup(appointmentId));
        }

        public Task<List<int>> GetOnlineUsers()
        {
            var onlineUsers = UserConnections
                .Where(entry => !entry.Value.IsEmpty)
                .Select(entry => entry.Key)
                .ToList();

            return Task.FromResult(onlineUsers);
        }

        public Task<bool> IsUserOnline(int userId)
        {
            return Task.FromResult(UserConnections.ContainsKey(userId));
        }

        public static string GetConversationGroup(int appointmentId)
        {
            return $"chat-appointment-{appointmentId}";
        }

        private int GetUserId()
        {
            var claim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        private string GetUserRole()
        {
            return Context.User?.FindFirst(ClaimTypes.Role)?.Value
                ?? Context.User?.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value
                ?? Context.User?.FindFirst("role")?.Value
                ?? "Unknown";
        }
    }
}