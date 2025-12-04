import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/lib/constants';

export interface Project {
  _id: string;
  name: string;
  description: string;
  folderId: string;
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
  status: 'active' | 'archived' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  description: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const projectApi = {
  getProjectsByFolder: async (folderId: string): Promise<ApiResponse<Project[]>> => {
    const response = await apiClient.get<ApiResponse<Project[]>>(
      API_ENDPOINTS.PROJECTS.BY_FOLDER(folderId)
    );
    return response.data;
  },

  getProjectById: async (id: string): Promise<ApiResponse<Project>> => {
    const response = await apiClient.get<ApiResponse<Project>>(
      `${API_ENDPOINTS.PROJECTS.BASE}/${id}`
    );
    return response.data;
  },

  createProject: async (
    folderId: string,
    data: CreateProjectData
  ): Promise<ApiResponse<Project>> => {
    const response = await apiClient.post<ApiResponse<Project>>(
      API_ENDPOINTS.PROJECTS.BY_FOLDER(folderId),
      data
    );
    return response.data;
  },

  updateProject: async (
    id: string,
    data: UpdateProjectData
  ): Promise<ApiResponse<Project>> => {
    const response = await apiClient.put<ApiResponse<Project>>(
      `${API_ENDPOINTS.PROJECTS.BASE}/${id}`,
      data
    );
    return response.data;
  },

  deleteProject: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `${API_ENDPOINTS.PROJECTS.BASE}/${id}`
    );
    return response.data;
  },
};

