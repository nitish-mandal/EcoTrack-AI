import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const auth = localStorage.getItem('ecotrack-auth');
    if (auth) {
      const { state } = JSON.parse(auth);
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('ecotrack-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) => api.post('/auth/reset-password', data),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  getMe: () => api.get('/auth/me'),
};

// Carbon
export const carbonAPI = {
  calculate: (data: object) => api.post('/carbon/calculate', data),
  getHistory: (page = 1) => api.get(`/carbon/history?page=${page}`),
  getSummary: () => api.get('/carbon/summary'),
};

// Dashboard
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

// Goals
export const goalsAPI = {
  getAll: () => api.get('/goals'),
  create: (data: object) => api.post('/goals', data),
  update: (id: string, data: object) => api.put(`/goals/${id}`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
  updateProgress: (id: string, current: number) => api.patch(`/goals/${id}/progress`, { current }),
};

// Challenges
export const challengesAPI = {
  getAll: () => api.get('/challenges'),
  join: (id: string) => api.post(`/challenges/${id}/join`),
  complete: (id: string) => api.post(`/challenges/${id}/complete`),
};

// Leaderboard
export const leaderboardAPI = {
  global: () => api.get('/leaderboard/global'),
  city: () => api.get('/leaderboard/city'),
};

// Trees
export const treesAPI = {
  getAll: () => api.get('/trees'),
  add: (data: FormData) => api.post('/trees', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// AI
export const aiAPI = {
  getDailyTip: () => api.get('/ai/tip'),
  getHistory: () => api.get('/ai/history'),
  predict: (data: object) => api.post('/ai/predict', data),
};

// Community
export const communityAPI = {
  getPosts: () => api.get('/community/posts'),
  createPost: (data: object) => api.post('/community/posts', data),
  like: (id: string) => api.post(`/community/posts/${id}/like`),
  comment: (id: string, content: string) => api.post(`/community/posts/${id}/comment`, { content }),
};

// Learning
export const learningAPI = {
  getAll: () => api.get('/learning'),
  getByTopic: (topic: string) => api.get(`/learning/${topic}`),
  submitQuiz: (contentId: string, answers: number[]) => api.post('/learning/quiz/submit', { contentId, answers }),
};

// Reports
export const reportsAPI = {
  get: (period: 'weekly' | 'monthly' | 'annual') => api.get(`/reports?period=${period}`),
};

// Notifications
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// Admin
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  updateRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  getAnalytics: () => api.get('/admin/analytics'),
  createContent: (data: object) => api.post('/admin/content', data),
};

// Profile
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data: object) => api.put('/profile', data),
};

export default api;
