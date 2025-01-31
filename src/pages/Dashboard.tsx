import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WorkspaceWithMembers } from "../types";
import {
  Calendar,
  ChevronRight,
  Folder,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { CreateWorkspaceModal } from "../components/CreateWorkspaceModal";
import { format } from "date-fns";
import { DeleteWorkspaceButton } from "../components/DeleteWorkspaceButton";
import { useWorkspace } from "../contexts/WorkspaceContext";

export const Dashboard: React.FC = () => {
  const { workspaces, isLoading } = useWorkspace();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const perPage = 12;

  const filteredWorkspaces = workspaces.filter(
    (workspace) =>
      workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedWorkspaces = filteredWorkspaces.slice(0, page * perPage);
  const hasMore = paginatedWorkspaces.length < filteredWorkspaces.length;

  const WorkspaceCard: React.FC<{ workspace: WorkspaceWithMembers }> = ({
    workspace,
  }) => (
    <div
      onClick={() => navigate(`/taskflow_v2/workspace/${workspace.id}`)}
      className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-purple-500/5 hover:border-purple-200 dark:hover:border-purple-500/30 transition-all duration-200 group relative"
    >
      <div className="absolute top-2 right-2">
        <DeleteWorkspaceButton
          workspaceId={workspace.id}
          workspaceName={workspace.name}
        />
      </div>
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
            <Folder className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {workspace.name}
          </h2>
        </div>
        {workspace.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {workspace.description}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1.5" />
            {workspace.workspace_members[0]?.count || 1} member
            {(workspace.workspace_members[0]?.count || 1) !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center text-xs">
            <Calendar className="h-4 w-4 mr-1.5" />
            {format(new Date(workspace.created_at), "MMM d, yyyy")}
          </div>
        </div>
      </div>
    </div>
  );

  const WorkspaceRow: React.FC<{ workspace: WorkspaceWithMembers }> = ({
    workspace,
  }) => (
    <div
      onClick={() => navigate(`/taskflow_v2/workspace/${workspace.id}`)}
      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md dark:hover:shadow-2xl dark:hover:shadow-purple-500/5 hover:border-purple-200 dark:hover:border-purple-500/30 transition-all duration-200 group"
    >
      <div className="flex items-center flex-1 min-w-0">
        <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
          <Folder className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
            {workspace.name}
          </h2>
          {workspace.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {workspace.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-6 ml-4">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Users className="h-4 w-4 mr-1.5" />
          {workspace.workspace_members[0]?.count || 1}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {format(new Date(workspace.created_at), "MMM d, yyyy")}
        </div>
        <DeleteWorkspaceButton
          workspaceId={workspace.id}
          workspaceName={workspace.name}
        />
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Workspaces
        </h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Workspace
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500 dark:focus:ring-purple-400 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list"
                ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
            }`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedWorkspaces.map((workspace) => (
                <WorkspaceCard key={workspace.id} workspace={workspace} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedWorkspaces.map((workspace) => (
                <WorkspaceRow key={workspace.id} workspace={workspace} />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
              >
                Load More
              </button>
            </div>
          )}

          {!isLoading && filteredWorkspaces.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Folder className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No workspaces found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? "No workspaces match your search criteria"
                  : "Get started by creating a new workspace using the button above"}
              </p>
            </div>
          )}
        </>
      )}

      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
