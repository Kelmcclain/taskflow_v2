import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Task, Member } from "../../types/workspace";
import { useWorkspace } from "../../hooks/useWorkspace";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { TaskFilters } from "./TaskFilters";
import { TaskList } from "./TaskList";
import { TaskSidebar } from "./sidebar/TaskSidebar";
import { ManageWorkspaceMembersModal } from "./sidebar/manage_workspace_modal/ManageWorkspaceMembersModal";
import { supabase } from "../../lib/supabase";
import { Loader2 } from "lucide-react";
import { MobileMenuContext } from "../Layout";

export const Workspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { workspace, tasks, loading, createTask, updateTask, deleteTask } =
    useWorkspace(id!);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [sidebarClosing, setSidebarClosing] = useState(false);
  const { isMobileMenuOpen } = useContext(MobileMenuContext);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!workspace) return;

      const { data: membersData, error: membersError } = await supabase
        .from("workspace_members")
        .select(
          `
          id,
          workspace_id,
          user_id,
          role,
          created_at,
          users (
            email
          )
        `
        )
        .eq("workspace_id", workspace.id);

      if (membersError || !membersData) {
        console.error("Error fetching members:", membersError);
        return;
      }

      const userIds = membersData.map((m) => m.user_id);
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, email")
        .in("id", userIds);

      if (userError) {
        console.error("Error fetching user details:", userError);
        return;
      }

      if (userData) {
        setMembers(userData.map((user) => ({ user })));
      }
    };

    fetchMembers();
  }, [workspace]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
          <div className="text-sm font-medium">Loading workspace...</div>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Workspace not found
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            The workspace you're looking for doesn't exist or you don't have
            access to it.
          </p>
        </div>
      </div>
    );
  }

  const handleSelectTask = (task: Task) => {
    // Reset closing state and directly set the new task
    setSidebarClosing(false);
    setSelectedTask(task);
  };

  const handleCloseSidebar = () => {
    setSidebarClosing(true);
    setTimeout(() => {
      setSelectedTask(undefined);
      setSidebarClosing(false);
    }, 0);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    await updateTask(taskId, updates);
  };

  const handleCreateTask = async (taskData: Omit<Task, "id">) => {
    await createTask(taskData);
    handleCloseSidebar();
  };

  const handleAddTask = () => {
    const newTask: Omit<Task, "id"> = {
      workspace_id: workspace.id,
      title: "",
      description: "",
      status: "todo",
      priority: "low",
    };
    handleSelectTask(newTask as Task);
  };

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900 h-[calc(100vh-64px)] transition-colors duration-300">
      <WorkspaceSidebar
        workspace={workspace}
        onAddTask={handleAddTask}
        onManageMembers={() => setIsMembersModalOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden lg:pl-64">
        <div
          className={`will-change-width transition-[width] duration-300 ease-in-out p-4 md:p-6 overflow-auto
            ${selectedTask ? 'lg:w-1/2' : 'w-full'}`}
        >
          <TaskFilters
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            assigneeFilter={assigneeFilter}
            members={members}
            onStatusChange={setStatusFilter}
            onPriorityChange={setPriorityFilter}
            onAssigneeChange={setAssigneeFilter}
          />

          <TaskList
            tasks={tasks}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            assigneeFilter={assigneeFilter}
            onSelectTask={handleSelectTask}
          />
        </div>

        {selectedTask && (
          <div
            key={selectedTask.id || "new"}
            className={`fixed inset-0 lg:relative lg:w-1/2 overflow-auto h-full z-50 lg:z-auto
              transform transition-transform duration-200 ease-in-out bg-white dark:bg-gray-900
              ${sidebarClosing ? 'translate-x-full' : 'translate-x-0'}`}
          >
            <TaskSidebar
              task={selectedTask}
              onClose={handleCloseSidebar}
              onUpdate={handleUpdateTask}
              onCreate={handleCreateTask}
              onDelete={deleteTask}
            />
          </div>
        )}
      </div>

      <ManageWorkspaceMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        workspaceId={workspace.id}
      />
    </div>
  );
};
