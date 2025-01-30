import React, { createContext, useContext, useEffect, useState } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { Task, Workspace, WorkspaceMember } from "../types";

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaceMembers: WorkspaceMember[];
  tasks: Task[];
  isLoading: boolean;
  fetchWorkspace: (id: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  createTask: (newTask: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addWorkspaceMember: (email: string, role?: string) => Promise<void>;
  removeWorkspaceMember: (userId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>(
    []
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchWorkspaceMembers = async (workspaceId: string) => {
    // First get the workspace members with user data in a single query
    const { data: members, error: membersError } = await supabase
      .from("workspace_members")
      .select(`
        *,
        user:users!inner (
          id,
          email,
          raw_user_meta_data,
          is_super_admin
        )
      `)
      .eq("workspace_id", workspaceId);

    if (membersError) {
      console.error("Error fetching members:", membersError);
      return;
    }

    setWorkspaceMembers(members);
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
          // Refresh members list on any change
          fetchWorkspaceMembers(workspaceId);
        }
      )
      .subscribe();

    setChannel(newChannel);
  };

  const fetchWorkspace = async (id: string) => {
    setIsLoading(true);
    try {
      // Fetch workspace details
      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", id)
        .single();

      if (workspaceError) throw workspaceError;
      setCurrentWorkspace(workspace);

      // Fetch workspace members with user details
      await fetchWorkspaceMembers(id);

      // Fetch tasks
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("workspace_id", id);

      if (tasksError) throw tasksError;
      setTasks(tasks);

      // Setup realtime subscription
      setupRealtimeSubscription(id);
    } catch (error) {
      console.error("Error fetching workspace data:", error);
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

  const addWorkspaceMember = async (email: string, role: string = "member") => {
    if (!currentWorkspace) return;

    // First, get the user ID from the email using the public.users view
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError) throw userError;

    // Then add the member
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

    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("workspace_id", currentWorkspace.id)
      .eq("user_id", userId);

    if (error) throw error;
  };

  useEffect(() => {
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);

  const value = {
    currentWorkspace,
    workspaceMembers,
    tasks,
    isLoading,
    fetchWorkspace,
    updateTask,
    createTask,
    deleteTask,
    addWorkspaceMember,
    removeWorkspaceMember,
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