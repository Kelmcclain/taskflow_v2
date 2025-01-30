import React, { useState } from 'react';
import { Shield, Trash2, Loader2 } from 'lucide-react';

interface MemberRowProps {
  email: string;
  role: string;
  canManageMembers: boolean;
  isOwner: boolean;
  isLoading?: boolean;
  onUpdateRole?: (newRole: string) => Promise<void>;
  onRemove?: () => Promise<void>;
}

export const MemberRow: React.FC<MemberRowProps> = ({
  email,
  role,
  canManageMembers,
  isOwner,
  isLoading = false,
  onUpdateRole,
  onRemove
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [actionType, setActionType] = useState<'update' | 'remove' | null>(null);
  
  // Combined loading state
  const loading = isLoading || localLoading;

  const handleUpdateRole = async (newRole: string) => {
    if (!onUpdateRole) return;
    setLocalLoading(true);
    setActionType('update');
    try {
      await onUpdateRole(newRole);
    } finally {
      setLocalLoading(false);
      setActionType(null);
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    setLocalLoading(true);
    setActionType('remove');
    try {
      await onRemove();
    } finally {
      setLocalLoading(false);
      setActionType(null);
    }
  };

  const selectClasses = `
    mt-1.5 block px-3 py-2
    rounded-lg border border-gray-200 dark:border-gray-700 
    bg-gray-50 dark:bg-gray-900
    text-gray-900 dark:text-white 
    text-sm
    focus:border-purple-500 dark:focus:border-purple-400 
    focus:ring-purple-500 dark:focus:ring-purple-400
    transition-colors
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <div className={`
      flex items-center justify-between p-4 
      bg-white dark:bg-gray-800 
      rounded-xl border border-gray-100 dark:border-gray-700 
      hover:border-purple-100 dark:hover:border-purple-900/50 
      transition-colors
      ${loading ? 'opacity-75' : ''}
    `}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {email}
        </p>
        {canManageMembers && !isOwner ? (
          <div className="relative">
            <select
              value={role}
              onChange={(e) => handleUpdateRole(e.target.value)}
              disabled={loading}
              className={selectClasses}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            {loading && actionType === 'update' && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize flex items-center mt-1">
            {role === 'owner' && (
              <Shield className="h-4 w-4 mr-1.5 text-purple-500 dark:text-purple-400" />
            )}
            {role}
          </p>
        )}
      </div>
      
      {canManageMembers && !isOwner && (
        <button
          onClick={handleRemove}
          disabled={loading}
          className="ml-4 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 
                   hover:bg-red-50 dark:hover:bg-red-500/10
                   rounded-lg transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed
                   disabled:hover:bg-transparent disabled:hover:text-gray-400
                   relative"
          title="Remove member"
        >
          {loading && actionType === 'remove' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Trash2 className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
};