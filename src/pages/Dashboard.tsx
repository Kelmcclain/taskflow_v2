import React, { useState, useEffect } from "react";
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
  Clock,
  Filter,
  ArrowRight,
  X,
  Info,
  AlertCircle,
} from "lucide-react";
import { CreateWorkspaceModal } from "../components/CreateWorkspaceModal";
import { format } from "date-fns";
import { DeleteWorkspaceButton } from "../components/DeleteWorkspaceButton";
import { useWorkspace } from "../contexts/WorkspaceContext";

type ViewModeType = "grid" | "list";
type SortOption = "newest" | "oldest" | "alphabetical" | "members";

export const Dashboard: React.FC = () => {
  const { workspaces, isLoading } = useWorkspace();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewModeType>("grid");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const navigate = useNavigate();
  const perPage = 9;

  // Reset pagination when search query changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedTag, sortBy]);

  // Get all unique tags from workspaces
  const allTags: string[] = React.useMemo(() => {
    const tags = new Set<string>();
    workspaces.forEach((workspace) => {
      const workspaceTags = workspace.tags || [];
      workspaceTags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [workspaces]);

  // Filter workspaces based on search query and selected tag
  const filteredWorkspaces = React.useMemo(() => {
    return workspaces.filter(
      (workspace) =>
        (workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (workspace.description?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          )) &&
        (!selectedTag || (workspace.tags || []).includes(selectedTag))
    );
  }, [workspaces, searchQuery, selectedTag]);

  // Sort workspaces
  const sortedWorkspaces = React.useMemo(() => {
    return [...filteredWorkspaces].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "alphabetical":
          return a.name.localeCompare(b.name);
        case "members": {
          const aMembers = a.workspace_members[0]?.count || 1;
          const bMembers = b.workspace_members[0]?.count || 1;
          return bMembers - aMembers;
        }
        default:
          return 0;
      }
    });
  }, [filteredWorkspaces, sortBy]);

  // Paginate workspaces
  const paginatedWorkspaces = sortedWorkspaces.slice(0, page * perPage);
  const hasMore = paginatedWorkspaces.length < sortedWorkspaces.length;

  // Format the date to be more user-friendly
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return "Today";
    } else if (diffDays <= 2) {
      return "Yesterday";
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return format(date, "MMM d, yyyy");
    }
  };

  // Generate a random gradient color based on workspace name
  const getGradientColor = (name: string): string => {
    const colors = [
      "from-purple-600 to-indigo-600",
      "from-blue-600 to-cyan-500",
      "from-emerald-500 to-teal-600",
      "from-orange-500 to-amber-500",
      "from-pink-500 to-rose-500",
      "from-violet-600 to-purple-600",
    ];
    
    // Use the workspace name as a seed for pseudo-random selection
    const charSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const index = charSum % colors.length;
    return colors[index];
  };

  // Component for displaying workspace in grid view
  const WorkspaceCard: React.FC<{ workspace: WorkspaceWithMembers }> = ({
    workspace,
  }) => {
    const gradientColor = getGradientColor(workspace.name);
    const memberCount = workspace.workspace_members[0]?.count || 1;
    
    return (
      <div
        onClick={() => navigate(`/workspace/${workspace.id}`)}
        className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-purple-500/10 hover:border-purple-300 dark:hover:border-purple-500/50 hover:-translate-y-1"
      >
        {/* Top gradient banner */}
        <div className={`h-3 w-full bg-gradient-to-r ${gradientColor}`} />
        
        {/* Delete button */}
        <div 
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <DeleteWorkspaceButton
            workspaceId={workspace.id}
            workspaceName={workspace.name}
          />
        </div>

        <div className="p-6">
          {/* Icon and title */}
          <div className="flex items-center mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientColor} shadow-lg`}>
              <Folder className="h-5 w-5 text-white" />
            </div>
            <h2 className="ml-4 text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
              {workspace.name}
            </h2>
          </div>
          
          {/* Description */}
          {workspace.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-5 line-clamp-2 min-h-[40px]">
              {workspace.description}
            </p>
          )}
          
          {/* Tags (if any) */}
          {(workspace.tags && workspace.tags.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {workspace.tags.slice(0, 2).map((tag) => (
                <span 
                  key={tag} 
                  className="px-2 py-1 text-xs font-medium rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                >
                  {tag}
                </span>
              ))}
              {workspace.tags.length > 2 && (
                <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  +{workspace.tags.length - 2} more
                </span>
              )}
            </div>
          )}
          
          {/* Footer statistics */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 text-sm">
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Users className="h-4 w-4 mr-1.5" />
              <span>{memberCount} {memberCount === 1 ? "member" : "members"}</span>
            </div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-1.5" />
              <span>{formatDate(workspace.created_at)}</span>
            </div>
          </div>
          
          {/* Hover reveal action indicator */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="h-5 w-5 text-purple-500 dark:text-purple-400" />
          </div>
        </div>
      </div>
    );
  };

  // Component for displaying workspace in list view
  const WorkspaceRow: React.FC<{ workspace: WorkspaceWithMembers }> = ({
    workspace,
  }) => {
    const gradientColor = getGradientColor(workspace.name);
    const memberCount = workspace.workspace_members[0]?.count || 1;
    
    return (
      <div
        onClick={() => navigate(`/workspace/${workspace.id}`)}
        className="group flex items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-purple-500/10 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all duration-200"
      >
        {/* Left color accent */}
        <div className={`h-full w-1.5 rounded-full bg-gradient-to-b ${gradientColor} mr-4`} />
        
        {/* Icon and content */}
        <div className="flex items-center flex-1 min-w-0">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientColor} shadow-md`}>
            <Folder className="h-4 w-4 text-white" />
          </div>
          <div className="ml-4 flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
              {workspace.name}
            </h2>
            {workspace.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-0.5">
                {workspace.description}
              </p>
            )}
            
            {/* Tags inline (in list view, show fewer) */}
            {(workspace.tags && workspace.tags.length > 0) && (
              <div className="flex flex-wrap gap-1 mt-1">
                {workspace.tags.slice(0, 1).map((tag) => (
                  <span 
                    key={tag} 
                    className="px-1.5 py-0.5 text-xs rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                  >
                    {tag}
                  </span>
                ))}
                {workspace.tags.length > 1 && (
                  <span className="px-1.5 py-0.5 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    +{workspace.tags.length - 1}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Right content - stats and actions */}
        <div className="flex items-center gap-6 ml-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Users className="h-4 w-4 mr-1.5" />
            <span>{memberCount}</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {formatDate(workspace.created_at)}
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <DeleteWorkspaceButton
              workspaceId={workspace.id}
              workspaceName={workspace.name}
            />
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
        </div>
      </div>
    );
  };

  // Empty state component
  const EmptyState: React.FC<{
    isFiltered: boolean;
    onClear?: () => void;
  }> = ({ isFiltered, onClear }) => (
    <div className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {isFiltered ? (
        <>
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            No matching workspaces
          </h3>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            We couldn't find any workspaces that match your current filters. Try adjusting your search or filters.
          </p>
          {onClear && (
            <button
              onClick={onClear}
              className="mt-4 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all"
            >
              <X className="h-4 w-4 mr-2" />
              Clear filters
            </button>
          )}
        </>
      ) : (
        <>
          <Folder className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            No workspaces yet
          </h3>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Get started by creating your first workspace. Workspaces help you organize your projects and collaborate with team members.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-6 inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First Workspace
          </button>
        </>
      )}
    </div>
  );

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTag(null);
    setSortBy("newest");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header with title and action button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Your Workspaces
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Manage and organize your projects in one place
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Workspace
        </button>
      </div>

      {/* Search and filters section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row p-4 gap-4">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-purple-500 dark:focus:border-purple-400 focus:ring-1 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Sort and filter controls */}
          <div className="flex items-center gap-3">
            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="pl-9 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm focus:border-purple-500 dark:focus:border-purple-400 focus:ring-1 focus:ring-purple-500 dark:focus:ring-purple-400 appearance-none transition-all"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="alphabetical">A to Z</option>
                <option value="members">Most members</option>
              </select>
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Filter button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`inline-flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isFilterOpen || selectedTag
                  ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
                  : "text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700"
              }`}
            >
              <Filter className={`h-5 w-5 ${selectedTag ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"} mr-2`} />
              {selectedTag ? `Filter: ${selectedTag}` : "Filter"}
              {selectedTag && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTag(null);
                  }}
                  className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </button>
            
            {/* View mode toggle */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                }`}
                aria-label="List view"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Tag filter section (collapsible) */}
        {isFilterOpen && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-wrap gap-2">
              {allTags.length > 0 ? (
                allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      tag === selectedTag
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                        : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-purple-200 dark:hover:border-purple-700"
                    }`}
                  >
                    {tag}
                  </button>
                ))
              ) : (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Info className="h-4 w-4 mr-2" />
                  No tags available yet. Add tags to your workspaces to filter by them.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main content area */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600 dark:text-purple-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading your workspaces...</p>
        </div>
      ) : (
        <>
          {/* Results summary */}
          {sortedWorkspaces.length > 0 && (
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Showing {Math.min(paginatedWorkspaces.length, sortedWorkspaces.length)} of {sortedWorkspaces.length} workspace{sortedWorkspaces.length !== 1 ? "s" : ""}
              </p>
              
              {/* Show clear filters button if filters are applied */}
              {(searchQuery || selectedTag || sortBy !== "newest") && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Grid or list view */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedWorkspaces.map((workspace) => (
                <WorkspaceCard key={workspace.id} workspace={workspace} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedWorkspaces.map((workspace) => (
                <WorkspaceRow key={workspace.id} workspace={workspace} />
              ))}
            </div>
          )}

          {/* Load more button */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all shadow-sm hover:shadow"
              >
                Load More Workspaces
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && sortedWorkspaces.length === 0 && (
            <EmptyState 
              isFiltered={searchQuery !== "" || selectedTag !== null} 
              onClear={clearFilters}
            />
          )}
        </>
      )}

      {/* Create workspace modal */}
      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};