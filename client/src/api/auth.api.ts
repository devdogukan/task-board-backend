import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/lib/constants';

export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const authApi = {
  register: async (data: RegisterData): Promise<ApiResponse<User>> => {
    const response = await apiClient.post<ApiResponse<User>>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data;
  },

  login: async (data: LoginData): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    return response.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(
      API_ENDPOINTS.AUTH.LOGOUT
    );
    return response.data;
  },

  refreshToken: async (): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN
    );
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.AUTH.ME
    );
    return response.data;
  },
};

