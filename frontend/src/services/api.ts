import axios from 'axios';
import type { User, Book, UserPreferences, UserStatistics, ReadingSession, ReadingGoal, Bookmark } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (email: string, username: string, password: string) =>
    api.post<{ user: User; token: string }>('/auth/register', { email, username, password }),
  
  login: (email: string, password: string) =>
    api.post<{ user: User; token: string }>('/auth/login', { email, password }),
  
  getMe: () =>
    api.get<{ user: User }>('/auth/me'),
};

export const booksAPI = {
  upload: (formData: FormData) =>
    api.post<{ book: Book }>('/books/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  getAll: () =>
    api.get<{ books: Book[] }>('/books'),
  
  getOne: (id: number) =>
    api.get<{ book: Book }>(`/books/${id}`),
  
  delete: (id: number) =>
    api.delete(`/books/${id}`),
  
  updateProgress: (id: number, currentPosition: number, completed: boolean) =>
    api.put(`/books/${id}/progress`, { currentPosition, completed }),
};

export const preferencesAPI = {
  get: () =>
    api.get<{ preferences: UserPreferences }>('/preferences'),
  
  update: (preferences: Partial<UserPreferences>) =>
    api.put<{ preferences: UserPreferences }>('/preferences', preferences),
};

export const statisticsAPI = {
  get: () =>
    api.get<{
      statistics: UserStatistics;
      recentSessions: ReadingSession[];
      goals: ReadingGoal[];
    }>('/statistics'),
  
  createSession: (session: {
    book_id: number;
    start_time: string;
    end_time: string;
    words_read: number;
    average_wpm: number;
  }) =>
    api.post<{ session: ReadingSession }>('/statistics/sessions', session),
  
  createGoal: (goal: {
    goal_type: string;
    target_value: number;
    period: string;
    start_date: string;
    end_date: string;
  }) =>
    api.post<{ goal: ReadingGoal }>('/statistics/goals', goal),
  
  getGoals: () =>
    api.get<{ goals: ReadingGoal[] }>('/statistics/goals'),
  
  updateGoalProgress: (id: number, current_value: number, completed: boolean) =>
    api.put(`/statistics/goals/${id}`, { current_value, completed }),
  
  updateGoal: (id: number, goal: {
    goal_type: string;
    target_value: number;
    period: string;
    start_date: string;
    end_date: string;
  }) =>
    api.put(`/statistics/goals/${id}/update`, goal),
  
  deleteGoal: (id: number) =>
    api.delete(`/statistics/goals/${id}`),
};

export const bookmarksAPI = {
  create: (bookmark: { book_id: number; word_position: number; note?: string }) =>
    api.post<{ bookmark: Bookmark }>('/bookmarks', bookmark),
  
  getAll: (bookId?: number) =>
    api.get<{ bookmarks: Bookmark[] }>('/bookmarks', { params: { book_id: bookId } }),
  
  update: (id: number, bookmark: { note: string }) =>
    api.put(`/bookmarks/${id}`, bookmark),
  
  delete: (id: number) =>
    api.delete(`/bookmarks/${id}`),
};

export default api;
