import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// API functions
export const api = {
  // Start PR analysis
  analyzepr: (repoUrl: string, prNumber: number) =>
    apiClient.post('/analyze-pr', { repoUrl, prNumber }),

  // Get all analyses
  getAnalyses: (limit = 50, skip = 0) =>
    apiClient.get(`/analyses?limit=${limit}&skip=${skip}`),

  // Get single analysis by ID
  getAnalysis: (id: string) =>
    apiClient.get(`/analysis/${id}`),

  // Get analysis status by task ID
  getStatus: (taskId: string) =>
    apiClient.get(`/status/${taskId}`),

  // Get user stats
  getStats: () =>
    apiClient.get('/stats'),

  // Delete analysis
  deleteAnalysis: (id: string) =>
    apiClient.delete(`/analysis/${id}`),
};

export default apiClient;