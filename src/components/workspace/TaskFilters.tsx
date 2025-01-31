import React, { useState, useRef, useEffect } from "react";
import { Filter, CheckCircle2, Target, Users, Circle, Clock, Check, AlertCircle } from "lucide-react";

interface TaskFiltersProps {
  statusFilter: string;
  priorityFilter: string;
  assigneeFilter: string;
  members: {
    user: {
      id: string;
      email: string;
    };
  }[];
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onAssigneeChange: (assigneeId: string) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  statusFilter,
  priorityFilter,
  assigneeFilter,
  members,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
}) => {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node)) {
        setIsPriorityOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo":
        return <Circle className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "done":
        return <Check className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "medium":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "low":
        return <AlertCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Target className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (value: string) => {
    switch (value) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusColor = (value: string) => {
    switch (value) {
      case "todo":
        return "text-red-500";
      case "in_progress":
        return "text-yellow-500";
      case "done":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const CustomSelect = ({ 
    value,
    onClick,
    isOpen,
    children 
  }: { 
    value: string;
    onClick: () => void;
    isOpen: boolean;
    children: React.ReactNode;
  }) => (
    <div className="relative">
      <button
        onClick={onClick}
        className={`
          w-full pl-4 pr-10 py-2.5 text-sm
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-lg
          text-left
          text-gray-900 dark:text-gray-100
          transition-all duration-200
          hover:border-purple-400 dark:hover:border-purple-500
          focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
          dark:focus:ring-purple-400/20 dark:focus:border-purple-400
          ${isOpen ? 'ring-2 ring-purple-500/20 border-purple-500' : ''}
        `}
      >
        {value}
        <div className={`absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          {children}
        </div>
      )}
    </div>
  );

  const SelectWrapper = ({ 
    label, 
    icon, 
    children 
  }: { 
    label: string; 
    icon: React.ReactNode; 
    children: React.ReactNode;
  }) => (
    <div className="relative flex-1 min-w-[240px]">
      <label className="flex items-center mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {icon}
        <span className="ml-2">{label}</span>
      </label>
      {children}
    </div>
  );

  const selectClasses = `
    w-full px-4 py-2.5 text-sm
    bg-white dark:bg-gray-800
    border border-gray-200 dark:border-gray-700
    rounded-lg
    text-gray-900 dark:text-gray-100
    appearance-none
    transition-all duration-200
    hover:border-purple-400 dark:hover:border-purple-500
    focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
    dark:focus:ring-purple-400/20 dark:focus:border-purple-400
    placeholder-gray-400 dark:placeholder-gray-500
    cursor-pointer
  `;

  const optionClasses = "flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors duration-150";

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "done", label: "Done" }
  ];

  const priorityOptions = [
    { value: "all", label: "All Priority" },
    { value: "low", label: "Low Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "high", label: "High Priority" }
  ];

  return (
    <div className="p-6 mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center mb-6 space-x-2">
        <div className="flex items-center px-3 py-1.5 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
          <Filter className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          <span className="ml-2 text-sm font-medium text-purple-700 dark:text-purple-400">
            Filters
          </span>
        </div>
        <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
      </div>

      <div className="flex flex-wrap gap-6">
        <SelectWrapper 
          label="Status" 
          icon={<CheckCircle2 className="w-4 h-4 text-gray-400" />}
        >
          <div ref={statusRef}>
            <CustomSelect
              value={statusOptions.find(opt => opt.value === statusFilter)?.label || "All Status"}
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              isOpen={isStatusOpen}
            >
              {statusOptions.map((option) => (
                <div
                  key={option.value}
                  className={`${optionClasses} ${getStatusColor(option.value)}`}
                  onClick={() => {
                    onStatusChange(option.value);
                    setIsStatusOpen(false);
                  }}
                >
                  {getStatusIcon(option.value)}
                  <span>{option.label}</span>
                </div>
              ))}
            </CustomSelect>
          </div>
        </SelectWrapper>

        <SelectWrapper 
          label="Priority" 
          icon={<Target className="w-4 h-4 text-gray-400" />}
        >
          <div ref={priorityRef}>
            <CustomSelect
              value={priorityOptions.find(opt => opt.value === priorityFilter)?.label || "All Priority"}
              onClick={() => setIsPriorityOpen(!isPriorityOpen)}
              isOpen={isPriorityOpen}
            >
              {priorityOptions.map((option) => (
                <div
                  key={option.value}
                  className={`${optionClasses} ${getPriorityColor(option.value)}`}
                  onClick={() => {
                    onPriorityChange(option.value);
                    setIsPriorityOpen(false);
                  }}
                >
                  {getPriorityIcon(option.value)}
                  <span>{option.label}</span>
                </div>
              ))}
            </CustomSelect>
          </div>
        </SelectWrapper>

        <SelectWrapper 
          label="Assigned To" 
          icon={<Users className="w-4 h-4 text-gray-400" />}
        >
          <select
            value={assigneeFilter}
            onChange={(e) => onAssigneeChange(e.target.value)}
            className={selectClasses}
          >
            <option value="all">All Members</option>
            <option value="unassigned">Unassigned</option>
            {members.map((member) => (
              <option key={member.user.id} value={member.user.id}>
                {member.user.email}
              </option>
            ))}
          </select>
        </SelectWrapper>
      </div>
    </div>
  );
};

export default TaskFilters;