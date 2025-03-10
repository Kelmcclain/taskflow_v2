import React, { useContext } from 'react';
import { Users, Plus, Layout } from 'lucide-react';
import { Workspace } from '../../types/workspace';
import { MobileMenuContext } from '../Layout';

interface WorkspaceSidebarProps {
  workspace: Workspace;
  onAddTask: () => void;
  onManageMembers: () => void;
  isMobileMenuOpen: boolean;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  workspace,
  onAddTask,
  onManageMembers,
  isMobileMenuOpen,
}) => {
  const { setIsMobileMenuOpen } = useContext(MobileMenuContext);

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{workspace.name}</h1>
        {workspace.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{workspace.description}</p>
        )}
      </div>

      <div className="px-4">
        <div className="space-y-2">
          <button
            onClick={onAddTask}
            className="w-full inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 dark:bg-purple-600 hover:bg-purple-700 dark:hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-purple-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </button>
          <button
            onClick={onManageMembers}
            className="w-full inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-purple-500 transition-colors"
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Members
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer">
          <Layout className="h-4 w-4 mr-2" />
          <span>Workspace Settings</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed top-16 bottom-0 transition-colors">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-0 z-20 transition-transform transform duration-100 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />

        {/* Sidebar Content */}
        <div className="relative w-64 h-full bg-white dark:bg-gray-800 shadow-xl">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default WorkspaceSidebar;