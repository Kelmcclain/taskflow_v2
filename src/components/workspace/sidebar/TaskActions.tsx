import React from 'react';
import { Save, Trash2 } from 'lucide-react';

interface TaskActionsProps {
  isNew: boolean;
  loading: boolean;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export const TaskActions: React.FC<TaskActionsProps> = ({
  isNew,
  loading,
  onSave,
  onDelete,
}) => (
  <div className="flex justify-between">
    <button
      onClick={onDelete}
      className="inline-flex items-center px-4 py-2 rounded-md text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {isNew ? 'Cancel' : 'Delete'}
    </button>
    <button
      onClick={onSave}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 rounded-md text-white bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-600 dark:to-purple-500 hover:from-purple-500 hover:to-purple-400 dark:hover:from-purple-500 dark:hover:to-purple-400 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
    >
      <Save className="h-4 w-4 mr-2" />
      {loading ? 'Saving...' : 'Save Changes'}
    </button>
  </div>
);
