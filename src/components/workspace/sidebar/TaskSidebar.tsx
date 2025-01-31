
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '../../../lib/supabase';
import { Task, Member } from '../../../types/workspace';
import { TaskHeader } from './TaskHeader';
import { TaskForm } from './TaskForm';
import { TaskActions } from './TaskActions';

interface TaskSidebarProps {
  task: Task;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onCreate: (taskData: Omit<Task, 'id'>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export const TaskSidebar: React.FC<TaskSidebarProps> = ({
  task,
  onClose,
  onUpdate,
  onCreate,
  onDelete,
}) => {
  const isNewTask = !task.id || task.id === 'new';
  
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'todo',
    priority: task.priority || 'low',
    assignee_id: task.assignee_id || '',
    due_date: task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : ''
  });
  
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when task changes
  useEffect(() => {
    setFormData({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'low',
      assignee_id: task.assignee_id || '',
      due_date: task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : ''
    });
  }, [task]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data: membersData, error: membersError } = await supabase
          .from('workspace_members')
          .select('user_id')
          .eq('workspace_id', task.workspace_id);

        if (membersError) throw membersError;
        if (!membersData) return;

        const userIds = membersData.map((m) => m.user_id);
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email')
          .in('id', userIds);

        if (userError) throw userError;
        if (userData) {
          setMembers(userData.map((user) => ({ user })));
        }
      } catch (error) {
        console.error('Error fetching members:', error);
        setError('Failed to load workspace members');
      }
    };

    fetchMembers();
  }, [task.workspace_id]);

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Task title is required');
      return false;
    }
    setError(null);
    return true;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        assignee_id: formData.assignee_id || undefined,
        due_date: formData.due_date || undefined,
      };

      if (isNewTask) {
        await onCreate({
          ...taskData,
          workspace_id: task.workspace_id,
        });
      } else {
        await onUpdate(task.id, taskData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      setError('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isNewTask) {
      onClose();
      return;
    }

    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setLoading(true);
        await onDelete(task.id);
        onClose();
      } catch (error) {
        console.error('Error deleting task:', error);
        setError('Failed to delete task');
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <div className="h-full border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <div className="h-full flex flex-col max-w-2xl mx-auto lg:mx-0">
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <TaskHeader isNew={isNewTask} onClose={onClose} />
            {error && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-100 rounded-md">
                {error}
              </div>
            )}
            <TaskForm
              formData={formData}
              onChange={handleInputChange}
              members={members}
            />
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
          <TaskActions
            isNew={isNewTask}
            loading={loading}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};
