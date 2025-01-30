// AddMemberForm.tsx
import React, { useState } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';

interface AddMemberFormProps {
  onAddMember: (email: string) => Promise<void>;
  error?: string;
  isLoading?: boolean;
}

export const AddMemberForm: React.FC<AddMemberFormProps> = ({
  onAddMember,
  error,
  isLoading = false
}) => {
  const [email, setEmail] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  
  // Combined loading state to handle both local and parent loading
  const loading = localLoading || isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    try {
      await onAddMember(email);
      setEmail('');
    } finally {
      setLocalLoading(false);
    }
  };

  const inputClasses = `
    block w-full px-4 py-3 
    rounded-xl border border-gray-200 dark:border-gray-700 
    bg-gray-50 dark:bg-gray-900
    text-gray-900 dark:text-white 
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    shadow-sm
    focus:border-purple-500 dark:focus:border-purple-400 
    focus:ring-purple-500 dark:focus:ring-purple-400
    transition-colors
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4">
      <div className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className={inputClasses}
          disabled={loading}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white 
                   bg-gradient-to-r from-purple-600 to-purple-500 
                   hover:from-purple-500 hover:to-purple-400 
                   shadow-lg shadow-purple-500/30 
                   hover:shadow-xl hover:shadow-purple-500/40 
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg 
                   transition-all duration-200 hover:-translate-y-0.5
                   flex items-center min-w-[100px] justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Adding...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Add
            </>
          )}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </form>
  );
};