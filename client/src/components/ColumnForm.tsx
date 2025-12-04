import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import type { CreateColumnData, UpdateColumnData } from '@/api/column.api';

const columnSchema = z.object({
  name: z
    .string()
    .min(1, 'Column name is required')
    .max(50, 'Column name must be at most 50 characters'),
});

type ColumnFormData = z.infer<typeof columnSchema>;

interface ColumnFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateColumnData | UpdateColumnData) => Promise<void>;
  initialData?: { name: string };
  isLoading?: boolean;
}

export default function ColumnForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
}: ColumnFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ColumnFormData>({
    resolver: zodResolver(columnSchema),
    defaultValues: initialData || { name: '' },
  });

  useEffect(() => {
    if (open) {
      reset(initialData || { name: '' });
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = async (data: ColumnFormData) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
      reset();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Column' : 'Create New Column'}</DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update column name below.'
              : 'Create a new column for your project board.'}
          </DialogDescription>
        </DialogHeader>
        <Form onSubmit={handleSubmit(handleFormSubmit)}>
          <FormField>
            <FormLabel htmlFor="name">Column Name</FormLabel>
            <Input
              id="name"
              placeholder="e.g., In Progress"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

