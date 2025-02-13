import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Task, Workspace } from "../types/workspace";

export const useWorkspace = (workspaceId: string) => {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      if (!workspaceId) return;

      try {
        const [workspaceResponse, tasksResponse] = await Promise.all([
          supabase
            .from("workspaces")
            .select("*")
            .eq("id", workspaceId)
            .single(),
          supabase
            .from("tasks")
            .select("*")
            .eq("workspace_id", workspaceId)
            .order("created_at", { ascending: false }),
        ]);

        if (workspaceResponse.error) throw workspaceResponse.error;
        if (tasksResponse.error) throw tasksResponse.error;

        setWorkspace(workspaceResponse.data);
        setTasks(tasksResponse.data);
      } catch (error) {
        console.error("Error fetching workspace data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceData();

    // Set up real-time subscription
    const channel = supabase
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
          console.log("Received real-time update:", payload);

          if (payload.eventType === "INSERT") {
            setTasks((currentTasks) => [...currentTasks, payload.new as Task]);
          } else if (payload.eventType === "UPDATE") {
            setTasks((currentTasks) =>
              currentTasks.map((task) =>
                task.id === payload.new.id ? (payload.new as Task) : task
              )
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((currentTasks) =>
              currentTasks.filter((task) => task.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [workspaceId]);

  const createTask = async (taskData: Omit<Task, "id">) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;

      // Optimistically update the UI
      setTasks((currentTasks) => [...currentTasks, data as Task]);
      return data;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;

      // Optimistically update the UI
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      );
      return data;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;

      // Optimistically update the UI
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      );
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  };

  return {
    workspace,
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
  };
};
