import { create } from 'zustand';
import { folderApi, type Folder, type CreateFolderData, type UpdateFolderData } from '@/api/folder.api';
import { projectApi, type Project, type CreateProjectData, type UpdateProjectData } from '@/api/project.api';

interface FolderState {
  folders: Folder[];
  folderProjects: Record<string, Project[]>; // folderId -> projects
  expandedFolders: string[]; // folderId'ler
  selectedFolder: string | null;
  isLoading: boolean;
  error: string | null;
}

interface FolderActions {
  fetchFolders: () => Promise<void>;
  fetchProjectsByFolder: (folderId: string) => Promise<void>;
  createFolder: (data: CreateFolderData) => Promise<void>;
  updateFolder: (id: string, data: UpdateFolderData) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  addMemberToFolder: (folderId: string, memberId: string) => Promise<void>;
  removeMemberFromFolder: (folderId: string, userId: string) => Promise<void>;
  getFolderById: (id: string) => Promise<Folder>;
  createProject: (folderId: string, data: CreateProjectData) => Promise<void>;
  updateProject: (id: string, data: UpdateProjectData) => Promise<void>;
  deleteProject: (id: string, folderId: string) => Promise<void>;
  fetchProjectById: (id: string) => Promise<Project>;
  setSelectedFolder: (folderId: string | null) => void;
  toggleFolderExpanded: (folderId: string) => void;
  clearError: () => void;
}

type FolderStore = FolderState & FolderActions;

export const useFolderStore = create<FolderStore>((set, get) => ({
  // Initial state
  folders: [],
  folderProjects: {},
  expandedFolders: [],
  selectedFolder: null,
  isLoading: false,
  error: null,

  // Actions
  fetchFolders: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await folderApi.getFolders();
      set({
        folders: response.data,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch folders';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  fetchProjectsByFolder: async (folderId: string) => {
    try {
      const response = await projectApi.getProjectsByFolder(folderId);
      set((state) => ({
        folderProjects: {
          ...state.folderProjects,
          [folderId]: response.data,
        },
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch projects';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  createFolder: async (data: CreateFolderData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await folderApi.createFolder(data);
      set((state) => ({
        folders: [response.data, ...state.folders],
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to create folder';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  updateFolder: async (id: string, data: UpdateFolderData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await folderApi.updateFolder(id, data);
      set((state) => ({
        folders: state.folders.map((folder) =>
          folder._id === id ? response.data : folder
        ),
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update folder';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  deleteFolder: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await folderApi.deleteFolder(id);
      set((state) => {
        const { [id]: deleted, ...remainingProjects } = state.folderProjects;
        
        return {
          folders: state.folders.filter((folder) => folder._id !== id),
          folderProjects: remainingProjects,
          expandedFolders: state.expandedFolders.filter((folderId) => folderId !== id),
          selectedFolder: state.selectedFolder === id ? null : state.selectedFolder,
          isLoading: false,
          error: null,
        };
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete folder';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  addMemberToFolder: async (folderId: string, memberId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await folderApi.addMember(folderId, memberId);
      set((state) => ({
        folders: state.folders.map((folder) =>
          folder._id === folderId ? response.data : folder
        ),
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to add member';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  removeMemberFromFolder: async (folderId: string, userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await folderApi.removeMember(folderId, userId);
      set((state) => ({
        folders: state.folders.map((folder) =>
          folder._id === folderId ? response.data : folder
        ),
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to remove member';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  getFolderById: async (id: string): Promise<Folder> => {
    try {
      const response = await folderApi.getFolderById(id);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch folder';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  setSelectedFolder: (folderId: string | null) => {
    set({ selectedFolder: folderId });
  },

  toggleFolderExpanded: (folderId: string) => {
    set((state) => {
      const isExpanded = state.expandedFolders.includes(folderId);
      const newExpanded = isExpanded
        ? state.expandedFolders.filter((id) => id !== folderId)
        : [...state.expandedFolders, folderId];
      
      // Fetch projects when expanding
      if (!isExpanded) {
        get().fetchProjectsByFolder(folderId).catch(() => {
          // Error handling is done in fetchProjectsByFolder
        });
      }
      
      return { expandedFolders: newExpanded };
    });
  },

  createProject: async (folderId: string, data: CreateProjectData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await projectApi.createProject(folderId, data);
      
      // Validate that response.data exists and is a valid Project object
      if (!response.data || !response.data._id) {
        throw new Error('Invalid project data received from server');
      }
      
      set((state) => ({
        folderProjects: {
          ...state.folderProjects,
          [folderId]: [...(state.folderProjects[folderId] || []), response.data],
        },
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create project';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  updateProject: async (id: string, data: UpdateProjectData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await projectApi.updateProject(id, data);
      set((state) => {
        const updatedProjects: Record<string, Project[]> = {};
        Object.keys(state.folderProjects).forEach((folderId) => {
          updatedProjects[folderId] = state.folderProjects[folderId].map((project) =>
            project._id === id ? response.data : project
          );
        });
        return {
          folderProjects: updatedProjects,
          isLoading: false,
          error: null,
        };
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update project';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  deleteProject: async (id: string, folderId: string) => {
    try {
      set({ isLoading: true, error: null });
      await projectApi.deleteProject(id);
      set((state) => ({
        folderProjects: {
          ...state.folderProjects,
          [folderId]: (state.folderProjects[folderId] || []).filter(
            (project) => project._id !== id
          ),
        },
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete project';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  fetchProjectById: async (id: string): Promise<Project> => {
    try {
      const response = await projectApi.getProjectById(id);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch project';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

