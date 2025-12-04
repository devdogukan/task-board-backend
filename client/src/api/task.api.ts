import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/lib/constants';
import type { User } from '@/api/user.api';

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface Task {
  _id: string;
  columnId: string | {
    _id: string;
    name: string;
    orderIndex: number;
  };
  projectId: string | {
    _id: string;
    name: string;
  };
  title: string;
  description: string;
  orderIndex: number;
  assignees: User[];
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetTasksQueryParams {
  columnId?: string;
  assigneeId?: string;
  priority?: TaskPriority;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface CreateTaskData {
  columnId: string;
  title: string;
  description: string;
  priority?: TaskPriority;
  dueDate?: string | null;
  assignees?: string[];
}

export interface UpdateTaskData {
  columnId?: string;
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string | null;
  assignees?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const taskApi = {
  getTasksByProject: async (
    projectId: string,
    queryParams?: GetTasksQueryParams
  ): Promise<ApiResponse<Task[]>> => {
    const response = await apiClient.get<ApiResponse<Task[]>>(
      `${API_ENDPOINTS.TASKS.BY_PROJECT(projectId)}`,
      { params: queryParams }
    );
    return response.data;
  },

  getTaskById: async (id: string): Promise<ApiResponse<Task>> => {
    const response = await apiClient.get<ApiResponse<Task>>(
      `${API_ENDPOINTS.TASKS.BASE}/${id}`
    );
    return response.data;
  },

  createTask: async (
    projectId: string,
    data: CreateTaskData
  ): Promise<ApiResponse<Task>> => {
    const response = await apiClient.post<ApiResponse<Task>>(
      `${API_ENDPOINTS.TASKS.BY_PROJECT(projectId)}`,
      data
    );
    return response.data;
  },

  updateTask: async (
    id: string,
    data: UpdateTaskData
  ): Promise<ApiResponse<Task>> => {
    const response = await apiClient.put<ApiResponse<Task>>(
      `${API_ENDPOINTS.TASKS.BASE}/${id}`,
      data
    );
    return response.data;
  },

  deleteTask: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `${API_ENDPOINTS.TASKS.BASE}/${id}`
    );
    return response.data;
  },

  moveTask: async (
    id: string,
    columnId: string
  ): Promise<ApiResponse<Task>> => {
    const response = await apiClient.patch<ApiResponse<Task>>(
      `${API_ENDPOINTS.TASKS.BASE}/${id}/move`,
      { columnId }
    );
    return response.data;
  },

  reorderTask: async (
    id: string,
    orderIndex: number
  ): Promise<ApiResponse<Task>> => {
    const response = await apiClient.patch<ApiResponse<Task>>(
      `${API_ENDPOINTS.TASKS.BASE}/${id}/reorder`,
      { orderIndex }
    );
    return response.data;
  },

  addAssignee: async (
    id: string,
    assigneeId: string
  ): Promise<ApiResponse<Task>> => {
    const response = await apiClient.post<ApiResponse<Task>>(
      `${API_ENDPOINTS.TASKS.BASE}/${id}/assignees`,
      { assigneeId }
    );
    return response.data;
  },

  removeAssignee: async (
    id: string,
    userId: string
  ): Promise<ApiResponse<Task>> => {
    const response = await apiClient.delete<ApiResponse<Task>>(
      `${API_ENDPOINTS.TASKS.BASE}/${id}/assignees/${userId}`
    );
    return response.data;
  },
};

