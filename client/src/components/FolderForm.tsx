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
import type { CreateFolderData, UpdateFolderData } from '@/api/folder.api';

const folderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(100, 'Folder name must be at most 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be at most 500 characters'),
});

type FolderFormData = z.infer<typeof folderSchema>;

interface FolderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateFolderData | UpdateFolderData) => Promise<void>;
  initialData?: { name: string; description: string };
  isLoading?: boolean;
}

export default function FolderForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
}: FolderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FolderFormData>({
    resolver: zodResolver(folderSchema),
    defaultValues: initialData || { name: '', description: '' },
  });

  useEffect(() => {
    if (open) {
      reset(initialData || { name: '', description: '' });
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = async (data: FolderFormData) => {
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
          <DialogTitle>{initialData ? 'Edit Folder' : 'Create New Folder'}</DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update folder information below.'
              : 'Create a new folder to organize your projects.'}
          </DialogDescription>
        </DialogHeader>
        <Form onSubmit={handleSubmit(handleFormSubmit)}>
          <FormField>
            <FormLabel htmlFor="name">Folder Name</FormLabel>
            <Input
              id="name"
              placeholder="My Folder"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="description">Description</FormLabel>
            <Input
              id="description"
              placeholder="Folder description"
              {...register('description')}
              disabled={isLoading}
            />
            {errors.description && (
              <FormMessage>{errors.description.message}</FormMessage>
            )}
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

