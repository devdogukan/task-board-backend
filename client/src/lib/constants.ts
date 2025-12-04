export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    ME: '/auth/me',
  },
  FOLDERS: {
    BASE: '/folders',
  },
  PROJECTS: {
    BASE: '/projects',
    BY_FOLDER: (folderId: string) => `/projects/folders/${folderId}/projects`,
  },
  USERS: {
    BASE: '/users',
  },
  COLUMNS: {
    BASE: '/columns',
    BY_PROJECT: (projectId: string) => `/columns/projects/${projectId}/columns`,
  },
  TASKS: {
    BASE: '/tasks',
    BY_PROJECT: (projectId: string) => `/tasks/projects/${projectId}/tasks`,
  },
} as const;

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/',
  PROJECT_DETAIL: '/projects',
  FOLDER_DETAIL: '/folders',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
} as const;

