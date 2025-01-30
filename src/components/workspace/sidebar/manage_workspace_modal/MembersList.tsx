
import React, { useState } from 'react';
import { MemberRow } from './MemberRow';
import { Loader2 } from 'lucide-react';

interface Member {
  id: string;
  user_id: string;
  role: string;
  email?: string;
}

interface MembersListProps {
  members: Member[];
  canManageMembers: boolean;
  onUpdateRole: (memberId: string, userId: string, newRole: string) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  isLoading?: boolean;
}

export const MembersList: React.FC<MembersListProps> = ({
  members,
  canManageMembers,
  onUpdateRole,
  onRemoveMember,
  isLoading = false
}) => {
  const [loadingMemberId, setLoadingMemberId] = useState<string | null>(null);

  // Wrapper functions to handle loading states for individual rows
  const handleUpdateRole = async (memberId: string, userId: string, newRole: string) => {
    setLoadingMemberId(memberId);
    try {
      await onUpdateRole(memberId, userId, newRole);
    } finally {
      setLoadingMemberId(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setLoadingMemberId(memberId);
    try {
      await onRemoveMember(memberId);
    } finally {
      setLoadingMemberId(null);
    }
  };

  if (members.length === 0 && isLoading) {
    return (
      <div className="py-4 text-center text-gray-500 dark:text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
        Loading members...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {members.map((member) => (
        <MemberRow
          key={member.id}
          email={member.email || 'No email'}
          role={member.role}
          canManageMembers={canManageMembers}
          isOwner={member.role === 'owner'}
          isLoading={isLoading || loadingMemberId === member.id}
          onUpdateRole={
            async (newRole) => handleUpdateRole(member.id, member.user_id, newRole)
          }
          onRemove={
            async () => handleRemoveMember(member.id)
          }
        />
      ))}
    </div>
  );
};

