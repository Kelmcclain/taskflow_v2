import React from 'react';
import { X } from 'lucide-react';

interface TaskHeaderProps {
  isNew: boolean;
  onClose: () => void;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({ isNew, onClose }) => (
  <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-wide">
      {isNew ? 'New Task' : 'Task Details'}
    </h2>
    <button
      onClick={onClose}
      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors duration-200"
    >
      <X className="h-6 w-6" />
    </button>
  </div>
);
