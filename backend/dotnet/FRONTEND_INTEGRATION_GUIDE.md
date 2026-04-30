# Admin Reports Management - Frontend Integration Guide

## Quick Start

### 1. Dashboard Statistics Display

```javascript
// Fetch statistics for the 4 status cards
const response = await fetch('/api/admin/reports/statistics', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const stats = await response.json();
// {
//   totalReports: 150,
//   pendingReview: 23,
//   reviewed: 100,
//   dismissed: 27
// }
```

### UI Components:
- **Total Reports** (Blue card) - `stats.totalReports`
- **Pending Review** (Orange card, highlighted) - `stats.pendingReview`
- **Reviewed** (Green card) - `stats.reviewed`
- **Dismissed** (Grey card) - `stats.dismissed`

---

### 2. Display Report Cards

```javascript
// Fetch reports with optional status filter
const fetchReports = async (status = null) => {
  const url = status 
    ? `/api/admin/reports?status=${status}`
    : '/api/admin/reports';
  
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  
  return await response.json();
};

// Usage:
const pendingReports = await fetchReports('Pending');
const allReports = await fetchReports(); // No filter
```

### Report Card Template:

```jsx
<ReportCard>
  {/* Context Header */}
  <Header>
    <Reporter>{report.reporterName}</Reporter>
    <TimeAgo>{report.timeAgo}</TimeAgo>
    <StatusBadge status={report.status}>{report.category}</StatusBadge>
  </Header>

  {/* Source Reference */}
  <SourceLink href={`/story/${report.storyId}`}>
    In story: "{report.storyTitle}"
  </SourceLink>

  {/* Offending Content */}
  <OffendingContent className="red-box">
    <Author>Content by {report.targetAuthorName}:</Author>
    <Snapshot>{report.targetContentSnapshot}</Snapshot>
  </OffendingContent>

  {/* Report Reason */}
  <Reason>
    <Label>Reason:</Label>
    <Text>{report.reason}</Text>
  </Reason>

  {/* Target Type Indicator */}
  <TargetIcon>
    {report.targetType === 'Story' ? <StoryIcon /> : <CommentIcon />}
    {report.targetType}
  </TargetIcon>

  {/* Action Buttons */}
  <Actions>
    <Button onClick={() => viewContent(report)}>View Content</Button>
    <Button onClick={() => deleteContent(report)}>Delete Content</Button>
    <Button onClick={() => markReviewed(report)}>Mark Reviewed</Button>
    <Button onClick={() => dismissReport(report)}>Dismiss</Button>
  </Actions>
</ReportCard>
```

---

### 3. Moderation Actions

#### A. View Content in Context
```javascript
const viewContent = (report) => {
  // Navigate to story detail page
  window.location.href = `/admin/story/${report.storyId}`;
};
```

#### B. Delete Content
```javascript
const deleteContent = async (reportId) => {
  const adminNote = prompt('Enter admin note (optional):');
  
  const response = await fetch(`/api/admin/reports/${reportId}/delete-content`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ adminNote })
  });

  const result = await response.json();
  
  if (result.success) {
    alert(`${result.deletedContentType} successfully deleted`);
    refreshReports();
  }
};
```

#### C. Mark Reviewed
```javascript
const markReviewed = async (reportId) => {
  const adminNote = prompt('Enter admin note (optional):');
  
  await fetch(`/api/admin/reports/${reportId}/review`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ adminNote })
  });
  
  refreshReports();
};
```

#### D. Dismiss Report
```javascript
const dismissReport = async (reportId) => {
  const adminNote = prompt('Why are you dismissing this report?');
  
  await fetch(`/api/admin/reports/${reportId}/dismiss`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ adminNote })
  });
  
  refreshReports();
};
```

---

### 4. Bulk Operations

#### Bulk Delete
```javascript
const bulkDelete = async (reportIds) => {
  const adminNote = prompt('Enter reason for bulk deletion:');
  
  const response = await fetch('/api/admin/reports/bulk-delete', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reportIds, adminNote })
  });

  const result = await response.json();
  alert(`Successfully deleted ${result.totalProcessed} reports`);
  refreshReports();
};
```

