// Shared mock data for the admin reports flow.

export const MOCK_REPORTS = [
  {
    id: "r1",
    reportedBy: "Sarah M.",
    reporterAvatar: "https://i.pravatar.cc/150?u=sarah",
    reporterTime: "2 hours ago",
    status: "Pending",
    category: "Spam",
    contentType: "Comment",
    storyTitle: "Nutrition Changes That Transformed My Health",
    storyId: 9,
    contentAuthor: "John Spammer",
    contentText:
      '"Buy cheap supplements at www.example.com! Use code SAVE50 for discount!"',
    reportReason:
      "This comment contains promotional content and links to external websites selling products.",
  },
  {
    id: "r2",
    reportedBy: "Dr. Ahmed Hassan",
    reporterAvatar: "https://i.pravatar.cc/150?u=ahmed",
    reporterTime: "5 hours ago",
    status: "Pending",
    category: "Misinformation",
    contentType: "Story",
    storyTitle: "Nutrition Changes That Transformed My Health",
    storyId: 9,
    contentAuthor: "Mike Johnson",
    contentText:
      '"How I Cured My Diabetes by Eating Only Fruits - No Medicine Needed!"',
    reportReason:
      "This story contains medical advice that contradicts established medical guidelines and could be harmful.",
  },
  {
    id: "r3",
    reportedBy: "Fatima Ali",
    reporterAvatar: "https://i.pravatar.cc/150?u=fatima",
    reporterTime: "1 day ago",
    status: "Pending",
    category: "Harassment",
    contentType: "Reply",
    storyTitle: "Managing Stress Through Mindfulness",
    storyId: 8,
    contentAuthor: "Angry User",
    contentText:
      '"You are completely wrong and stupid. People like you should not be allowed to comment."',
    reportReason:
      "This reply contains personal attacks and offensive language directed at another user.",
  },
  {
    id: "r4",
    reportedBy: "Omar Khaled",
    reporterAvatar: null,
    reporterTime: "2 days ago",
    status: "Reviewed",
    category: "Inappropriate Content",
    contentType: "Comment",
    storyTitle: "Sleep Quality Changed Everything",
    storyId: 3,
    contentAuthor: "Negative Nancy",
    contentText:
      '"This platform is garbage. Everyone here is fake and doctors do not know anything."',
    reportReason:
      "Contains inappropriate language and off-topic content not related to health.",
  },
  {
    id: "r5",
    reportedBy: "Dr. Layla Ibrahim",
    reporterAvatar: "https://i.pravatar.cc/150?u=layla",
    reporterTime: "3 days ago",
    status: "Dismissed",
    category: "Spam",
    contentType: "Comment",
    storyTitle: "How Exercise Became My Medicine",
    storyId: 6,
    contentAuthor: "Spam Bot",
    contentText: '"Check out my health blog for more tips! Link in bio!"',
    reportReason:
      "Repeated posting of the same message across multiple stories.",
  },
  {
    id: "r6",
    reportedBy: "Nour Hassan",
    reporterAvatar: null,
    reporterTime: "4 days ago",
    status: "Reviewed",
    category: "Other",
    contentType: "Reply",
    storyTitle: "Nutrition Changes That Transformed My Health",
    storyId: 9,
    contentAuthor: "Fake Doctor",
    contentText:
      '"As a doctor, I recommend you stop taking your prescribed medication immediately."',
    reportReason:
      "User is impersonating a medical professional without credentials.",
  },
];
