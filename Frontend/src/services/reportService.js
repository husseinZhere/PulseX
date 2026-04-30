import api from '../utils/api';

export const reportStory = (storyId, payload) =>
  api.post(`/api/Reports/stories/${storyId}`, payload).then((r) => r.data);

export const reportComment = (commentId, payload) =>
  api.post(`/api/Reports/comments/${commentId}`, payload).then((r) => r.data);

export const getAllReports = (status) =>
  api
    .get('/api/Reports', status ? { params: { status } } : undefined)
    .then((r) => r.data);

export const getReportStatistics = () =>
  api.get('/api/Reports/statistics').then((r) => r.data);

export const updateReportStatus = (reportId, payload) =>
  api.put(`/api/Reports/${reportId}/status`, payload).then((r) => r.data);