#### Bulk Dismiss
```javascript
const bulkDismiss = async (reportIds) => {
  const adminNote = prompt('Enter reason for bulk dismissal:');
  
  const response = await fetch('/api/admin/reports/bulk-dismiss', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reportIds, adminNote })
  });

  const result = await response.json();
  alert(`Successfully dismissed ${result.totalDismissed} reports`);
  refreshReports();
};
```

---

### 5. All Comments View with Flagged Indicators

```javascript
// Fetch comments with flagged indicators
const fetchCommentsWithFlags = async (storyId) => {
  const response = await fetch(`/api/story/${storyId}/comments/admin`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  
  return await response.json();
};

// Usage:
const commentsData = await fetchCommentsWithFlags(67);
```

### Comment Display with Flag Warning:

```jsx
{commentsData.comments.map(comment => (
  <CommentCard key={comment.id}>
    {/* Show warning banner if flagged */}
    {comment.isFlagged && (
      <FlaggedWarning className="red-banner">
        ⚠️ Flagged for Review - Potentially {getCategoryFromReport(comment.id)}
        <QuickDeleteButton onClick={() => quickDeleteComment(comment.id)}>
          🗑️ Delete
        </QuickDeleteButton>
      </FlaggedWarning>
    )}
    
    <CommentContent>
      <Author>{comment.commenterName}</Author>
      <Text>{comment.content}</Text>
      <TimeAgo>{comment.timeAgo}</TimeAgo>
    </CommentContent>
    
    {/* Nested replies */}
    {comment.replies.map(reply => (
      <Reply key={reply.id} isFlagged={reply.isFlagged}>
        {/* Similar structure */}
      </Reply>
    ))}
  </CommentCard>
))}
```

---

### 6. Quick Delete Comment

```javascript
const quickDeleteComment = async (commentId) => {
  const reason = prompt('Enter reason for deletion:');
  
  if (!reason) return;
  
  const response = await fetch(`/api/admin/reports/comment/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });

  const result = await response.json();
  
  if (result.success) {
    alert('Comment deleted successfully');
    refreshComments();
  }
};
```

---

### 7. Get Flagged Comments for a Story

```javascript
const getFlaggedComments = async (storyId) => {
  const response = await fetch(`/api/admin/reports/story/${storyId}/flagged-comments`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  
  const data = await response.json();
  
  // Returns:
  // {
  //   storyId: 67,
  //   flaggedCommentIds: [128, 129],
  //   totalFlagged: 2,
  //   reports: [ /* array of reports */ ]
  // }
  
  return data;
};
```

---

## Status Badge Colors

```css
.status-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 600;
}

.status-pending {
  background-color: #ff9800; /* Orange */
  color: white;
}

.status-reviewed {
  background-color: #4caf50; /* Green */
  color: white;
}

