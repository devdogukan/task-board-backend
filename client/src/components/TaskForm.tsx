import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userApi } from '@/api/user.api';
import type { User as UserFromUserApi } from '@/api/user.api';
import { getUserInitials } from '@/lib/utils';
import type { CreateTaskData, UpdateTaskData } from '@/api/task.api';
import { TaskPriority } from '@/api/task.api';
import type { Column } from '@/api/column.api';

// Assignee type - backend returns User without createdAt/updatedAt when populating
type Assignee = Pick<UserFromUserApi, '_id' | 'firstName' | 'lastName' | 'email' | 'avatar'>;

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Task title must be at most 200 characters'),
  description: z.string().min(1, 'Task description is required').max(2000, 'Task description must be at most 2000 characters'),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().nullable().optional(),
  columnId: z.string().min(1, 'Column is required'),
  assigneeIds: z.array(z.string()).default([]),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>;
  columns: Column[];
  projectId: string;
  defaultColumnId?: string;
  initialData?: {
    _id?: string;
    title: string;
    description: string;
    priority?: TaskPriority;
    dueDate?: string | null;
    columnId: string;
    assignees?: Assignee[];
  };
  isLoading?: boolean;
}

export default function TaskForm({
  open,
  onOpenChange,
  onSubmit,
  columns,
  defaultColumnId,
  initialData,
  isLoading = false,
}: TaskFormProps) {
  const [users, setUsers] = useState<UserFromUserApi[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<Assignee[]>([]);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || TaskPriority.MEDIUM,
      dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 16) : '',
      columnId: initialData?.columnId || defaultColumnId || columns[0]?._id || '',
      assigneeIds: initialData?.assignees?.map((a) => a._id) || [],
    },
  });

  // Column ID is watched for form state but not used directly in render
  watch('columnId');

  useEffect(() => {
    if (open) {
      reset({
        title: initialData?.title || '',
        description: initialData?.description || '',
        priority: initialData?.priority || TaskPriority.MEDIUM,
        dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 16) : '',
        columnId: initialData?.columnId || defaultColumnId || columns[0]?._id || '',
        assigneeIds: initialData?.assignees?.map((a) => a._id) || [],
      });
      setSelectedAssignees(initialData?.assignees || []);
      setAssigneeSearch('');
      setShowAssigneeDropdown(false);
    }
  }, [open, initialData, columns, defaultColumnId, reset]);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const response = await userApi.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      !selectedAssignees.some((a) => a._id === user._id) &&
      (user.firstName.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
        user.lastName.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(assigneeSearch.toLowerCase()))
  );

  const handleAddAssignee = (user: UserFromUserApi) => {
    if (!selectedAssignees.some((a) => a._id === user._id)) {
      const newAssignees = [...selectedAssignees, user];
      setSelectedAssignees(newAssignees);
      setValue(
        'assigneeIds',
        newAssignees.map((a) => a._id)
      );
      setAssigneeSearch('');
      setShowAssigneeDropdown(false);
    }
  };

  const handleRemoveAssignee = (userId: string) => {
    const newAssignees = selectedAssignees.filter((a) => a._id !== userId);
    setSelectedAssignees(newAssignees);
    setValue('assigneeIds', newAssignees.map((a) => a._id));
  };

  const handleFormSubmit = async (data: TaskFormData) => {
    try {
      const submitData: CreateTaskData | UpdateTaskData = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        columnId: data.columnId,
        assignees: data.assigneeIds || [],
      };
      await onSubmit(submitData);
      onOpenChange(false);
      reset();
      setSelectedAssignees([]);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-background shadow-lg z-50 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {initialData?._id ? 'Edit Task' : 'Create Task'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <Form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="space-y-6">
                {/* Title */}
                <FormField>
                  <FormLabel htmlFor="title">Title</FormLabel>
                  <Input
                    id="title"
                    placeholder="Enter task title"
                    {...register('title')}
                    disabled={isLoading}
                  />
                  {errors.title && <FormMessage>{errors.title.message}</FormMessage>}
                </FormField>

                {/* Description */}
                <FormField>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <textarea
                    id="description"
                    rows={4}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter task description"
                    {...register('description')}
                    disabled={isLoading}
                  />
                  {errors.description && <FormMessage>{errors.description.message}</FormMessage>}
                </FormField>

                {/* Column */}
                <FormField>
                  <FormLabel htmlFor="columnId">Column</FormLabel>
                  <select
                    id="columnId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('columnId')}
                    disabled={isLoading}
                  >
                    {columns.map((column) => (
                      <option key={column._id} value={column._id}>
                        {column.name}
                      </option>
                    ))}
                  </select>
                  {errors.columnId && <FormMessage>{errors.columnId.message}</FormMessage>}
                </FormField>

                {/* Priority */}
                <FormField>
                  <FormLabel htmlFor="priority">Priority</FormLabel>
                  <select
                    id="priority"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('priority')}
                    disabled={isLoading}
                  >
                    <option value={TaskPriority.LOW}>Low</option>
                    <option value={TaskPriority.MEDIUM}>Medium</option>
                    <option value={TaskPriority.HIGH}>High</option>
                  </select>
                  {errors.priority && <FormMessage>{errors.priority.message}</FormMessage>}
                </FormField>

                {/* Due Date */}
                <FormField>
                  <FormLabel htmlFor="dueDate">Due Date</FormLabel>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    {...register('dueDate')}
                    disabled={isLoading}
                  />
                  {errors.dueDate && <FormMessage>{errors.dueDate.message}</FormMessage>}
                </FormField>

                {/* Assignees */}
                <FormField>
                  <FormLabel>Assignees</FormLabel>
                  <div className="space-y-2">
                    {/* Selected Assignees */}
                    {selectedAssignees.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedAssignees.map((assignee) => (
                          <div
                            key={assignee._id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={assignee.avatar || undefined} />
                              <AvatarFallback className="text-xs">
                                {getUserInitials(assignee)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {assignee.firstName} {assignee.lastName}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAssignee(assignee._id)}
                              className="text-muted-foreground hover:text-foreground"
                              disabled={isLoading}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Assignee */}
                    <div className="relative">
                      <Input
                        placeholder="Search users to assign..."
                        value={assigneeSearch}
                        onChange={(e) => {
                          setAssigneeSearch(e.target.value);
                          setShowAssigneeDropdown(true);
                        }}
                        onFocus={() => setShowAssigneeDropdown(true)}
                        disabled={isLoading}
                      />
                      {showAssigneeDropdown && filteredUsers.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredUsers.map((user) => (
                            <button
                              key={user._id}
                              type="button"
                              onClick={() => handleAddAssignee(user)}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-left"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar || undefined} />
                                <AvatarFallback className="text-xs">
                                  {getUserInitials(user)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </FormField>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : initialData?._id ? 'Update' : 'Create'}
                </Button>
              </div>
            </Form>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}

