import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, ChevronLeft, ChevronRight, Tent } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFolderStore } from '@/store/folderStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import FolderItem from './FolderItem';
import FolderForm from './FolderForm';
import { getUserInitials } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import type { CreateFolderData, UpdateFolderData } from '@/api/folder.api';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    folders,
    isLoading,
    error,
    fetchFolders,
    createFolder,
  } = useFolderStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Load sidebar state from localStorage on mount
    const savedState = localStorage.getItem('sidebar_collapsed');
    return savedState === 'true';
  });

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  useEffect(() => {
    fetchFolders().catch(() => {
      // Error handling is done in store
    });
  }, [fetchFolders]);

  useEffect(() => {
    // Save sidebar state to localStorage whenever it changes
    localStorage.setItem('sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const handleCreateFolder = async (data: CreateFolderData) => {
    await createFolder(data);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogoClick = () => {
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div 
      className={`flex flex-col h-screen border-r bg-background transition-all duration-300 relative ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-4 z-10 h-6 w-6 rounded-full border bg-background shadow-md flex items-center justify-center hover:bg-accent transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Logo/App Name */}
      <button
        onClick={handleLogoClick}
        className={`flex items-center gap-2 px-4 py-4 border-b hover:bg-accent transition-colors cursor-pointer ${
          isCollapsed ? 'justify-center px-2' : ''
        }`}
        title={isCollapsed ? 'Task Board' : undefined}
      >
        <Tent className="h-5 w-5 text-primary" />
        {!isCollapsed && (
          <span className="text-lg font-bold">Task Board</span>
        )}
      </button>

      {/* Header */}
      <div className={`p-4 border-b ${isCollapsed ? 'px-2' : ''}`}>
        {isCollapsed ? (
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full"
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Folder
          </Button>
        )}
      </div>

      {/* Folder List */}
      <ScrollArea className="flex-1">
        <div className={`p-2 ${isCollapsed ? 'px-1' : ''}`}>
          {!isCollapsed && isLoading && folders.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Loading folders...
            </div>
          ) : !isCollapsed && error && folders.length === 0 ? (
            <div className="text-center py-8 text-sm text-destructive">
              {error}
            </div>
          ) : !isCollapsed && folders.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No folders yet. Create your first folder!
            </div>
          ) : (
            folders.map((folder) => (
              <FolderItem key={folder._id} folder={folder} isCollapsed={isCollapsed} />
            ))
          )}
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className={`border-t space-y-3 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <Avatar className={`cursor-pointer hover:opacity-80 transition-opacity ${isCollapsed ? 'h-8 w-8' : 'h-10 w-10'}`}>
            <AvatarFallback>
              {user ? getUserInitials(user) : 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || ''}
              </p>
            </div>
          )}
        </div>
        {isCollapsed ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        )}
      </div>

      {/* Create Folder Dialog */}
      <FolderForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateFolder as (data: CreateFolderData | UpdateFolderData) => Promise<void>}
        isLoading={isLoading}
      />
    </div>
  );
}

