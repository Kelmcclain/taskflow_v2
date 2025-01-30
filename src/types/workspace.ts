export interface Task {
    id: string;
    workspace_id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    assignee_id?: string;
    due_date?: string;
  }
  
  export interface Workspace {
    id: string;
    name: string;
    description?: string;
  }
  
  export interface Member {
    user: {
      id: string;
      email: string;
    };
  }
  
  export interface WorkspaceHeaderProps {
    workspace: Workspace;
    onAddTask: () => void;
    onManageMembers: () => void;
  }
  
  export interface TaskListProps {
    tasks: Task[];
    statusFilter: string;
    priorityFilter: string;
    onSelectTask: (task: Task) => void;
  }
  
  export interface TaskFiltersProps {
    statusFilter: string;
    priorityFilter: string;
    onStatusChange: (status: string) => void;
    onPriorityChange: (priority: string) => void;
  }
  
  export interface TaskSidebarProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
    onDelete: (taskId: string) => Promise<void>;
  }