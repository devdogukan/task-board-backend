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
import type { CreateProjectData, UpdateProjectData } from '@/api/project.api';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name must be at most 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be at most 500 characters'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateProjectData | UpdateProjectData) => Promise<void>;
  initialData?: { name: string; description: string };
  isLoading?: boolean;
}

export default function ProjectForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData || { name: '', description: '' },
  });

  useEffect(() => {
    if (open) {
      reset(initialData || { name: '', description: '' });
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = async (data: ProjectFormData) => {
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
          <DialogTitle>{initialData ? 'Edit Project' : 'Create New Project'}</DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update project information below.'
              : 'Create a new project in this folder.'}
          </DialogDescription>
        </DialogHeader>
        <Form onSubmit={handleSubmit(handleFormSubmit)}>
          <FormField>
            <FormLabel htmlFor="name">Project Name</FormLabel>
            <Input
              id="name"
              placeholder="My Project"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
          </FormField>

          <FormField>
            <FormLabel htmlFor="description">Description</FormLabel>
            <Input
              id="description"
              placeholder="Project description"
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

