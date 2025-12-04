import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/lib/constants';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface GetAllUsersParams {
  page?: number;
  limit?: number;
}

export const userApi = {
  getAllUsers: async (params?: GetAllUsersParams): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get<ApiResponse<User[]>>(
      API_ENDPOINTS.USERS.BASE,
      { params }
    );
    return response.data;
  },
};

