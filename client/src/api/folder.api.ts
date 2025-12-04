import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/lib/constants';

export interface Folder {
  _id: string;
  name: string;
  description: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string | null;
  };
  members: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFolderData {
  name: string;
  description: string;
}

export interface UpdateFolderData {
  name?: string;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const folderApi = {
  getFolders: async (): Promise<ApiResponse<Folder[]>> => {
    const response = await apiClient.get<ApiResponse<Folder[]>>(
      API_ENDPOINTS.FOLDERS.BASE
    );
    return response.data;
  },

  getFolderById: async (id: string): Promise<ApiResponse<Folder>> => {
    const response = await apiClient.get<ApiResponse<Folder>>(
      `${API_ENDPOINTS.FOLDERS.BASE}/${id}`
    );
    return response.data;
  },

  createFolder: async (data: CreateFolderData): Promise<ApiResponse<Folder>> => {
    const response = await apiClient.post<ApiResponse<Folder>>(
      API_ENDPOINTS.FOLDERS.BASE,
      data
    );
    return response.data;
  },

  updateFolder: async (
    id: string,
    data: UpdateFolderData
  ): Promise<ApiResponse<Folder>> => {
    const response = await apiClient.put<ApiResponse<Folder>>(
      `${API_ENDPOINTS.FOLDERS.BASE}/${id}`,
      data
    );
    return response.data;
  },

  deleteFolder: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `${API_ENDPOINTS.FOLDERS.BASE}/${id}`
    );
    return response.data;
  },

  addMember: async (
    folderId: string,
    memberId: string
  ): Promise<ApiResponse<Folder>> => {
    const response = await apiClient.post<ApiResponse<Folder>>(
      `${API_ENDPOINTS.FOLDERS.BASE}/${folderId}/members`,
      { memberId }
    );
    return response.data;
  },

  removeMember: async (
    folderId: string,
    userId: string
  ): Promise<ApiResponse<Folder>> => {
    const response = await apiClient.delete<ApiResponse<Folder>>(
      `${API_ENDPOINTS.FOLDERS.BASE}/${folderId}/members/${userId}`
    );
    return response.data;
  },
};

