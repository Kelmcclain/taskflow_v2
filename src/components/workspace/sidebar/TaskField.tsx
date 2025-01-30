import React, { ReactNode } from 'react';

interface TaskFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}


export const TaskField: React.FC<TaskFieldProps> = ({ 
  label, 
  children, 
  className = '',
  icon
}) => (
  <div className={`space-y-2 ${className}`}>
    <div className="flex items-center gap-2">
      {icon}
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 tracking-wide">
        {label}
      </label>
    </div>
    {children}
  </div>
);
