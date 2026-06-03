using PulseX.Core.DTOs.Story;
using PulseX.Core.Enums;
using PulseX.Core.Interfaces;
using PulseX.Core.Models;

namespace PulseX.API.Services
{
    public class StoryService
    {
        private readonly IStoryRepository _storyRepository;
        private readonly IStoryCommentRepository _commentRepository;
        private readonly IContentReportRepository _reportRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IUserRepository _userRepository;
        private readonly PatientNotificationService _patientNotificationService;
        private readonly IActivityLogRepository _activityLogRepository;
        private readonly ILogger<StoryService> _logger;

        public StoryService(
            IStoryRepository storyRepository,
            IStoryCommentRepository commentRepository,
            IContentReportRepository reportRepository,
            IPatientRepository patientRepository,
            IDoctorRepository doctorRepository,
            IUserRepository userRepository,
            PatientNotificationService patientNotificationService,
            IActivityLogRepository activityLogRepository,
            ILogger<StoryService> logger)
        {
            _storyRepository    = storyRepository;
            _commentRepository  = commentRepository;
            _reportRepository   = reportRepository;
            _patientRepository  = patientRepository;
            _doctorRepository   = doctorRepository;
            _userRepository     = userRepository;
            _patientNotificationService = patientNotificationService;
            _activityLogRepository = activityLogRepository;
            _logger             = logger;
        }

        // ?? Publish a new story ???????????????????????????????????????????
        public async Task<StoryDto> CreateStoryAsync(int userId, CreateStoryDto dto)
        {
            var patient = await _patientRepository.GetByUserIdAsync(userId)
                ?? throw new Exception("Patient not found");

            var story = new Story
            {
                PatientId   = patient.Id,
                Title       = dto.Title,
                Content     = dto.Content,
                ImageUrl    = dto.ImageUrl,
                Tags        = dto.Tags,
                IsPublished = true,
                PublishedAt = DateTime.UtcNow,
                CreatedAt   = DateTime.UtcNow
            };

            await _storyRepository.AddAsync(story);
            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = userId, Action = "Publish Story",
                EntityType = "Story", EntityId = story.Id,
                Details = $"Story '{story.Title}' published"
            });

