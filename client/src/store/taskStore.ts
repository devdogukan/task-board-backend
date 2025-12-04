import { create } from 'zustand';
import {
  taskApi,
  type Task,
  type GetTasksQueryParams,
  type CreateTaskData,
  type UpdateTaskData,
} from '@/api/task.api';
import { getSocket, type Socket } from '@/lib/socket';

interface TaskState {
  tasks: Record<string, Task[]>; // projectId -> tasks
  isLoading: boolean;
  error: string | null;
  socket: Socket | null;
}

interface TaskActions {
  fetchTasksByProject: (
    projectId: string,
    queryParams?: GetTasksQueryParams
  ) => Promise<void>;
  createTask: (projectId: string, taskData: CreateTaskData) => Promise<void>;
  updateTask: (taskId: string, taskData: UpdateTaskData) => Promise<void>;
  deleteTask: (taskId: string, projectId: string) => Promise<void>;
  moveTask: (taskId: string, columnId: string) => Promise<void>;
  reorderTask: (taskId: string, orderIndex: number) => Promise<void>;
  addAssignee: (taskId: string, assigneeId: string) => Promise<void>;
  removeAssignee: (taskId: string, userId: string) => Promise<void>;
  initializeSocket: () => void;
  clearError: () => void;
}

type TaskStore = TaskState & TaskActions;

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: {},
  isLoading: false,
  error: null,
  socket: null,

  // Actions
  initializeSocket: () => {
    const socket = getSocket();
    if (!socket) return;

    const state = get();
    // If socket is already initialized, remove old listeners first
    if (state.socket) {
      state.socket.off('task:created');
      state.socket.off('task:updated');
      state.socket.off('task:deleted');
      state.socket.off('task:moved');
      state.socket.off('task:reordered');
      state.socket.off('task:error');
    }

    set({ socket });

    // Socket event listeners
    socket.on('task:created', ({ task }: { task: Task }) => {
      const projectId = typeof task.projectId === 'string' ? task.projectId : task.projectId._id;
      set((state) => {
        // Check if task already exists to prevent duplicates
        const existingTasks = state.tasks[projectId] || [];
        if (existingTasks.some((t) => t._id === task._id)) {
          return state;
        }
        return {
          tasks: {
            ...state.tasks,
            [projectId]: [...existingTasks, task],
          },
        };
      });
    });

    socket.on('task:updated', ({ task }: { task: Task }) => {
      const projectId = typeof task.projectId === 'string' ? task.projectId : task.projectId._id;
      set((state) => ({
        tasks: {
          ...state.tasks,
          [projectId]: (state.tasks[projectId] || []).map((t) =>
            t._id === task._id ? task : t
          ),
        },
      }));
    });

    socket.on('task:deleted', ({ taskId }: { taskId: string }) => {
      set((state) => {
        const updatedTasks: Record<string, Task[]> = {};
        Object.keys(state.tasks).forEach((projectId) => {
          updatedTasks[projectId] = state.tasks[projectId].filter(
            (t) => t._id !== taskId
          );
        });
        return { tasks: updatedTasks };
      });
    });

    socket.on('task:moved', ({ task }: { task: Task }) => {
      const projectId = typeof task.projectId === 'string' ? task.projectId : task.projectId._id;
      set((state) => ({
        tasks: {
          ...state.tasks,
          [projectId]: (state.tasks[projectId] || []).map((t) =>
            t._id === task._id ? task : t
          ),
        },
      }));
    });

    socket.on('task:reordered', ({ task }: { task: Task }) => {
      const projectId = typeof task.projectId === 'string' ? task.projectId : task.projectId._id;
      set((state) => ({
        tasks: {
          ...state.tasks,
          [projectId]: (state.tasks[projectId] || []).map((t) =>
            t._id === task._id ? task : t
          ),
        },
      }));
    });

    socket.on('task:error', ({ message }: { message: string }) => {
      set({ error: message });
    });
  },

  fetchTasksByProject: async (
    projectId: string,
    queryParams?: GetTasksQueryParams
  ) => {
    try {
      set({ isLoading: true, error: null });
      const response = await taskApi.getTasksByProject(projectId, queryParams);
      set((state) => ({
        tasks: {
          ...state.tasks,
          [projectId]: response.data,
        },
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch tasks';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  createTask: async (projectId: string, taskData: CreateTaskData) => {
    try {
      const socket = get().socket;
      if (socket && socket.connected) {
        socket.emit('task:create', { projectId, taskData });
      } else {
        // Fallback to HTTP if socket not connected
        const response = await taskApi.createTask(projectId, taskData);
        const task = response.data;
        set((state) => ({
          tasks: {
            ...state.tasks,
            [projectId]: [...(state.tasks[projectId] || []), task],
          },
        }));
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to create task';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  updateTask: async (taskId: string, taskData: UpdateTaskData) => {
    try {
      const socket = get().socket;
      if (socket && socket.connected) {
        socket.emit('task:update', { taskId, taskData });
      } else {
        // Fallback to HTTP if socket not connected
        const response = await taskApi.updateTask(taskId, taskData);
        const task = response.data;
        const projectId = typeof task.projectId === 'string' ? task.projectId : task.projectId._id;
        set((state) => ({
          tasks: {
            ...state.tasks,
            [projectId]: (state.tasks[projectId] || []).map((t) =>
              t._id === taskId ? task : t
            ),
          },
        }));
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update task';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  deleteTask: async (taskId: string, projectId: string) => {
    try {
      const socket = get().socket;
      if (socket && socket.connected) {
        socket.emit('task:delete', { taskId, projectId });
      } else {
        // Fallback to HTTP if socket not connected
        await taskApi.deleteTask(taskId);
        set((state) => ({
          tasks: {
            ...state.tasks,
            [projectId]: (state.tasks[projectId] || []).filter(
              (t) => t._id !== taskId
            ),
          },
        }));
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete task';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  moveTask: async (taskId: string, columnId: string) => {
    try {
      const socket = get().socket;
      if (socket && socket.connected) {
        socket.emit('task:move', { taskId, columnId });
      } else {
        // Fallback to HTTP if socket not connected
        const response = await taskApi.moveTask(taskId, columnId);
        const task = response.data;
        const projectId = typeof task.projectId === 'string' ? task.projectId : task.projectId._id;
        set((state) => ({
          tasks: {
            ...state.tasks,
            [projectId]: (state.tasks[projectId] || []).map((t) =>
              t._id === taskId ? task : t
            ),
          },
        }));
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to move task';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  reorderTask: async (taskId: string, orderIndex: number) => {
    try {
      const socket = get().socket;
      if (socket && socket.connected) {
        socket.emit('task:reorder', { taskId, orderIndex });
      } else {
        // Fallback to HTTP if socket not connected
        const response = await taskApi.reorderTask(taskId, orderIndex);
        const task = response.data;
        const projectId = typeof task.projectId === 'string' ? task.projectId : task.projectId._id;
        set((state) => ({
          tasks: {
            ...state.tasks,
            [projectId]: (state.tasks[projectId] || []).map((t) =>
              t._id === taskId ? task : t
            ),
          },
        }));
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to reorder task';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  addAssignee: async (taskId: string, assigneeId: string) => {
    try {
      const response = await taskApi.addAssignee(taskId, assigneeId);
      const task = response.data;
      const projectId = typeof task.projectId === 'string' ? task.projectId : task.projectId._id;
      set((state) => ({
        tasks: {
          ...state.tasks,
          [projectId]: (state.tasks[projectId] || []).map((t) =>
            t._id === taskId ? task : t
          ),
        },
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to add assignee';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  removeAssignee: async (taskId: string, userId: string) => {
    try {
      const response = await taskApi.removeAssignee(taskId, userId);
      const task = response.data;
      const projectId = typeof task.projectId === 'string' ? task.projectId : task.projectId._id;
      set((state) => ({
        tasks: {
          ...state.tasks,
          [projectId]: (state.tasks[projectId] || []).map((t) =>
            t._id === taskId ? task : t
          ),
        },
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to remove assignee';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

