import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, ChevronDown, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useFolderStore } from '@/store/folderStore';
import { useColumnStore } from '@/store/columnStore';
import { useTaskStore } from '@/store/taskStore';
import ColumnCard from '@/components/ColumnCard';
import ColumnForm from '@/components/ColumnForm';
import TaskForm from '@/components/TaskForm';
import DeleteTaskDialog from '@/components/DeleteTaskDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { userApi } from '@/api/user.api';
import type { User } from '@/api/user.api';
import type { Project } from '@/api/project.api';
import type { Column, CreateColumnData, UpdateColumnData } from '@/api/column.api';
import { TaskPriority } from '@/api/task.api';
import type { Task, CreateTaskData, UpdateTaskData, GetTasksQueryParams } from '@/api/task.api';

function SortableColumn({
  column,
  tasks,
  projectId,
  onTaskClick,
  onCreateTask,
  onTaskDelete,
}: {
  column: Column;
  tasks: Task[];
  projectId: string;
  onTaskClick?: (task: Task) => void;
  onCreateTask?: (columnId: string) => void;
  onTaskDelete?: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: column._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ColumnCard
        column={column}
        tasks={tasks}
        projectId={projectId}
        dragHandleProps={{ ...attributes, ...listeners }}
        onTaskClick={onTaskClick}
        onCreateTask={onCreateTask}
        onTaskDelete={onTaskDelete}
      />
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { fetchProjectById, isLoading: projectLoading } = useFolderStore();
  const {
    columns,
    isLoading: columnsLoading,
    fetchColumnsByProject,
    createColumn,
    reorderColumn,
  } = useColumnStore();
  const {
    tasks,
    isLoading: tasksLoading,
    fetchTasksByProject,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    initializeSocket,
  } = useTaskStore();

  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreateColumnDialogOpen, setIsCreateColumnDialogOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isDeleteTaskDialogOpen, setIsDeleteTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);
  const [defaultColumnId, setDefaultColumnId] = useState<string | undefined>(undefined);
  
  // Filter states
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<TaskPriority | undefined>(undefined);
  const [dueDateFrom, setDueDateFrom] = useState<string>('');
  const [dueDateTo, setDueDateTo] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch users for assignee filter
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userApi.getAllUsers();
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Fetch tasks when filters change
  useEffect(() => {
    if (id) {
      const queryParams: GetTasksQueryParams = {};
      if (assigneeId) queryParams.assigneeId = assigneeId;
      if (priority) queryParams.priority = priority;
      if (dueDateFrom) queryParams.dueDateFrom = dueDateFrom;
      if (dueDateTo) queryParams.dueDateTo = dueDateTo;

      fetchTasksByProject(id, queryParams).catch(() => {
        // Error handling is done in store
      });
    }
  }, [id, assigneeId, priority, dueDateFrom, dueDateTo, fetchTasksByProject]);

  useEffect(() => {
    if (id) {
      fetchProjectById(id)
        .then((data) => {
          setProject(data);
          setError(null);
        })
        .catch((err: Error) => {
          setError(err.message || 'Failed to load project');
        });

      // Fetch columns
      fetchColumnsByProject(id).catch(() => {
        // Error handling is done in store
      });

      // Initialize socket and join project room
      initializeSocket();
      const socket = getSocket();
      if (socket) {
        connectSocket();
        socket.emit('task:join-project', id);

        return () => {
          socket.emit('task:leave-project', id);
          disconnectSocket();
        };
      }
    }
  }, [id, fetchProjectById, fetchColumnsByProject, initializeSocket]);

  const handleCreateColumn = async (data: CreateColumnData | UpdateColumnData) => {
    if (!id) return;
    try {
      await createColumn(id, data as CreateColumnData);
      setIsCreateColumnDialogOpen(false);
    } catch (error) {
      // Error handling is done in store
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskFormOpen(true);
  };

  const handleTaskDelete = (task: Task) => {
    setTaskToDelete({ id: task._id, title: task.title });
    setIsDeleteTaskDialogOpen(true);
  };

  const handleCreateTask = (columnId: string) => {
    setSelectedTask(null);
    setDefaultColumnId(columnId);
    setIsTaskFormOpen(true);
  };


  const handleTaskSubmit = async (data: CreateTaskData | UpdateTaskData) => {
    if (!id) return;
    try {
      if (selectedTask) {
        // Update existing task
        await updateTask(selectedTask._id, data);
      } else {
        // Create new task
        await createTask(id, data as CreateTaskData);
      }
      setIsTaskFormOpen(false);
      setSelectedTask(null);
      setDefaultColumnId(undefined);
    } catch (error) {
      // Error handling is done in store
    }
  };


  const handleDeleteTaskConfirm = async () => {
    if (!taskToDelete || !id) return;
    try {
      await deleteTask(taskToDelete.id, id);
      setIsDeleteTaskDialogOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      // Error handling is done in store
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !id) {
      return;
    }

    const projectColumns = columns[id] || [];
    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dragging a column
    const isColumnDrag = projectColumns.some((col) => col._id === activeId);
    if (isColumnDrag) {
      // Column reordering
      if (activeId === overId) {
        return;
      }

      const oldIndex = projectColumns.findIndex((col) => col._id === activeId);
      const newIndex = projectColumns.findIndex((col) => col._id === overId);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      try {
        await reorderColumn(activeId, newIndex);
      } catch (error) {
        // Error handling is done in store
      }
      return;
    }

    // Task move between columns
    const projectTasks = tasks[id] || [];
    const task = projectTasks.find((t) => t._id === activeId);
    if (!task) {
      return;
    }

    const currentColumnId =
      typeof task.columnId === 'string' ? task.columnId : task.columnId._id;
    const targetColumnId = overId;

    // Check if target is a column
    const targetColumn = projectColumns.find((col) => col._id === targetColumnId);
    if (!targetColumn) {
      return;
    }

    // Only move if column changed
    if (currentColumnId !== targetColumnId) {
      try {
        await moveTask(activeId, targetColumnId);
      } catch (error) {
        // Error handling is done in store
      }
    }
  };

  const projectColumns = id ? columns[id] || [] : [];
  const projectTasks = id ? tasks[id] || [] : [];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="h-full flex flex-col">
          {/* Header with filters and Add New button */}
          <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">
                {project?.name || 'Project'}
              </h1>
              <Button
                onClick={() => setIsCreateColumnDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </div>
            {/* Filters */}
            <div className="flex items-center gap-4 text-sm flex-wrap">
              {/* Due Date Filter */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Due Date:</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={dueDateFrom}
                    onChange={(e) => setDueDateFrom(e.target.value)}
                    className="h-8 w-32 text-xs"
                    placeholder="From"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="date"
                    value={dueDateTo}
                    onChange={(e) => setDueDateTo(e.target.value)}
                    className="h-8 w-32 text-xs"
                    placeholder="To"
                  />
                  {(dueDateFrom || dueDateTo) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        setDueDateFrom('');
                        setDueDateTo('');
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Assignee Filter */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Assignee:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 min-w-[120px] justify-between">
                      {assigneeId
                        ? users.find((u) => u._id === assigneeId)?.firstName + ' ' + users.find((u) => u._id === assigneeId)?.lastName || 'Unknown'
                        : 'All'}
                      <ChevronDown className="h-3 w-3 ml-2 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
                    <DropdownMenuItem
                      onClick={() => setAssigneeId(undefined)}
                      className={!assigneeId ? 'bg-accent' : ''}
                    >
                      All
                    </DropdownMenuItem>
                    {users.map((user) => (
                      <DropdownMenuItem
                        key={user._id}
                        onClick={() => setAssigneeId(user._id)}
                        className={assigneeId === user._id ? 'bg-accent' : ''}
                      >
                        {user.firstName} {user.lastName}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Priority:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 min-w-[100px] justify-between">
                      {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'All'}
                      <ChevronDown className="h-3 w-3 ml-2 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      onClick={() => setPriority(undefined)}
                      className={!priority ? 'bg-accent' : ''}
                    >
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setPriority(TaskPriority.LOW)}
                      className={priority === TaskPriority.LOW ? 'bg-accent' : ''}
                    >
                      Low
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setPriority(TaskPriority.MEDIUM)}
                      className={priority === TaskPriority.MEDIUM ? 'bg-accent' : ''}
                    >
                      Medium
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setPriority(TaskPriority.HIGH)}
                      className={priority === TaskPriority.HIGH ? 'bg-accent' : ''}
                    >
                      High
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Clear All Filters */}
              {(assigneeId || priority || dueDateFrom || dueDateTo) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    setAssigneeId(undefined);
                    setPriority(undefined);
                    setDueDateFrom('');
                    setDueDateTo('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Kanban Board */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
            {projectLoading || columnsLoading || tasksLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading board...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-destructive">{error}</p>
              </div>
            ) : projectColumns.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">No columns yet</p>
                  <Button
                    onClick={() => setIsCreateColumnDialogOpen(true)}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Column
                  </Button>
                </div>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={projectColumns.map((col) => col._id)}
                  strategy={horizontalListSortingStrategy}
                >
                  <div className="flex gap-4 h-full">
                    {projectColumns.map((column) => (
                      <SortableColumn
                        key={column._id}
                        column={column}
                        tasks={projectTasks}
                        projectId={id!}
                        onTaskClick={handleTaskClick}
                        onCreateTask={handleCreateTask}
                        onTaskDelete={handleTaskDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </main>

      <ColumnForm
        open={isCreateColumnDialogOpen}
        onOpenChange={setIsCreateColumnDialogOpen}
        onSubmit={(data: CreateColumnData | UpdateColumnData) => handleCreateColumn(data)}
        isLoading={columnsLoading}
      />

      {id && (
        <>
          <TaskForm
            open={isTaskFormOpen}
            onOpenChange={(open) => {
              setIsTaskFormOpen(open);
              if (!open) {
                setSelectedTask(null);
                setDefaultColumnId(undefined);
              }
            }}
            onSubmit={handleTaskSubmit}
            columns={projectColumns}
            projectId={id}
            defaultColumnId={defaultColumnId}
            initialData={
              selectedTask
                ? {
                    _id: selectedTask._id,
                    title: selectedTask.title,
                    description: selectedTask.description,
                    priority: selectedTask.priority,
                    dueDate: selectedTask.dueDate,
                    columnId:
                      typeof selectedTask.columnId === 'string'
                        ? selectedTask.columnId
                        : selectedTask.columnId._id,
                    assignees: selectedTask.assignees,
                  }
                : undefined
            }
            isLoading={tasksLoading}
          />

          <DeleteTaskDialog
            open={isDeleteTaskDialogOpen}
            onOpenChange={setIsDeleteTaskDialogOpen}
            onConfirm={handleDeleteTaskConfirm}
            taskTitle={taskToDelete?.title || ''}
            isLoading={tasksLoading}
          />
        </>
      )}
    </div>
  );
}
