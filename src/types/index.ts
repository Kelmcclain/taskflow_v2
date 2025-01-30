// src/types/index.ts
export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
  workspace_members?: Array<{ count: number }>;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user?: {
    id: string;
    email: string;
  };
}

export interface Task {
  id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id: string | null;
  created_by: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export type WorkspaceWithMembers = Workspace & {
  workspace_members: Array<{ count: number }>;
};

export interface User {
  id: string;
  email: string;
}