.status-dismissed {
  background-color: #9e9e9e; /* Grey */
  color: white;
}
```

## Category Badge Colors

```css
.category-spam { background-color: #f44336; }
.category-harassment { background-color: #e91e63; }
.category-misinformation { background-color: #ff5722; }
.category-inappropriate { background-color: #ff9800; }
.category-abusive { background-color: #d32f2f; }
.category-other { background-color: #757575; }
```

---

## Error Handling

```javascript
const handleApiError = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    
    switch (response.status) {
      case 401:
        alert('Session expired. Please login again.');
        window.location.href = '/login';
        break;
      case 403:
        alert('You do not have permission to perform this action.');
        break;
      case 404:
        alert('Report not found. It may have been deleted.');
        break;
      default:
        alert(error.message || 'An error occurred');
    }
    
    return null;
  }
  
  return await response.json();
};

// Usage:
const result = await handleApiError(response);
if (result) {
  // Process successful response
}
```

---

## Filter & Sort UI

```javascript
const ReportsFilter = () => {
  const [status, setStatus] = useState('Pending');
  const [category, setCategory] = useState('All');
  
  return (
    <FilterBar>
      <Select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All Statuses</option>
        <option value="Pending">Pending Review</option>
        <option value="Reviewed">Reviewed</option>
        <option value="Dismissed">Dismissed</option>
      </Select>
      
      <Select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="All">All Categories</option>
        <option value="Spam">Spam</option>
        <option value="Harassment">Harassment</option>
        <option value="Misinformation">Misinformation</option>
        <option value="InappropriateContent">Inappropriate Content</option>
        <option value="Abusive">Abusive</option>
        <option value="Other">Other</option>
      </Select>
    </FilterBar>
  );
};
```

---

## Real-time Updates (Optional)

```javascript
// Poll for new reports every 30 seconds
useEffect(() => {
  const interval = setInterval(async () => {
    const stats = await fetchStatistics();
    if (stats.pendingReview > prevPendingCount) {
      showNotification(`${stats.pendingReview - prevPendingCount} new report(s)`);
    }
    setPrevPendingCount(stats.pendingReview);
  }, 30000);
  
  return () => clearInterval(interval);
}, [prevPendingCount]);
```

---

## Testing Checklist

- [ ] Statistics cards display correctly
- [ ] Reports list loads with proper filtering
- [ ] Report cards show all required information
- [ ] "View Content" navigates to correct story
- [ ] "Delete Content" removes content and updates report
- [ ] "Mark Reviewed" changes status without deletion
- [ ] "Dismiss" clears report from pending queue
- [ ] Bulk operations work on multiple reports
- [ ] Flagged comments show warning banners
- [ ] Quick delete removes comments immediately
- [ ] Error messages display for invalid actions
- [ ] Admin-only access is enforced

---

## Sample Complete React Component

```jsx
import { useState, useEffect } from 'react';

const ReportsManagement = () => {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    const [statsData, reportsData] = await Promise.all([
      fetchStatistics(),
      fetchReports(filter)
    ]);
    setStats(statsData);
    setReports(reportsData);
    setLoading(false);
  };

  const fetchStatistics = async () => {
    const response = await fetch('/api/admin/reports/statistics', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    });
    return response.json();
  };

  const fetchReports = async (status) => {
    const url = status 
      ? `/api/admin/reports?status=${status}`
      : '/api/admin/reports';
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
    });
    return response.json();
  };

  const handleDeleteContent = async (reportId) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    const adminNote = prompt('Enter admin note:');
    
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/delete-content`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminNote })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Content deleted successfully');
        loadData();
      }
    } catch (error) {
      alert('Failed to delete content');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="reports-management">
      {/* Statistics Cards */}
      <StatsGrid>
        <StatCard color="blue">
          <h3>Total Reports</h3>
          <p>{stats.totalReports}</p>
        </StatCard>
        <StatCard color="orange" highlighted>
          <h3>Pending Review</h3>
          <p>{stats.pendingReview}</p>
        </StatCard>
        <StatCard color="green">
          <h3>Reviewed</h3>
          <p>{stats.reviewed}</p>
        </StatCard>
        <StatCard color="grey">
          <h3>Dismissed</h3>
          <p>{stats.dismissed}</p>
        </StatCard>
      </StatsGrid>

      {/* Filter */}
      <FilterBar>
        <button onClick={() => setFilter(null)}>All</button>
        <button onClick={() => setFilter('Pending')}>Pending</button>
        <button onClick={() => setFilter('Reviewed')}>Reviewed</button>
        <button onClick={() => setFilter('Dismissed')}>Dismissed</button>
      </FilterBar>

      {/* Reports List */}
      <ReportsList>
        {reports.map(report => (
          <ReportCard key={report.id}>
            <ReportHeader>
              <span>{report.reporterName}</span>
              <span>{report.timeAgo}</span>
              <StatusBadge status={report.status}>{report.category}</StatusBadge>
            </ReportHeader>
            
            <SourceLink href={`/story/${report.storyId}`}>
              In story: "{report.storyTitle}"
            </SourceLink>
            
            <OffendingContent>
              <strong>Content by {report.targetAuthorName}:</strong>
              <p>{report.targetContentSnapshot}</p>
            </OffendingContent>
            
            <Reason>
              <strong>Reason:</strong> {report.reason}
            </Reason>
            
            <Actions>
              <button onClick={() => window.location.href = `/story/${report.storyId}`}>
                View Content
              </button>
              <button onClick={() => handleDeleteContent(report.id)}>
                Delete Content
              </button>
              <button onClick={() => handleMarkReviewed(report.id)}>
                Mark Reviewed
              </button>
              <button onClick={() => handleDismiss(report.id)}>
                Dismiss
              </button>
            </Actions>
          </ReportCard>
        ))}
      </ReportsList>
    </div>
  );
};

export default ReportsManagement;
```

---

**Last Updated:** March 19, 2026  
**Version:** 1.0
