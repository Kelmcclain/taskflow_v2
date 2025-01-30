import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  icon
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl">
          {/* Decorative elements */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />

          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-purple-500/10 border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-8 pb-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {icon && (
                    <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg mr-3">
                      {icon}
                    </div>
                  )}
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-8 pt-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};