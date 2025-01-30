import React, { useState, useEffect } from 'react';
import { X, Loader2, Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: workspace, error } = await supabase
        .rpc('create_workspace_with_owner', { 
          workspace_name: name,
          creator_id: user.id,
          description: description || null
        });
  
      if (error) throw error;
  
      // Now you can use the workspace data
      console.log('Created workspace:', workspace);
      // You could pass this back to parent component
      onClose();
    } catch (error) {
      console.error('Error creating workspace:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClasses = `
    mt-1.5 block w-full px-4 py-3 
    rounded-xl border border-gray-200 dark:border-gray-700 
    bg-gray-50 dark:bg-gray-900
    text-gray-900 dark:text-white 
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    shadow-sm
    focus:border-purple-500 dark:focus:border-purple-400 
    focus:ring-purple-500 dark:focus:ring-purple-400
    transition-colors
  `;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />

          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-purple-500/10 border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-6 pb-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg mr-3">
                    <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Create Workspace
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Create a new workspace to organize your tasks and collaborate with team members.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClasses}
                  placeholder="Enter workspace name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${inputClasses} resize-none`}
                  placeholder="Add a description (optional)"
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 disabled:opacity-50 disabled:hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating...
                    </div>
                  ) : (
                    'Create Workspace'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};