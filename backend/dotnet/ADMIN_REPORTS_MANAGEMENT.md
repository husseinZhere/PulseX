# Admin Reports Management System - PulseX

## Overview

The Admin Reports Management System provides comprehensive content moderation capabilities for the PulseX platform. Admins act as final decision-makers for all community-reported content including Stories, Comments, and Replies.

## System Architecture

### Components

1. **Models** (`PulseX.Core/Models/ContentReport.cs`)
   - Stores report metadata, status, and snapshots of reported content
   - Maintains audit trail with reviewer information

2. **DTOs** (`PulseX.Core/DTOs/Report/ReportDto.cs`)
   - Request/Response data transfer objects
   - Includes statistics, filtering, and bulk operation DTOs

3. **Repository** (`PulseX.Data/Repositories/ContentReportRepository.cs`)
   - Data access layer for reports
   - Supports filtering by status and flagged comment queries

4. **Service** (`PulseX.API/Services/ContentReportService.cs`)
   - Business logic for report submission and moderation
   - Handles content deletion and status updates

5. **Controllers**
   - `ReportsController.cs` - User-facing report submission
   - `ReportsManagementController.cs` - Admin moderation dashboard

## Features

### 1. Dashboard & Statistics

**Endpoint:** `GET /api/admin/reports/statistics`

Returns four primary status cards:
- **Total Reports**: Aggregate count of all submitted reports
- **Pending Review**: Reports requiring immediate attention (highlighted orange)
- **Reviewed**: Content confirmed as violating guidelines (highlighted green)
- **Dismissed**: Reports found invalid/non-violating (highlighted grey)

**Response:**
```json
{
  "totalReports": 150,
  "pendingReview": 23,
  "reviewed": 100,
  "dismissed": 27
}
```

### 2. Report Cards UI

**Endpoint:** `GET /api/admin/reports?status=Pending`

Each report card contains:
- **Context Header**: Reporter identity (name, role), elapsed time, status tag
- **Source Reference**: Link to origin story (e.g., "In story: 'Nutrition Changes...'")
- **Offending Content**: Red-highlighted box with exact reported text and author
- **Report Reason**: Reporter's explanation
- **Target Indicators**: Visual icons (Story/Comment/Reply)

**Query Parameters:**
- `status` (optional): Filter by "Pending", "Reviewed", or "Dismissed"

**Response:**
```json
[
  {
    "id": 42,
    "reporterUserId": 15,
    "reporterName": "Dr. Sarah Ahmed",
    "timeAgo": "2 hours ago",
    "targetType": "Comment",
    "targetId": 128,
    "targetContentSnapshot": "Buy cheap supplements from my website...",
    "targetAuthorName": "John Spammer",
    "storyId": 67,
    "storyTitle": "Nutrition Changes That Improved My Health",
    "category": "Spam",
    "reason": "Promotional spam with external link",
    "status": "Pending",
    "createdAt": "2026-03-19T10:30:00Z"
  }
]
```

### 3. Admin Moderation Actions

#### A. View Content in Context
Navigate to the live story to see full context:
```
GET /api/story/{storyId}
```

#### B. Delete Content
Permanently removes offending content and marks report as Reviewed:

**Endpoint:** `DELETE /api/admin/reports/{reportId}/delete-content`

**Request Body:**
```json
{
  "adminNote": "Removed for policy violation - promotional spam"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment successfully deleted",
  "deletedContentType": "Comment",
  "deletedContentId": 128,
  "report": { /* updated report */ }
}
```

#### C. Mark Reviewed
Transitions report to 'Reviewed' status without deleting content (audit trail):

**Endpoint:** `PATCH /api/admin/reports/{reportId}/review`

**Request Body:**
```json
{
  "adminNote": "Verified violation but content already removed by author"
}
```

#### D. Dismiss Report
Rejects report and clears from active queue:

**Endpoint:** `PATCH /api/admin/reports/{reportId}/dismiss`

**Request Body:**
```json
{
  "adminNote": "No policy violation found - legitimate content"
}
```

### 4. Bulk Operations

#### Bulk Delete
**Endpoint:** `POST /api/admin/reports/bulk-delete`

**Request:**
```json
{
  "reportIds": [42, 43, 44],
  "adminNote": "Mass removal of spam comments"
}
```

#### Bulk Dismiss
**Endpoint:** `POST /api/admin/reports/bulk-dismiss`

**Request:**
```json
{
  "reportIds": [45, 46],
  "adminNote": "False positives - legitimate debate"
}
```

### 5. Comment Moderation View

#### Get Flagged Comments for Story
**Endpoint:** `GET /api/admin/reports/story/{storyId}/flagged-comments`

Returns all flagged comments with visual warning indicators:

**Response:**
```json
{
  "storyId": 67,
  "flaggedCommentIds": [128, 129],
  "totalFlagged": 2,
  "reports": [ /* array of ContentReportDto */ ]
}
```

#### Quick Delete Comment
Direct deletion from "All Comments" view with trash icon:

**Endpoint:** `DELETE /api/admin/reports/comment/{commentId}`

**Request:**
```json
{
  "reason": "Spam - Promotional content"
}
```

### 6. All Comments Admin View

**Endpoint:** `GET /api/story/{storyId}/comments/admin`

Returns complete comment thread with `IsFlagged` property:

