import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, FolderOpen, ListTodo, Plus } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useFolderStore } from '@/store/folderStore';
import { useTaskStore } from '@/store/taskStore';
import FolderForm from '@/components/FolderForm';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import type { CreateFolderData, UpdateFolderData } from '@/api/folder.api';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}

interface FolderCardProps {
  folder: {
    _id: string;
    name: string;
    description: string;
    members: Array<{ _id: string }>;
  };
  projectCount: number;
  onClick: () => void;
}

function FolderCard({ folder, projectCount, onClick }: FolderCardProps) {
  const memberCount = folder.members.length + 1; // +1 for owner

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border p-6 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
    >
      <div className="flex items-start justify-between mb-4">
        <FolderOpen className="h-8 w-8 text-purple-600" />
        <div className="flex gap-2">
          <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 font-medium">
            {projectCount} {projectCount === 1 ? 'Project' : 'Projects'}
          </span>
          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
            {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
          </span>
        </div>
      </div>
      <h3 className="text-lg font-bold mb-2">{folder.name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {folder.description}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    folders,
    folderProjects,
    isLoading,
    fetchFolders,
    createFolder,
  } = useFolderStore();
  const { tasks } = useTaskStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchFolders().catch(() => {
      // Error handling is done in store
    });
  }, [fetchFolders]);

  const handleCreateFolder = async (data: CreateFolderData | UpdateFolderData) => {
    // Dashboard only creates folders, so we ensure required fields are present
    if (!data.name || !data.description) {
      throw new Error('Folder name and description are required');
    }
    await createFolder({ name: data.name, description: data.description });
  };

  const handleFolderClick = (folderId: string) => {
    navigate(`${ROUTES.FOLDER_DETAIL}/${folderId}`);
  };

  // Calculate statistics
  const totalFolders = folders.length;
  const totalProjects = Object.values(folderProjects).flat().length;
  const totalTasks = Object.values(tasks).flat().length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              icon={<Folder className="h-6 w-6" />}
              label="Total Folders"
              value={totalFolders}
              color="bg-purple-100 text-purple-600"
            />
            <StatCard
              icon={<FolderOpen className="h-6 w-6" />}
              label="Total Projects"
              value={totalProjects}
              color="bg-blue-100 text-blue-600"
            />
            <StatCard
              icon={<ListTodo className="h-6 w-6" />}
              label="Total Tasks"
              value={totalTasks}
              color="bg-green-100 text-green-600"
            />
          </div>

          {/* Folders Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Folders</h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading folders...</p>
                </div>
              </div>
            ) : folders.length === 0 ? (
              <div className="bg-white rounded-lg border p-12 text-center">
                <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No folders yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first folder to get started organizing your projects.
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Folder
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.map((folder) => (
                  <FolderCard
                    key={folder._id}
                    folder={folder}
                    projectCount={folderProjects[folder._id]?.length || 0}
                    onClick={() => handleFolderClick(folder._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Folder Dialog */}
      <FolderForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateFolder}
        isLoading={isLoading}
      />
    </div>
  );
}
