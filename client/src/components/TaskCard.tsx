import { Calendar, Flag, Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUserInitials } from '@/lib/utils';
import type { Task } from '@/api/task.api';
import { TaskPriority } from '@/api/task.api';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onDelete?: (task: Task) => void;
}

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.HIGH:
      return 'text-red-500';
    case TaskPriority.MEDIUM:
      return 'text-blue-500';
    case TaskPriority.LOW:
      return 'text-gray-500';
    default:
      return 'text-gray-500';
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (dateString: string | null) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isOverdue = (dueDate: string | null) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

export default function TaskCard({ task, onClick, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dueDate = formatDate(task.dueDate);
  const dueTime = formatTime(task.dueDate);
  const overdue = isOverdue(task.dueDate);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <h3 className="font-medium text-sm flex-1">{task.title}</h3>
        </div>
        <Trash2 
          className="h-4 w-4 text-muted-foreground hover:text-destructive cursor-pointer transition-colors" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(task);
          }}
        />
      </div>
      <div className="space-y-2">
        {/* Assignees */}
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex items-center gap-1">
            {task.assignees.slice(0, 3).map((assignee) => (
              <Avatar key={assignee._id} className="h-6 w-6">
                <AvatarImage src={assignee.avatar || undefined} />
                <AvatarFallback className="text-xs">
                  {getUserInitials(assignee)}
                </AvatarFallback>
              </Avatar>
            ))}
            {task.assignees.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{task.assignees.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {dueDate} - {dueTime}
            </span>
            {overdue && (
              <span className="text-red-500 font-medium">Overdue</span>
            )}
          </div>
        )}

        {/* Priority */}
        <div className="flex items-center gap-1.5">
          <Flag className={cn('h-3.5 w-3.5', getPriorityColor(task.priority))} />
          <span className={cn('text-xs capitalize', getPriorityColor(task.priority))}>
            {task.priority === TaskPriority.MEDIUM ? 'Normal' : task.priority} Priority
          </span>
        </div>
      </div>
    </Card>
  );
}

