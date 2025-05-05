import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '../../../lib/supabase';
import { Task, Member } from '../../../types/workspace';
import { TaskForm } from './TaskForm';
import { TaskActions } from './TaskActions';
import { X } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);

  // Handle animation
  useEffect(() => {
    // Open animation on mount
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

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
    // If it's description field, don't trim the HTML content
    const processedValue = field === 'description' ? value : value;
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    if (error) setError(null);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description, // Don't trim HTML content
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
      handleClosePanel();
    } catch (error) {
      console.error('Error saving task:', error);
      setError('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isNewTask) {
      handleClosePanel();
      return;
    }

    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setLoading(true);
        await onDelete(task.id);
        handleClosePanel();
      } catch (error) {
        console.error('Error deleting task:', error);
        setError('Failed to delete task');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleClosePanel = () => {
    setIsOpen(false);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <>
      {/* Backdrop overlay with blur and dim */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClosePanel}
        aria-hidden="true"
      />
      
      {/* Task sidebar panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5 h-full bg-white dark:bg-gray-800 shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header with mobile-friendly close button */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isNewTask ? 'New Task' : 'Edit Task'}
            </h2>
            <button
              onClick={handleClosePanel}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6">
              {error && (
                <div className="mb-4 p-3 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-md">
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
          
          {/* Fixed footer with actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800">
            <TaskActions
              isNew={isNewTask}
              loading={loading}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </>
  );
};