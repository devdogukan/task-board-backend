import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/lib/constants';

export interface Column {
  _id: string;
  projectId: string | {
    _id: string;
    name: string;
  };
  name: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateColumnData {
  name: string;
}

export interface UpdateColumnData {
  name?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const columnApi = {
  getColumnsByProject: async (projectId: string): Promise<ApiResponse<Column[]>> => {
    const response = await apiClient.get<ApiResponse<Column[]>>(
      `${API_ENDPOINTS.COLUMNS.BY_PROJECT(projectId)}`
    );
    return response.data;
  },

  getColumnById: async (id: string): Promise<ApiResponse<Column>> => {
    const response = await apiClient.get<ApiResponse<Column>>(
      `${API_ENDPOINTS.COLUMNS.BASE}/${id}`
    );
    return response.data;
  },

  createColumn: async (
    projectId: string,
    data: CreateColumnData
  ): Promise<ApiResponse<Column>> => {
    const response = await apiClient.post<ApiResponse<Column>>(
      `${API_ENDPOINTS.COLUMNS.BY_PROJECT(projectId)}`,
      data
    );
    return response.data;
  },

  updateColumn: async (
    id: string,
    data: UpdateColumnData
  ): Promise<ApiResponse<Column>> => {
    const response = await apiClient.put<ApiResponse<Column>>(
      `${API_ENDPOINTS.COLUMNS.BASE}/${id}`,
      data
    );
    return response.data;
  },

  deleteColumn: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `${API_ENDPOINTS.COLUMNS.BASE}/${id}`
    );
    return response.data;
  },

  reorderColumn: async (
    id: string,
    orderIndex: number
  ): Promise<ApiResponse<Column>> => {
    const response = await apiClient.patch<ApiResponse<Column>>(
      `${API_ENDPOINTS.COLUMNS.BASE}/${id}/reorder`,
      { orderIndex }
    );
    return response.data;
  },
};

