import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { userApi, type User } from '@/api/user.api';
import { getUserInitials } from '@/lib/utils';
import type { Folder } from '@/api/folder.api';

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMember: (memberId: string) => Promise<void>;
  folder: Folder;
  isLoading?: boolean;
}

export default function AddMemberDialog({
  open,
  onOpenChange,
  onAddMember,
  folder,
  isLoading = false,
}: AddMemberDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchUsers();
      setSearchQuery('');
      setSelectedUserId(null);
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.firstName.toLowerCase().includes(query) ||
            user.lastName.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await userApi.getAllUsers();
      // Filter out owner and existing members
      const availableUsers = response.data.filter(
        (user) =>
          user._id !== folder.owner._id &&
          !folder.members.some((member) => member._id === user._id)
      );
      setUsers(availableUsers);
      setFilteredUsers(availableUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    try {
      await onAddMember(selectedUserId);
      onOpenChange(false);
      setSelectedUserId(null);
      setSearchQuery('');
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Select a user to add to "{folder.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loadingUsers || isLoading}
          />

          <ScrollArea className="h-[300px] rounded-md border">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading users...</div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">
                  {searchQuery ? 'No users found' : 'No available users'}
                </div>
              </div>
            ) : (
              <div className="p-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => setSelectedUserId(user._id)}
                    className={`
                      flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors
                      ${
                        selectedUserId === user._id
                          ? 'bg-accent'
                          : 'hover:bg-accent/50'
                      }
                    `}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    {selectedUserId === user._id && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAddMember}
            disabled={!selectedUserId || isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Member'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

