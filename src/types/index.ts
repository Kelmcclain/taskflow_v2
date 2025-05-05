// src/types/index.ts

/**
 * Base workspace information
 */
export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
  updated_at?: string;
  workspace_members?: Array<{ count: number }>;
  tags?: string[]; // Array of tags for filtering and categorization
  color?: string; // Optional custom color for workspace
  icon?: string; // Optional custom icon identifier
  is_favorite?: boolean; // Whether the workspace is marked as favorite
  last_accessed_at?: string; // When the workspace was last accessed
}

/**
 * Workspace with additional member count information
 */
export type WorkspaceWithMembers = Workspace & {
  workspace_members: Array<{ count: number }>;
};

/**
 * Detailed workspace with full members list
 */
export interface WorkspaceWithFullMembers extends Workspace {
  members: WorkspaceMember[];
  task_count?: {
    todo: number;
    in_progress: number;
    done: number;
    total: number;
  };
}

/**
 * Role types within a workspace
 */
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest';

/**
 * Member of a workspace
 */
export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
  last_active_at?: string;
  user?: User;
  permissions?: WorkspacePermissions;
}

/**
 * Permissions for workspace members
 */
export interface WorkspacePermissions {
  can_edit: boolean;
  can_delete: boolean;
  can_invite: boolean;
  can_manage_members: boolean;
  can_create_tasks: boolean;
}

/**
 * Status options for tasks
 */
export type TaskStatus = 'todo' | 'in_progress' | 'reviewing' | 'done' | 'archived';

/**
 * Priority levels for tasks
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Task within a workspace
 */
export interface Task {
  id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  created_by: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  tags?: string[];
  subtasks?: SubTask[];
  attachments?: Attachment[];
  comments?: Comment[];
  time_estimate?: number; // In minutes
  time_spent?: number; // In minutes
}

/**
 * Subtask within a task
 */
export interface SubTask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at?: string;
  assignee_id?: string | null;
}

/**
 * File attachment
 */
export interface Attachment {
  id: string;
  task_id?: string;
  workspace_id?: string;
  filename: string;
  file_type: string;
  file_size: number; // Size in bytes
  url: string;
  uploaded_by: string;
  uploaded_at: string;
  thumbnail_url?: string;
}

/**
 * Comment on a task
 */
export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  mentions?: string[]; // Array of user IDs mentioned
  user?: User;
}

/**
 * User information
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  created_at?: string;
  last_active_at?: string;
  preferences?: UserPreferences;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  email_notifications: boolean;
  default_view_mode: 'grid' | 'list';
}

/**
 * View mode type for displaying workspaces and tasks
 */
export type ViewModeType = 'grid' | 'list';

/**
 * Sort options for workspaces
 */
export type WorkspaceSortOption = 'newest' | 'oldest' | 'alphabetical' | 'members' | 'last_accessed';

/**
 * Sort options for tasks
 */
export type TaskSortOption = 'newest' | 'oldest' | 'due_date' | 'priority' | 'status';

/**
 * Filter criteria for workspaces
 */
export interface WorkspaceFilter {
  query?: string;
  tags?: string[];
  created_by?: string;
  created_after?: string;
  created_before?: string;
  sort_by?: WorkspaceSortOption;
}

/**
 * Filter criteria for tasks
 */
export interface TaskFilter {
  query?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignee_id?: string[];
  tags?: string[];
  due_after?: string;
  due_before?: string;
  sort_by?: TaskSortOption;
}

/**
 * Response format for paginated workspace lists
 */
export interface WorkspacesResponse {
  workspaces: WorkspaceWithMembers[];
  total_count: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

/**
 * Response format for paginated task lists
 */
export interface TasksResponse {
  tasks: Task[];
  total_count: number;
  page: number;
  per_page: number;
  has_more: boolean;
}