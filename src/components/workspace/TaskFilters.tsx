import React from 'react';
import { Filter } from 'lucide-react';
import { Member } from '../../types/workspace';

interface TaskFiltersProps {
  statusFilter: string;
  priorityFilter: string;
  assigneeFilter: string;
  members: Member[];
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onAssigneeChange: (assigneeId: string) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  statusFilter,
  priorityFilter,
  assigneeFilter,
  members,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
}) => {
  const selectClasses = `
    block w-full rounded-md border-gray-300 dark:border-gray-600 
    bg-white dark:bg-gray-800 
    text-gray-900 dark:text-gray-200 
    shadow-sm 
    focus:border-purple-500 dark:focus:border-purple-400 
    focus:ring-purple-500 dark:focus:ring-purple-400 
    focus:ring-2
    text-sm
    transition-colors duration-200
  `;

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 backdrop-blur-sm backdrop-filter">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex items-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-md">
            <Filter className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => onStatusChange(e.target.value)}
                className={selectClasses}
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => onPriorityChange(e.target.value)}
                className={selectClasses}
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Assigned To
              </label>
              <select
                value={assigneeFilter}
                onChange={(e) => onAssigneeChange(e.target.value)}
                className={selectClasses}
              >
                <option value="all">All Members</option>
                <option value="unassigned">Unassigned</option>
                {members.map((member) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};