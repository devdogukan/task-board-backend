import { useState } from 'react';
import { MoreVertical, Plus, Circle, CheckCircle2, GripVertical } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import TaskCard from './TaskCard';
import ColumnForm from './ColumnForm';
import DeleteColumnDialog from './DeleteColumnDialog';
import { useColumnStore } from '@/store/columnStore';
import type { Column, CreateColumnData, UpdateColumnData } from '@/api/column.api';
import type { Task } from '@/api/task.api';
import { cn } from '@/lib/utils';

interface ColumnCardProps {
  column: Column;
  tasks: Task[];
  projectId: string;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  onTaskClick?: (task: Task) => void;
  onCreateTask?: (columnId: string) => void;
  onTaskDelete?: (task: Task) => void;
}

const getColumnIcon = (columnName: string) => {
  const name = columnName.toLowerCase();
  if (name.includes('pending') || name.includes('todo')) {
    return <Circle className="h-4 w-4 text-gray-400" />;
  }
  if (name.includes('progress') || name.includes('in progress')) {
    return <Circle className="h-4 w-4 text-yellow-500 fill-yellow-500" />;
  }
  if (name.includes('completed') || name.includes('done')) {
    return <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-500" />;
  }
  if (name.includes('launched') || name.includes('deployed')) {
    return <CheckCircle2 className="h-4 w-4 text-purple-500 fill-purple-500" />;
  }
  return <Circle className="h-4 w-4 text-gray-400" />;
};

export default function ColumnCard({ column, tasks, projectId, dragHandleProps, onTaskClick, onCreateTask, onTaskDelete }: ColumnCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { updateColumn, deleteColumn, isLoading } = useColumnStore();

  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
  });

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteColumn(column._id, projectId);
    } catch (error) {
      // Error handling is done in store
    }
  };

  const handleUpdate = async (data: CreateColumnData | UpdateColumnData) => {
    try {
      await updateColumn(column._id, data);
      setIsEditDialogOpen(false);
    } catch (error) {
      // Error handling is done in store
    }
  };

  const columnTasks = tasks.filter(
    (task) =>
      (typeof task.columnId === 'string' ? task.columnId : task.columnId._id) ===
      column._id
  );

  return (
    <>
      <Card
        ref={setNodeRef}
        className={cn(
          'flex flex-col h-full min-w-[300px] max-w-[300px]',
          isOver && 'ring-2 ring-primary ring-offset-2'
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              {dragHandleProps && (
                <div
                  {...dragHandleProps}
                  className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                >
                  <GripVertical className="h-4 w-4" />
                </div>
              )}
              {getColumnIcon(column.name)}
              <h2 className="font-semibold text-sm">{column.name}</h2>
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onCreateTask?.(column._id)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-3">
          <ScrollArea className="h-full">
            <SortableContext
              items={columnTasks.map((t) => t._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {columnTasks.length > 0 ? (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onClick={() => onTaskClick?.(task)}
                      onDelete={onTaskDelete}
                    />
                  ))
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No tasks
                  </div>
                )}
              </div>
            </SortableContext>
          </ScrollArea>
        </CardContent>
      </Card>

      <ColumnForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={(data: CreateColumnData | UpdateColumnData) => handleUpdate(data)}
        initialData={{ name: column.name || '' }}
        isLoading={isLoading}
      />

      <DeleteColumnDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        columnName={column.name}
        isLoading={isLoading}
      />
    </>
  );
}

