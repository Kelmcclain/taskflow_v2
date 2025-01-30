// TaskForm.tsx
import React from 'react';
import { TaskField } from './TaskField';
import { Member, Task } from '../../../types/workspace';
import { 
  Calendar, 
  CheckCircle2, 
  CircleDashed, 
  Flag, 
  Play, 
  User2,
  AlignLeft,
  Type
} from 'lucide-react';

interface TaskFormProps {
  formData: {
    title: string;
    description: string;
    status: Task['status'];
    priority: Task['priority'];
    assignee_id: string;
    due_date: string;
  };
  onChange: (field: string, value: string) => void;
  members: Member[];
}

const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'high':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};

const getStatusIcon = (status: Task['status']) => {
  switch (status) {
    case 'done':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'in_progress':
      return <Play className="w-4 h-4 text-blue-500" />;
    case 'todo':
      return <CircleDashed className="w-4 h-4 text-gray-500" />;
    default:
      return null;
  }
};

export const TaskForm: React.FC<TaskFormProps> = ({
  formData,
  onChange,
  members,
}) => {
  const inputBaseClasses = "mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:focus:border-purple-400 dark:focus:ring-purple-400 focus:ring-2 transition-all duration-200";
  
  return (
    <div className="space-y-8 p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      <TaskField 
        label="Title" 
        icon={<Type className="w-4 h-4 text-gray-400" />}
      >
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          className={`${inputBaseClasses} h-12 px-4`}
          placeholder="What needs to be done?"
        />
      </TaskField>

      <TaskField 
        label="Description"
        icon={<AlignLeft className="w-4 h-4 text-gray-400" />}
      >
        <textarea
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={4}
          className={`${inputBaseClasses} px-4 py-3 resize-none`}
          placeholder="Add more details about this task..."
        />
      </TaskField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TaskField 
          label="Status"
          icon={getStatusIcon(formData.status)}
        >
          <select
            value={formData.status}
            onChange={(e) => onChange('status', e.target.value)}
            className={`${inputBaseClasses} h-12 px-4`}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </TaskField>

        <TaskField 
          label="Priority"
          icon={<Flag className={`w-4 h-4 ${getPriorityColor(formData.priority)}`} />}
        >
          <select
            value={formData.priority}
            onChange={(e) => onChange('priority', e.target.value)}
            className={`${inputBaseClasses} h-12 px-4`}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </TaskField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TaskField 
          label="Assign To"
          icon={<User2 className="w-4 h-4 text-gray-400" />}
        >
          <select
            value={formData.assignee_id}
            onChange={(e) => onChange('assignee_id', e.target.value)}
            className={`${inputBaseClasses} h-12 px-4`}
          >
            <option value="">Select assignee...</option>
            {members.map((member) => (
              <option key={member.user.id} value={member.user.id}>
                {member.user.email}
              </option>
            ))}
          </select>
        </TaskField>

        <TaskField 
          label="Due Date"
          icon={<Calendar className="w-4 h-4 text-gray-400" />}
        >
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => onChange('due_date', e.target.value)}
            className={`${inputBaseClasses} h-12 px-4`}
          />
        </TaskField>
      </div>
    </div>
  );
};
