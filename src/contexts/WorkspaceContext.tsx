import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  Task,
  Workspace,
  WorkspaceMember,
  WorkspaceWithMembers,
} from "../types";
import { useAuth } from "./AuthContext";

interface WorkspaceContextType {
  workspaces: WorkspaceWithMembers[];
  currentWorkspace: Workspace | null;
  workspaceMembers: WorkspaceMember[];
  tasks: Task[];
  isLoading: boolean;
  userPermissions: Record<string, boolean>;
  createWorkspace: (data: {
    name: string;
    description?: string;
  }) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  checkDeletePermission: (workspaceId: string) => Promise<boolean>;
  fetchWorkspaces: () => Promise<void>;
  fetchWorkspace: (id: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  createTask: (newTask: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addWorkspaceMember: (email: string, role?: string) => Promise<void>;
  removeWorkspaceMember: (userId: string) => Promise<void>;
  checkUserRole: (
    workspaceId: string,
    userId: string
  ) => Promise<string | null>;
  updateWorkspace: (
    workspaceId: string,
    updates: Partial<Workspace>
  ) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceWithMembers[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>(
    []
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [userPermissions, setUserPermissions] = useState<
    Record<string, boolean>
  >({});

  const checkDeletePermission = useCallback(
    async (workspaceId: string) => {
      if (!user) return false;

      // First check cache
      if (Object.prototype.hasOwnProperty.call(userPermissions, workspaceId)) {
        return userPermissions[workspaceId];
      }

      // Check if user is super admin
      const { data: userData } = await supabase
        .from("users")
        .select("is_super_admin")
        .eq("id", user.id)
        .single();

      if (userData?.is_super_admin) {
        setUserPermissions((prev) => ({ ...prev, [workspaceId]: true }));
        return true;
      }

      // Check if user is workspace owner
      const { data: memberData } = await supabase
        .from("workspace_members")
        .select("role")
        .eq("workspace_id", workspaceId)
        .eq("user_id", user.id)
        .eq("role", "owner")
        .maybeSingle();

      const canDelete = !!memberData;
      setUserPermissions((prev) => ({ ...prev, [workspaceId]: canDelete }));
      return canDelete;
    },
    [user, userPermissions]
  );

  const checkUserRole = async (workspaceId: string, userId: string) => {
    const { data, error } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error checking role:", error);
      return null;
    }

    return data?.role || null;
  };

  const fetchWorkspaceMembers = async (workspaceId: string) => {
    const { data: members, error: membersError } = await supabase
      .from("workspace_members")
      .select(
        `
        *,
        user:users!inner (
          id,
          email,
          raw_user_meta_data,
          is_super_admin
        )
      `
      )
      .eq("workspace_id", workspaceId);

    if (membersError) {
      console.error("Error fetching members:", membersError);
      return;
    }

    setWorkspaceMembers(members || []);
  };

  const setupRealtimeSubscription = (workspaceId: string) => {
    if (channel) {
      channel.unsubscribe();
    }

    const newChannel = supabase
      .channel(`workspace-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTasks((current) => [...current, payload.new as Task]);
          } else if (payload.eventType === "UPDATE") {
            setTasks((current) =>
              current.map((task) =>
                task.id === payload.new.id ? (payload.new as Task) : task
              )
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((current) =>
              current.filter((task) => task.id !== payload.old.id)
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_members",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          fetchWorkspaceMembers(workspaceId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "workspaces",
          filter: `id=eq.${workspaceId}`,
        },
        (payload) => {
          setCurrentWorkspace(payload.new as Workspace);
        }
      )
      .subscribe();

    setChannel(newChannel);
  };

  const fetchWorkspaces = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get user's super admin status first
      const { data: userData } = await supabase
        .from("users")
        .select("is_super_admin")
        .eq("id", user.id)
        .single();

      // Fetch workspaces with member counts and owner info separately
      const { data: workspaces, error } = await supabase
        .from("workspaces")
        .select(
          `
          *,
          members:workspace_members(count),
          workspace_members!inner (
            role,
            user_id
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Process permissions for all workspaces at once
      const permissions: Record<string, boolean> = {};
      workspaces?.forEach((workspace) => {
        permissions[workspace.id] =
          userData?.is_super_admin ||
          workspace.workspace_members.some(
            (member: { user_id: string; role: string }) =>
              member.user_id === user.id && member.role === "owner"
          );
      });

      setWorkspaces(workspaces || []);
      setUserPermissions(permissions);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      setWorkspaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    } else {
      setWorkspaces([]);
    }
  }, [user, fetchWorkspaces]);

  const fetchWorkspace = async (id: string) => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");

      const role = await checkUserRole(id, user.id);
      if (!role) {
        throw new Error("Unauthorized: Not a member of this workspace");
      }

      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", id)
        .single();

      if (workspaceError) throw workspaceError;
      setCurrentWorkspace(workspace);

      await fetchWorkspaceMembers(id);

      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("workspace_id", id)
        .order("created_at", { ascending: false });

      if (tasksError) throw tasksError;
      setTasks(tasks || []);

      setupRealtimeSubscription(id);
    } catch (error) {
      console.error("Error fetching workspace data:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const { error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId);
    if (error) throw error;
  };

  const createTask = async (newTask: Partial<Task>) => {
    const { error } = await supabase.from("tasks").insert([newTask]);
    if (error) throw error;
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) throw error;
  };

  const updateWorkspace = async (
    workspaceId: string,
    updates: Partial<Workspace>
  ) => {
    const { error } = await supabase
      .from("workspaces")
      .update(updates)
      .eq("id", workspaceId);
    if (error) throw error;
  };

  const addWorkspaceMember = async (email: string, role: string = "member") => {
    if (!currentWorkspace) return;

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError) throw userError;

    const { error } = await supabase.from("workspace_members").insert([
      {
        workspace_id: currentWorkspace.id,
        user_id: userData.id,
        role,
      },
    ]);

    if (error) throw error;
  };

  const removeWorkspaceMember = async (userId: string) => {
    if (!currentWorkspace) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    // Check if the user is an owner
    const role = await checkUserRole(currentWorkspace.id, user.id);
    if (role !== "owner") {
      throw new Error("Only workspace owners can remove members");
    }

    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("workspace_id", currentWorkspace.id)
      .eq("user_id", userId);

    if (error) throw error;
  };

  const deleteWorkspace = useCallback(
    async (workspaceId: string) => {
      const { error } = await supabase
        .from("workspaces")
        .delete()
        .eq("id", workspaceId);

      if (error) throw error;
      setWorkspaces((prev) => prev.filter((ws) => ws.id !== workspaceId));
    },
    [setWorkspaces]
  );

  const createWorkspace = useCallback(
    async (data: { name: string; description?: string }) => {
      if (!user) return;

      try {
        const { data: workspace, error } = await supabase.rpc(
          "create_workspace_with_owner",
          {
            workspace_name: data.name,
            creator_id: user.id,
            description: data.description || null,
          }
        );

        if (error) throw error;

        console.log("Created workspace:", workspace);
        await fetchWorkspaces();
      } catch (error) {
        console.error("Error creating workspace:", error);
      }
    },
    [user, fetchWorkspaces]
  );

  useEffect(() => {
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  });

  const value = {
    workspaces,
    currentWorkspace,
    workspaceMembers,
    tasks,
    isLoading,
    fetchWorkspaces,
    fetchWorkspace,
    updateTask,
    createTask,
    deleteTask,
    addWorkspaceMember,
    removeWorkspaceMember,
    checkUserRole,
    updateWorkspace,
    userPermissions,
    checkDeletePermission,
    deleteWorkspace,
    createWorkspace,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