```json
{
  "storyId": 67,
  "storyTitle": "Nutrition Changes That Improved My Health",
  "totalComments": 15,
  "comments": [
    {
      "id": 128,
      "content": "Buy cheap supplements...",
      "commenterName": "John Spammer",
      "isFlagged": true,  // ⚠️ Shows warning banner
      "replies": []
    }
  ]
}
```

## Report Categories

Strictly enforced categories matching user-facing modals:

1. **Spam** - Promotional content, advertisements
2. **Inappropriate Content** - Offensive or unsuitable material
3. **Harassment** - Bullying or threatening behavior
4. **Misinformation** - False or misleading health information
5. **Abusive** - Hate speech or abusive language
6. **Other** - Other policy violations

## Data Integrity

### Report Status Flow
```
Pending → Reviewed (content deleted or verified)
       ↘ Dismissed (invalid report)
```

### Audit Trail
Every moderation action logs:
- Admin user ID
- Timestamp
- Action taken
- Admin notes
- Content snapshot (preserved even after deletion)

## Security & Authorization

All admin endpoints require:
- Valid JWT token
- `Admin` role claim
- Endpoints are protected with `[Authorize(Roles = "Admin")]`

## Database Schema

**ContentReports Table:**
```sql
- Id (PK)
- ReporterUserId
- ReporterName
- TargetType (Story | Comment)
- TargetId
- TargetContentSnapshot
- TargetAuthorName
- StoryId (FK, nullable)
- StoryTitle
- Category
- Reason
- Status (Pending | Reviewed | Dismissed)
- CreatedAt
- ReviewedAt
- ReviewedByAdminId
- AdminNote
```

## Integration Points

### Story Service Integration
- `GetAllCommentsAdminAsync()` includes `IsFlagged` property
- Flagged comments shown with visual warnings
- Seamless navigation from reports to content

### Activity Logging
All moderation actions are logged to `ActivityLogs` table for compliance:
- Report status changes
- Content deletions
- Bulk operations

## Example Workflow

### Typical Admin Moderation Flow:

1. **Admin opens Reports Management Dashboard**
   ```
   GET /api/admin/reports/statistics
   // Shows: 23 pending, 100 reviewed, 27 dismissed
   ```

2. **Views pending reports**
   ```
   GET /api/admin/reports?status=Pending
   // Returns list of 23 reports with full details
   ```

3. **Reviews specific report (ID: 42)**
   - Sees: "Comment by John Spammer: 'Buy cheap supplements...'"
   - Category: Spam
   - In story: "Nutrition Changes..."
   - Reporter: Dr. Sarah Ahmed (2 hours ago)

4. **Clicks "View Content" to see context**
   ```
   GET /api/story/67/comments/admin
   // Shows comment #128 with IsFlagged: true
   ```

5. **Decides to delete content**
   ```
   DELETE /api/admin/reports/42/delete-content
   Body: { "adminNote": "Spam - promotional content" }
   ```

6. **System automatically:**
   - Deletes comment #128 from database
   - Marks report #42 as "Reviewed"
   - Logs action to ActivityLogs
   - Updates statistics (Pending: 22, Reviewed: 101)

## API Summary

### Admin Endpoints (`/api/admin/reports`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/statistics` | Dashboard statistics |
| GET | `/` | List all reports (filterable) |
| GET | `/{reportId}` | Get specific report |
| PATCH | `/{reportId}/review` | Mark as reviewed |
| PATCH | `/{reportId}/dismiss` | Dismiss report |
| DELETE | `/{reportId}/delete-content` | Delete content & mark reviewed |
| POST | `/bulk-delete` | Bulk delete multiple reports |
| POST | `/bulk-dismiss` | Bulk dismiss multiple reports |
| GET | `/story/{storyId}/flagged-comments` | Get flagged comments |
| DELETE | `/comment/{commentId}` | Quick delete comment |

### User Endpoints (`/api/reports`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/stories/{storyId}` | Report a story |
| POST | `/comments/{commentId}` | Report a comment |

## Testing

### Manual Testing Steps

1. **Submit a test report:**
   ```bash
   POST /api/reports/comments/123
   Authorization: Bearer {patient_token}
   {
     "category": "Spam",
     "reason": "Testing report system"
   }
   ```

2. **View as admin:**
   ```bash
   GET /api/admin/reports?status=Pending
   Authorization: Bearer {admin_token}
   ```

3. **Test moderation actions:**
   - Delete content
   - Mark reviewed
   - Dismiss report

4. **Verify flagged comments:**
   ```bash
   GET /api/story/123/comments/admin
   Authorization: Bearer {admin_token}
   ```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200 OK` - Success
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Report/Content not found
- `500 Internal Server Error` - Server error

Error response format:
```json
{
  "message": "Report not found"
}
```

## Logging

All moderation actions are logged at `Information` level:
```
Admin {AdminId} deleted Comment #{CommentId} from report #{ReportId}
Admin {AdminId} dismissed report #{ReportId}
Report #{ReportId} filed by User {UserId} on Comment #{TargetId}
```

## Performance Considerations

- Reports query uses indexed fields (Status, StoryId, TargetType)
- Flagged comments retrieved via optimized HashSet lookup
- Bulk operations process sequentially with error isolation
- Content snapshots cached to prevent repeated database hits

## Future Enhancements

- Real-time notifications for new reports
- Auto-moderation based on report volume thresholds
- Pattern detection for repeat offenders
- Export reports for compliance audits
- Machine learning integration for spam detection

---

**Last Updated:** March 19, 2026  
**Version:** 1.0  
**Maintained by:** PulseX Development Team
