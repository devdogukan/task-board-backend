import { create } from 'zustand';
import {
  columnApi,
  type Column,
  type CreateColumnData,
  type UpdateColumnData,
} from '@/api/column.api';

interface ColumnState {
  columns: Record<string, Column[]>; // projectId -> columns
  isLoading: boolean;
  error: string | null;
}

interface ColumnActions {
  fetchColumnsByProject: (projectId: string) => Promise<void>;
  createColumn: (projectId: string, data: CreateColumnData) => Promise<void>;
  updateColumn: (columnId: string, data: UpdateColumnData) => Promise<void>;
  deleteColumn: (columnId: string, projectId: string) => Promise<void>;
  reorderColumn: (columnId: string, orderIndex: number) => Promise<void>;
  clearError: () => void;
}

type ColumnStore = ColumnState & ColumnActions;

export const useColumnStore = create<ColumnStore>((set, get) => ({
  // Initial state
  columns: {},
  isLoading: false,
  error: null,

  // Actions
  fetchColumnsByProject: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await columnApi.getColumnsByProject(projectId);
      set((state) => ({
        columns: {
          ...state.columns,
          [projectId]: response.data,
        },
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch columns';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  createColumn: async (projectId: string, data: CreateColumnData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await columnApi.createColumn(projectId, data);
      set((state) => ({
        columns: {
          ...state.columns,
          [projectId]: [...(state.columns[projectId] || []), response.data],
        },
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to create column';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  updateColumn: async (columnId: string, data: UpdateColumnData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await columnApi.updateColumn(columnId, data);
      set((state) => {
        const updatedColumns: Record<string, Column[]> = {};
        Object.keys(state.columns).forEach((projectId) => {
          updatedColumns[projectId] = state.columns[projectId].map((column) =>
            column._id === columnId ? response.data : column
          );
        });
        return {
          columns: updatedColumns,
          isLoading: false,
          error: null,
        };
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update column';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  deleteColumn: async (columnId: string, projectId: string) => {
    try {
      set({ isLoading: true, error: null });
      await columnApi.deleteColumn(columnId);
      set((state) => ({
        columns: {
          ...state.columns,
          [projectId]: (state.columns[projectId] || []).filter(
            (column) => column._id !== columnId
          ),
        },
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete column';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  reorderColumn: async (columnId: string, orderIndex: number) => {
    try {
      set({ isLoading: true, error: null });
      await columnApi.reorderColumn(columnId, orderIndex);
      
      // Find which project this column belongs to
      const state = get();
      let projectId: string | null = null;
      for (const [pid, columns] of Object.entries(state.columns)) {
        if (columns.some((col) => col._id === columnId)) {
          projectId = pid;
          break;
        }
      }

      if (projectId) {
        // Refetch columns to get correct order
        await get().fetchColumnsByProject(projectId);
      }
      
      set({ isLoading: false, error: null });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to reorder column';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

