import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder as FolderIcon, FolderOpen, MoreVertical, Edit, Trash2, Plus, Users } from 'lucide-react';
import { useFolderStore } from '@/store/folderStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import FolderForm from './FolderForm';
import DeleteFolderDialog from './DeleteFolderDialog';
import ProjectItem from './ProjectItem';
import ProjectForm from './ProjectForm';
import type { Folder } from '@/api/folder.api';
import type { UpdateFolderData } from '@/api/folder.api';
import type { CreateProjectData, UpdateProjectData } from '@/api/project.api';
import { ROUTES } from '@/lib/constants';

interface FolderItemProps {
  folder: Folder;
  isCollapsed?: boolean;
}

export default function FolderItem({ folder, isCollapsed = false }: FolderItemProps) {
  const navigate = useNavigate();
  const {
    expandedFolders,
    folderProjects,
    toggleFolderExpanded,
    updateFolder,
    deleteFolder,
    createProject,
    isLoading,
  } = useFolderStore();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);

  const isExpanded = expandedFolders.includes(folder._id);
  const projects = folderProjects[folder._id] || [];

  const handleEdit = async (data: UpdateFolderData) => {
    await updateFolder(folder._id, data);
  };

  const handleDelete = async () => {
    await deleteFolder(folder._id);
  };

  const handleCreateProject = async (data: CreateProjectData) => {
    await createProject(folder._id, data);
  };

  const handleMembersClick = () => {
    navigate(`${ROUTES.FOLDER_DETAIL}/${folder._id}`);
  };

  return (
    <>
      <div className="group">
        <div 
          className={`flex items-center gap-2 px-2 py-2 hover:bg-accent transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
          onClick={() => toggleFolderExpanded(folder._id)}
          title={isCollapsed ? folder.name : undefined}
        >
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          ) : (
            <FolderIcon className="h-4 w-4 text-muted-foreground" />
          )}
          {!isCollapsed && (
            <>
              <span className="text-sm font-medium flex-1 truncate">{folder.name}</span>
              {isExpanded && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-1 hover:bg-accent rounded"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMembersClick();
                        }}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Members
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </>
          )}
        </div>
        {isExpanded && !isCollapsed && (
          <div className="ml-6 border-l border-border">
            <div className="px-2 py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddProjectDialogOpen(true);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add New Project
              </button>
            </div>
            {projects.length === 0 ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                No projects
              </div>
            ) : (
              projects
                .filter((project) => project && project._id)
                .map((project) => (
                  <ProjectItem key={project._id} project={project} folderId={folder._id} />
                ))
            )}
          </div>
        )}
      </div>

      <FolderForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleEdit}
        initialData={{ name: folder.name, description: folder.description }}
        isLoading={isLoading}
      />

      <DeleteFolderDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        folderName={folder.name}
        isLoading={isLoading}
      />

      <ProjectForm
        open={isAddProjectDialogOpen}
        onOpenChange={setIsAddProjectDialogOpen}
        onSubmit={handleCreateProject as (data: CreateProjectData | UpdateProjectData) => Promise<void>}
        isLoading={isLoading}
      />
    </>
  );
}

