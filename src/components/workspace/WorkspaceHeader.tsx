import React from 'react';
import { Users, Plus } from 'lucide-react';
import { WorkspaceHeaderProps } from '../../types/workspace';

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  workspace,
  onAddTask,
  onManageMembers,
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
          {workspace.description && (
            <p className="mt-2 text-gray-600">{workspace.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onManageMembers}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Members
          </button>
          <button
            onClick={onAddTask}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </button>
        </div>
      </div>
    </div>
  );
};