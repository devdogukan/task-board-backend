import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableProperties, Edit, Trash2 } from 'lucide-react';
import { useFolderStore } from '@/store/folderStore';
import { cn } from '@/lib/utils';
import ProjectForm from './ProjectForm';
import DeleteProjectDialog from './DeleteProjectDialog';
import type { Project } from '@/api/project.api';
import type { UpdateProjectData } from '@/api/project.api';
import { ROUTES } from '@/lib/constants';

interface ProjectItemProps {
  project: Project;
  folderId: string;
  isSelected?: boolean;
}

export default function ProjectItem({
  project,
  folderId,
  isSelected = false,
}: ProjectItemProps) {
  const navigate = useNavigate();
  const {
    updateProject,
    deleteProject,
    isLoading,
  } = useFolderStore();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEdit = async (data: UpdateProjectData) => {
    await updateProject(project._id, data);
  };

  const handleDelete = async () => {
    await deleteProject(project._id, folderId);
  };

  const handleClick = () => {
    navigate(`${ROUTES.PROJECT_DETAIL}/${project._id}`);
  };

  return (
    <>
      <div className="group">
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-accent transition-colors',
            isSelected && 'bg-accent'
          )}
          onClick={handleClick}
        >
          <TableProperties className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm flex-1 truncate">{project.name}</span>
          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditDialogOpen(true);
              }}
              className="p-1 hover:bg-accent rounded"
              title="Edit project"
            >
              <Edit className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteDialogOpen(true);
              }}
              className="p-1 hover:bg-accent rounded text-destructive"
              title="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <ProjectForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleEdit}
        initialData={{ name: project.name, description: project.description }}
        isLoading={isLoading}
      />

      <DeleteProjectDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        projectName={project.name}
        isLoading={isLoading}
      />
    </>
  );
}
