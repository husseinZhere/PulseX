import api from '../utils/api';

export const createStory = (payload, coverImage) => {
  const form = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v != null && v !== '') form.append(k, v);
  });
  if (coverImage) form.append('coverImage', coverImage);
  return api
    .post('/api/Story/create', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const getPublishedStories = (params = {}) =>
  api.get('/api/Story/published', { params }).then((r) => r.data);

export const getStoryDetail = (storyId) =>
  api.get(`/api/Story/${storyId}`).then((r) => r.data);

export const getAllComments = (storyId) =>
  api.get(`/api/Story/${storyId}/comments`).then((r) => r.data);

export const getAllCommentsAdmin = (storyId) =>
  api.get(`/api/Story/${storyId}/comments/admin`).then((r) => r.data);

export const addComment = (storyId, payload) =>
  api.post(`/api/Story/${storyId}/comments`, payload).then((r) => r.data);

export const replyToComment = (storyId, commentId, payload) =>
  api.post(`/api/Story/${storyId}/comments/${commentId}/reply`, payload).then((r) => r.data);

export const likeComment = (storyId, commentId) =>
  api.post(`/api/Story/${storyId}/comments/${commentId}/like`).then((r) => r.data);

export const likeStory = (storyId) =>
  api.post(`/api/Story/${storyId}/like`).then((r) => r.data);

export const shareStory = (storyId) =>
  api.post(`/api/Story/${storyId}/share`).then((r) => r.data);

export const getMyStories = () =>
  api.get('/api/Story/my-stories').then((r) => r.data);

export const deleteMyStory = (storyId) =>
  api.delete(`/api/Story/${storyId}/mine`).then((r) => r.data);

export const getAllStoriesAdmin = () =>
  api.get('/api/Story/all').then((r) => r.data);

export const hideStoryAdmin = (storyId) =>
  api.put(`/api/Story/hide/${storyId}`).then((r) => r.data);

export const deleteStoryAdmin = (storyId) =>
  api.delete(`/api/Story/${storyId}`).then((r) => r.data);
