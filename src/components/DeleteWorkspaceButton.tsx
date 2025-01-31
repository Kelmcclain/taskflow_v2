import React, { useState } from "react";
import { Trash2, X } from "lucide-react";
import { useWorkspace } from "../contexts/WorkspaceContext";
interface DeleteWorkspaceButtonProps {
  workspaceId: string;
  workspaceName: string;
}

export const DeleteWorkspaceButton: React.FC<DeleteWorkspaceButtonProps> = ({
  workspaceId,
  workspaceName,
}) => {
  const { userPermissions, deleteWorkspace } = useWorkspace();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // No permission = no render
  if (!userPermissions[workspaceId]) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteWorkspace(workspaceId);
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting workspace:", error);
      alert("Failed to delete workspace");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsDeleteOpen(true);
        }}
        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        title="Delete workspace"
      >
        <Trash2 className="h-5 w-5" />
      </button>

      {isDeleteOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={() => !isDeleting && setIsDeleteOpen(false)}
          />
          
          <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="absolute right-4 top-4">
              <button
                onClick={() => !isDeleting && setIsDeleteOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                disabled={isDeleting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Delete Workspace
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete "{workspaceName}"? This action cannot be undone
              and all associated data will be permanently deleted.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => !isDeleting && setIsDeleteOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Workspace'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};