import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, UserMinus, Users as UsersIcon } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useFolderStore } from '@/store/folderStore';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AddMemberDialog from '@/components/AddMemberDialog';
import { getUserInitials } from '@/lib/utils';
import type { Folder } from '@/api/folder.api';

export default function FolderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const {
    getFolderById,
    addMemberToFolder,
    removeMemberFromFolder,
    isLoading,
  } = useFolderStore();

  const [folder, setFolder] = useState<Folder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      getFolderById(id)
        .then((data) => {
          setFolder(data);
          setError(null);
        })
        .catch((err: Error) => {
          setError(err.message || 'Failed to load folder');
        });
    }
  }, [id, getFolderById]);

  const handleAddMember = async (memberId: string) => {
    if (!id) return;
    try {
      await addMemberToFolder(id, memberId);
      // Refresh folder data
      const updatedFolder = await getFolderById(id);
      setFolder(updatedFolder);
      setIsAddMemberDialogOpen(false);
    } catch (error) {
      // Error handling is done in store
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!id) return;
    try {
      await removeMemberFromFolder(id, userId);
      // Refresh folder data
      const updatedFolder = await getFolderById(id);
      setFolder(updatedFolder);
    } catch (error) {
      // Error handling is done in store
    }
  };

  const isOwner = folder && user && folder.owner._id === user._id;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">
                {folder?.name || 'Folder'}
              </h1>
              {isOwner && (
                <Button
                  onClick={() => setIsAddMemberDialogOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Members
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto px-6 py-8">
            {isLoading && !folder ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading folder...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-destructive">{error}</p>
                </div>
              </div>
            ) : folder ? (
              <div className="max-w-4xl mx-auto">
                {/* Members Section */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <UsersIcon className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">Members</h2>
                  </div>

                  {/* Owner */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Owner
                    </h3>
                    <div className="flex items-center gap-3 p-3 rounded-md bg-accent/50">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getUserInitials(folder.owner)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {folder.owner.firstName} {folder.owner.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {folder.owner.email}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                        Owner
                      </span>
                    </div>
                  </div>

                  {/* Members */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Members ({folder.members.length})
                      </h3>
                    </div>
                    {folder.members.length === 0 ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        No members yet. Add members to collaborate on this folder.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {folder.members.map((member) => (
                          <div
                            key={member._id}
                            className="flex items-center gap-3 p-3 rounded-md hover:bg-accent/50 transition-colors"
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {getUserInitials(member)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {member.email}
                              </p>
                            </div>
                            {isOwner && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMember(member._id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={isLoading}
                              >
                                <UserMinus className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {/* Add Member Dialog */}
      {folder && (
        <AddMemberDialog
          open={isAddMemberDialogOpen}
          onOpenChange={setIsAddMemberDialogOpen}
          onAddMember={handleAddMember}
          folder={folder}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

