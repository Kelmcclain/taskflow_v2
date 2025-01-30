import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Modal } from './Modal';
import { AddMemberForm } from './AddMemberForm';
import { MembersList } from './MembersList';
import { useAuth } from '../../../../contexts/AuthContext';
import { supabase } from '../../../../lib/supabase';

interface ManageWorkspaceMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

interface WorkspaceMember {
  id: string;
  user_id: string;
  role: string;
  email?: string;
}

// Define the shape of the data returned from Supabase
interface MemberData {
  id: string;
  workspace_id: string;
  user_id: string;
  role: string;
  created_at: string;
  user: {
    email: string;
  }[];
}

export const ManageWorkspaceMembersModal: React.FC<ManageWorkspaceMembersModalProps> = ({ 
  isOpen, 
  onClose,
  workspaceId 
}) => {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, workspaceId]);

  console.log(workspaceId)

  const fetchMembers = async () => {
    setIsLoading(true);
    setError('');
    if (!workspaceId) {
      setError('No workspace ID provided');
      return;
    }
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('workspace_members')
        .select(`
          id,
          workspace_id,
          user_id,
          role,
          created_at,
          user:users (
            email
          )
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true });
  
      if (membersError) throw membersError;
      if (!membersData) throw new Error('No members data received');
  
      const transformedMembers: WorkspaceMember[] = (membersData as MemberData[]).map(member => {
        if (member.user_id === user?.id) {
          setCurrentUserRole(member.role);
        }
        return {
          id: member.id,
          user_id: member.user_id,
          role: member.role,
          email: member.user.email || 'Email not found'
        };
      });
  
      setMembers(transformedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
      setError('Failed to fetch workspace members. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddMember = async (email: string) => {
    setError('');
    setIsLoading(true);

    try {
      // Validate email format
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Get user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (userError) {
        throw new Error('User not found. Please check the email address.');
      }

      // Check if user is already a member
      const existingMember = members.find(m => m.user_id === userData.id);
      if (existingMember) {
        throw new Error('User is already a member of this workspace');
      }

      // Add member
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert([{
          workspace_id: workspaceId,
          user_id: userData.id,
          role: 'member'
        }]);

      if (memberError) throw memberError;
      await fetchMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      setError(error instanceof Error ? error.message : 'Error adding member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setIsLoading(true);
    try {
      const memberToRemove = members.find(m => m.id === memberId);
      
      // Prevent removing the last owner
      if (memberToRemove?.role === 'owner' && members.filter(m => m.role === 'owner').length === 1) {
        throw new Error('Cannot remove the last owner');
      }

      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      await fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      setError(error instanceof Error ? error.message : 'Error removing member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, userId: string, newRole: string) => {
    setIsLoading(true);
    try {
      // Prevent demoting the last owner
      if (newRole !== 'owner') {
        const ownerCount = members.filter(m => m.role === 'owner').length;
        const isCurrentOwner = members.find(m => m.id === memberId)?.role === 'owner';
        if (ownerCount === 1 && isCurrentOwner) {
          throw new Error('Cannot demote the last owner');
        }
      }

      const { error } = await supabase
        .from('workspace_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      await fetchMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      setError(error instanceof Error ? error.message : 'Error updating role');
    } finally {
      setIsLoading(false);
    }
  };

  const canManageMembers = currentUserRole === 'admin' || currentUserRole === 'owner';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Members"
      icon={
        <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
      }
    >
      <div className="space-y-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage workspace members and their roles. Owners can add/remove members and change roles.
        </p>

        {canManageMembers && (
          <AddMemberForm
            onAddMember={handleAddMember}
            error={error}
            isLoading={isLoading}
          />
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Members ({members.length})
          </h3>
          
          <MembersList
            members={members}
            canManageMembers={canManageMembers}
            onUpdateRole={handleUpdateRole}
            onRemoveMember={handleRemoveMember}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Modal>
  );
};