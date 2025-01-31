import React from "react";
import { format } from "date-fns";
import { CheckCircle, Clock, Circle, Users, Calendar } from "lucide-react";
import { Task } from "../../types/workspace";

interface TaskListProps {
  tasks: Task[];
  statusFilter: string;
  priorityFilter: string;
  assigneeFilter: string;
  onSelectTask: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  statusFilter,
  priorityFilter,
  assigneeFilter,
  onSelectTask,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return (
          <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
        );
      case "in_progress":
        return (
          <Clock className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
        );
      default:
        return <Circle className="h-5 w-5 text-gray-400 dark:text-gray-500" />;
    }
  };

  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      default:
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = statusFilter === "all" || task.status === statusFilter;
    const priorityMatch =
      priorityFilter === "all" || task.priority === priorityFilter;
    const assigneeMatch =
      assigneeFilter === "all" ||
      (assigneeFilter === "unassigned" && !task.assignee_id) ||
      task.assignee_id === assigneeFilter;

    return statusMatch && priorityMatch && assigneeMatch;
  });

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No tasks match your filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredTasks.map((task) => (
        <div
          key={task.id}
          onClick={() => onSelectTask(task)}
          className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 
            hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-purple-500/5 
            hover:border-purple-200 dark:hover:border-purple-500/30
            transition-all duration-200 cursor-pointer"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex items-start space-x-4">
              <div className="mt-1">{getStatusIcon(task.status)}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-purple-600 
                  dark:group-hover:text-purple-400 transition-colors">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:ml-4">
              {task.assignee_id && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 
                  bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                  <Users className="h-4 w-4 mr-1.5" />
                  <span>Assigned</span>
                </div>
              )}
              {task.due_date && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 
                  bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md whitespace-nowrap">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  <span>{format(new Date(task.due_date), "MMM d, yyyy")}</span>
                </div>
              )}
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium 
                  uppercase tracking-wide ${getPriorityClasses(task.priority)}`}
              >
                {task.priority}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};