            return MapToDto((await _storyRepository.GetByIdAsync(story.Id))!);
        }

        // ?? Paginated published feed ??????????????????????????????????????
        public async Task<StoryPagedDto> GetPublishedStoriesPagedAsync(
            int page, int pageSize, string? tag = null)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 50);

            var (stories, totalCount) = await _storyRepository.GetPublishedPagedAsync(page, pageSize, tag);
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            return new StoryPagedDto
            {
                Stories     = stories.Select(MapToDto).ToList(),
                TotalCount  = totalCount,
                Page        = page,
                PageSize    = pageSize,
                TotalPages  = totalPages,
                HasPrevious = page > 1,
                HasNext     = page < totalPages
            };
        }

        // ?? Full story detail � increments ViewsCount ?????????????????????
        public async Task<StoryDetailDto> GetStoryDetailAsync(int storyId)
        {
            var story = await _storyRepository.GetByIdAsync(storyId)
                ?? throw new Exception("Story not found");

            // Increment view counter
            story.ViewsCount++;
            await _storyRepository.UpdateAsync(story);

            var tags    = ParseTags(story.Tags);
            var related = await _storyRepository.GetRelatedAsync(storyId, tags);

            // Top-level comments with their replies for inline preview (first 3)
            var topLevel = (await _commentRepository.GetTopLevelWithRepliesAsync(storyId)).ToList();
            var avatarMap = await BuildAvatarMapAsync(topLevel);
            var previewComments = topLevel.Take(3).Select(c => MapCommentToDto(c, null, avatarMap)).ToList();

            return new StoryDetailDto
            {
                Id                   = story.Id,
                PatientId            = story.PatientId,
                PatientUserId        = story.Patient?.UserId ?? 0,
                PatientName          = story.Patient?.User?.FullName ?? "Unknown",
                PatientAvatar        = story.Patient?.User?.ProfilePicture,
                Title                = story.Title,
                Snippet              = BuildSnippet(story.Content),
                Content              = story.Content,
                ImageUrl             = story.ImageUrl,
                Tags                 = tags,
                LikesCount           = story.LikesCount,
                CommentsCount        = story.Comments.Count,
                SharesCount          = story.SharesCount,
                ViewsCount           = story.ViewsCount,
                IsPublished          = story.IsPublished,
                IsHidden             = story.IsHidden,
                CreatedAt            = story.CreatedAt,
                PublishedAt          = story.PublishedAt,
                PublishedAtFormatted = FormatDate(story.PublishedAt ?? story.CreatedAt),
                Comments             = previewComments,
                RelatedStories       = related.Select(MapToDto).ToList()
            };
        }

        // ?? All Comments page � full thread, flagged comments marked ??????
        public async Task<StoryCommentsPageDto> GetAllCommentsAsync(int storyId)
        {
            var story = await _storyRepository.GetByIdAsync(storyId)
                ?? throw new Exception("Story not found");

            var topLevel   = (await _commentRepository.GetTopLevelWithRepliesAsync(storyId)).ToList();
            var totalCount = await _commentRepository.CountByStoryIdAsync(storyId);

            // Single query: which comment IDs have a Pending report on this story?
            var flaggedIds = await _reportRepository.GetFlaggedCommentIdsForStoryAsync(storyId);
            var avatarMap = await BuildAvatarMapAsync(topLevel);

            return new StoryCommentsPageDto
            {
                StoryId       = storyId,
                StoryTitle    = story.Title,
                TotalComments = totalCount,
                Comments      = topLevel.Select(c => MapCommentToDto(c, flaggedIds, avatarMap)).ToList()
            };
        }

        // ?? Resolve current avatar (live) for each commenter UserId ?????????
        // Old comments may have CommenterAvatar = null because at the time
        // of creation patient avatars were not persisted. This pulls the
        // current ProfilePicture from User (patients) or Doctor (doctors).
        private async Task<Dictionary<int, string?>> BuildAvatarMapAsync(IEnumerable<StoryComment> comments)
        {
            var userIds = new HashSet<int>();
            foreach (var c in comments)
            {
                userIds.Add(c.UserId);
                if (c.Replies != null)
                    foreach (var r in c.Replies) userIds.Add(r.UserId);
            }

            var map = new Dictionary<int, string?>();
            foreach (var uid in userIds)
            {
                try
                {
                    var user = await _userRepository.GetByIdAsync(uid);
                    if (user == null) continue;

                    if (user.Role == UserRole.Doctor)
                        map[uid] = user.Doctor?.ProfilePicture ?? user.ProfilePicture;
                    else
                        map[uid] = user.ProfilePicture;
                }
                catch { /* skip */ }
            }
            return map;
        }

        // ?? Admin: All Comments � identical but always includes flag data ??
        // Public GetAllCommentsAsync also fetches flags but they are always
        // available for admin; this alias makes the intent explicit.
        public Task<StoryCommentsPageDto> GetAllCommentsAdminAsync(int storyId)
            => GetAllCommentsAsync(storyId);

        // ?? Patient's own published stories (Settings > My Published Stories) ??
        public async Task<IEnumerable<StoryDto>> GetPatientStoriesAsync(int userId)
        {
            var patient = await _patientRepository.GetByUserIdAsync(userId)
                ?? throw new Exception("Patient not found");

            var stories = await _storyRepository.GetByPatientIdAsync(patient.Id);
            return stories.Select(MapToDto);
        }

        // ?? Admin: all stories ????????????????????????????????????????????
        public async Task<IEnumerable<StoryDto>> GetAllStoriesAsync()
        {
            return (await _storyRepository.GetAllAsync()).Select(MapToDto);
        }

        // ?? Like a story ??????????????????????????????????????????????????
        public async Task<int> LikeStoryAsync(int storyId, int userId, UserRole role)
        {
            var story = await _storyRepository.GetByIdAsync(storyId)
                ?? throw new Exception("Story not found");

            story.LikesCount++;
            await _storyRepository.UpdateAsync(story);

            if (story.Patient?.UserId != userId)
            {
                try
                {
                    var (actorName, actorAvatar) = await ResolveCommenter(userId, role);
                    await _patientNotificationService.CreateStoryInteractionAsync(
                        story.PatientId,
                        "New Like on Your Story",
                        $"{actorName} liked your story \"{story.Title}\".",
                        story.Id,
                        actorName,
                        actorAvatar);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to create like notification for Story {StoryId}", storyId);
                }
            }

            return story.LikesCount;
        }

        // ?? Share a story ?????????????????????????????????????????????????
        public async Task<int> ShareStoryAsync(int storyId)
        {
            var story = await _storyRepository.GetByIdAsync(storyId)
                ?? throw new Exception("Story not found");

            story.SharesCount++;
            await _storyRepository.UpdateAsync(story);
            return story.SharesCount;
        }

        // ?? Add a top-level comment ???????????????????????????????????????
        public async Task<StoryCommentDto> AddCommentAsync(
            int storyId, int userId, UserRole role, AddCommentDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content))
                throw new Exception("Comment content cannot be empty");

            var story = await _storyRepository.GetByIdAsync(storyId)
                ?? throw new Exception("Story not found");

            var (commenterName, commenterAvatar) = await ResolveCommenter(userId, role);

            var comment = new StoryComment
            {
                StoryId         = storyId,
                ParentCommentId = null,
                UserId          = userId,
                CommenterName   = commenterName,
                CommenterRole   = role.ToString(),
                CommenterAvatar = commenterAvatar,
                Content         = dto.Content,
                CreatedAt       = DateTime.UtcNow
            };

            await _commentRepository.AddAsync(comment);
            if (story.Patient?.UserId != userId)
            {
                try
                {
                    await _patientNotificationService.CreateStoryInteractionAsync(
                        story.PatientId,
                        "New Comment on Your Story",
                        $"{commenterName} commented on your story \"{story.Title}\".",
                        story.Id,
                        commenterName,
                        commenterAvatar);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to create comment notification for Story {StoryId}", storyId);
                }
            }

            _logger.LogInformation("Comment added to Story {StoryId} by User {UserId}", storyId, userId);
            return MapCommentToDto(comment);
        }

        // ?? Reply to an existing comment ??????????????????????????????????
        public async Task<StoryCommentDto> ReplyToCommentAsync(
            int storyId, int commentId, int userId, UserRole role, ReplyCommentDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content))
                throw new Exception("Reply content cannot be empty");

            var story = await _storyRepository.GetByIdAsync(storyId)
                ?? throw new Exception("Story not found");

            var parent = await _commentRepository.GetByIdAsync(commentId)
                ?? throw new Exception("Comment not found");

            if (parent.StoryId != storyId)
                throw new Exception("Comment does not belong to this story");

            var (commenterName, commenterAvatar) = await ResolveCommenter(userId, role);

            var reply = new StoryComment
            {
                StoryId         = storyId,
                ParentCommentId = commentId,
                UserId          = userId,
                CommenterName   = commenterName,
                CommenterRole   = role.ToString(),
                CommenterAvatar = commenterAvatar,
                Content         = dto.Content,
                CreatedAt       = DateTime.UtcNow
            };

            await _commentRepository.AddAsync(reply);
            if (story.Patient?.UserId != userId)
            {
                try
                {
                    await _patientNotificationService.CreateStoryInteractionAsync(
                        story.PatientId,
                        "New Reply on Your Story",
                        $"{commenterName} replied in your story \"{story.Title}\".",
                        story.Id,
                        commenterName,
                        commenterAvatar);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to create reply notification for Story {StoryId}", storyId);
                }
            }

            _logger.LogInformation("Reply added to Comment {CommentId} by User {UserId}", commentId, userId);
            return MapCommentToDto(reply);
        }

        // ?? Edit a comment (owner only) ??????????????????????????????????
        public async Task<StoryCommentDto> UpdateCommentAsync(int commentId, int userId, string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                throw new Exception("Comment content cannot be empty");

            var comment = await _commentRepository.GetByIdAsync(commentId)
                ?? throw new Exception("Comment not found");

            if (comment.UserId != userId)
                throw new Exception("Unauthorized: you can only edit your own comments");

            comment.Content = content.Trim();
            await _commentRepository.UpdateAsync(comment);
            return MapCommentToDto(comment);
        }

        // ?? Delete a comment (owner or admin) ??????????????????????????????
        public async Task DeleteCommentAsync(int commentId, int userId, bool isAdmin)
        {
            var comment = await _commentRepository.GetByIdAsync(commentId)
                ?? throw new Exception("Comment not found");

            if (!isAdmin && comment.UserId != userId)
                throw new Exception("Unauthorized: you can only delete your own comments");

            await _commentRepository.DeleteAsync(commentId);
        }

        // ?? Like a comment ????????????????????????????????????????????????
        public async Task<int> LikeCommentAsync(int commentId)
        {
            var comment = await _commentRepository.GetByIdAsync(commentId)
                ?? throw new Exception("Comment not found");

            comment.LikesCount++;
            await _commentRepository.UpdateAsync(comment);
            return comment.LikesCount;
        }

        // ?? Patient: edit their own story ?????????????????????????????????
        public async Task<StoryDto> UpdateOwnStoryAsync(int storyId, int userId, CreateStoryDto dto)
        {
            var patient = await _patientRepository.GetByUserIdAsync(userId)
                ?? throw new Exception("Patient not found");

            var story = await _storyRepository.GetByIdAsync(storyId)
                ?? throw new Exception("Story not found");

            if (story.PatientId != patient.Id)
                throw new Exception("Unauthorized: this story does not belong to you");

            story.Title   = dto.Title;
            story.Content = dto.Content;
            story.Tags    = dto.Tags;
            // Only replace the cover when a new one was uploaded; keep existing otherwise.
            if (!string.IsNullOrEmpty(dto.ImageUrl))
                story.ImageUrl = dto.ImageUrl;

            await _storyRepository.UpdateAsync(story);
            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = userId, Action = "Edit Own Story",
                EntityType = "Story", EntityId = story.Id,
                Details = $"Story '{story.Title}' edited by owner"
            });

            return MapToDto((await _storyRepository.GetByIdAsync(story.Id))!);
        }

        // ?? Patient: delete their own story ???????????????????????????????
        public async Task DeleteOwnStoryAsync(int storyId, int userId)
        {
            var patient = await _patientRepository.GetByUserIdAsync(userId)
                ?? throw new Exception("Patient not found");

            var story = await _storyRepository.GetByIdAsync(storyId)
                ?? throw new Exception("Story not found");

            if (story.PatientId != patient.Id)
                throw new Exception("Unauthorized: this story does not belong to you");

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = userId, Action = "Delete Own Story",
                EntityType = "Story", EntityId = story.Id,
                Details = $"Story '{story.Title}' deleted by owner"
            });

            await _storyRepository.DeleteAsync(storyId);
        }

        // ?? Admin: hide ???????????????????????????????????????????????????
        public async Task<StoryDto> HideStoryAsync(int storyId, int adminUserId)
        {
            var story = await _storyRepository.GetByIdAsync(storyId)
                ?? throw new Exception("Story not found");

            story.IsHidden = !story.IsHidden;
            await _storyRepository.UpdateAsync(story);

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = adminUserId,
                Action = story.IsHidden ? "Hide Story" : "Unhide Story",
                EntityType = "Story", EntityId = story.Id,
                Details = story.IsHidden
                    ? $"Story '{story.Title}' hidden"
                    : $"Story '{story.Title}' unhidden"
            });

            return MapToDto((await _storyRepository.GetByIdAsync(storyId))!);
        }

        // ?? Admin: delete ?????????????????????????????????????????????????
        public async Task DeleteStoryAsync(int storyId, int adminUserId)
        {
            var story = await _storyRepository.GetByIdAsync(storyId)
                ?? throw new Exception("Story not found");

            await _activityLogRepository.AddAsync(new ActivityLog
            {
                UserId = adminUserId, Action = "Delete Story",
                EntityType = "Story", EntityId = story.Id,
                Details = $"Story '{story.Title}' deleted by admin"
            });

            await _storyRepository.DeleteAsync(storyId);
        }

        // ?? Private helpers ???????????????????????????????????????????????
        private async Task<(string Name, string? Avatar)> ResolveCommenter(int userId, UserRole role)
        {
            if (role == UserRole.Patient)
            {
                var patient = await _patientRepository.GetByUserIdAsync(userId)
                    ?? throw new Exception("Patient not found");
                return (patient.User.FullName, patient.User?.ProfilePicture);
            }
            if (role == UserRole.Doctor)
            {
                var doctor = await _doctorRepository.GetByUserIdAsync(userId)
                    ?? throw new Exception("Doctor not found");
                return (doctor.User.FullName, doctor.ProfilePicture);
            }
            var user = await _userRepository.GetByIdAsync(userId)
                ?? throw new Exception("User not found");
            return (user.FullName, null);
        }

        private static StoryDto MapToDto(Story s) => new()
        {
            Id                   = s.Id,
            PatientId            = s.PatientId,
            PatientUserId        = s.Patient?.UserId ?? 0,
            PatientName          = s.Patient?.User?.FullName ?? "Unknown",
            PatientAvatar        = s.Patient?.User?.ProfilePicture,
            Title                = s.Title,
            Snippet              = BuildSnippet(s.Content),
            Content              = s.Content,
            ImageUrl             = s.ImageUrl,
            Tags                 = ParseTags(s.Tags),
            LikesCount           = s.LikesCount,
            CommentsCount        = s.Comments?.Count ?? 0,
            SharesCount          = s.SharesCount,
            ViewsCount           = s.ViewsCount,
            IsPublished          = s.IsPublished,
            IsHidden             = s.IsHidden,
            CreatedAt            = s.CreatedAt,
            PublishedAt          = s.PublishedAt,
            PublishedAtFormatted = FormatDate(s.PublishedAt ?? s.CreatedAt)
        };

        private static StoryCommentDto MapCommentToDto(
            StoryComment c, HashSet<int>? flaggedIds = null,
            Dictionary<int, string?>? avatarMap = null)
        {
            string? ResolveAvatar(int userId, string? stored)
                => avatarMap != null && avatarMap.TryGetValue(userId, out var live) && !string.IsNullOrWhiteSpace(live)
                    ? live
                    : stored;

            return new StoryCommentDto
            {
                Id              = c.Id,
                StoryId         = c.StoryId,
                ParentCommentId = c.ParentCommentId,
                UserId          = c.UserId,
                CommenterName   = c.CommenterName,
                CommenterRole   = c.CommenterRole,
                CommenterAvatar = ResolveAvatar(c.UserId, c.CommenterAvatar),
                Content         = c.Content,
                LikesCount      = c.LikesCount,
                RepliesCount    = c.Replies?.Count ?? 0,
                CreatedAt       = c.CreatedAt,
                TimeAgo         = BuildTimeAgo(c.CreatedAt),
                IsFlagged       = flaggedIds?.Contains(c.Id) ?? false,
                Replies         = c.Replies?
                    .OrderBy(r => r.CreatedAt)
                    .Select(r => new StoryCommentDto
                    {
                        Id              = r.Id,
                        StoryId         = r.StoryId,
                        ParentCommentId = r.ParentCommentId,
                        UserId          = r.UserId,
                        CommenterName   = r.CommenterName,
                        CommenterRole   = r.CommenterRole,
                        CommenterAvatar = ResolveAvatar(r.UserId, r.CommenterAvatar),
                        Content         = r.Content,
                        LikesCount      = r.LikesCount,
                        RepliesCount    = 0,
                        CreatedAt       = r.CreatedAt,
                        TimeAgo         = BuildTimeAgo(r.CreatedAt),
                        IsFlagged       = flaggedIds?.Contains(r.Id) ?? false,
                        Replies         = new()
                    })
                    .ToList() ?? new()
            };
        }

        private static List<string> ParseTags(string? tags) =>
            string.IsNullOrWhiteSpace(tags)
                ? new()
                : tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
                      .Select(t => t.Trim()).Where(t => t.Length > 0).ToList();

        private static string BuildSnippet(string content) =>
            content.Length <= 200 ? content : content[..200].TrimEnd() + "...";

        private static string FormatDate(DateTime dt) => dt.ToString("MMMM d, yyyy");

        private static string BuildTimeAgo(DateTime dt)
        {
            var diff = DateTime.UtcNow - dt;
            if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes} min ago";
            if (diff.TotalHours   < 24) return $"{(int)diff.TotalHours} hour{((int)diff.TotalHours == 1 ? "" : "s")} ago";
            if (diff.TotalDays    < 30) return $"{(int)diff.TotalDays} day{((int)diff.TotalDays == 1 ? "" : "s")} ago";
            return dt.ToString("MMM d, yyyy");
        }
    }
}
