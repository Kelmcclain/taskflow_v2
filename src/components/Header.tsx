import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, LogOut, Moon, Sun, Bell, Settings } from 'lucide-react';

interface HeaderProps {
  user: { email: string } | null;
  theme: 'light' | 'dark';
  onSignOut: () => void;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  theme,
  onSignOut,
  onToggleTheme,
}) => {
  const [isNotificationHovered, setIsNotificationHovered] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Animated gradient border */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x" />
      
      <nav className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-lg dark:shadow-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Link to="/taskflow_v2" className="flex items-center group">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
                  <div className="relative p-2 bg-white dark:bg-gray-800 rounded-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                    <LayoutGrid className="h-6 w-6 text-indigo-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="ml-3 flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                    Taskflow
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 tracking-wider">WORKSPACE</span>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-3">
              {user && (
                <>
                  <div 
                    className="relative group"
                    onMouseEnter={() => setIsNotificationHovered(true)}
                    onMouseLeave={() => setIsNotificationHovered(false)}
                  >
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
                      <Bell className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isNotificationHovered ? 'rotate-12' : ''}`} />
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
                    </button>
                    {isNotificationHovered && (
                      <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 text-sm">
                        <div className="px-3 py-2 text-gray-500 dark:text-gray-400">No new notifications</div>
                      </div>
                    )}
                  </div>

                  <div className="hidden sm:flex items-center bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 p-0.5 rounded-lg">
                    <div className="px-3 py-1 bg-white dark:bg-gray-800 rounded-md flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 max-w-[150px] truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:rotate-90 transition-transform duration-500" />
                  </button>
                </>
              )}

              <button
                onClick={onToggleTheme}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors overflow-hidden"
                aria-label="Toggle theme"
              >
                <div className="relative w-6 h-6">
                  <Sun
                    className={`w-6 h-6 text-amber-500 transform transition-all duration-500 ${
                      theme === "dark" ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"
                    }`}
                  />
                  <Moon
                    className={`w-6 h-6 text-purple-400 absolute top-0 left-0 transform transition-all duration-500 ${
                      theme === "dark" ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"
                    }`}
                  />
                </div>
              </button>

              {user && (
                <button
                  onClick={onSignOut}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 focus:outline-none transition-colors group relative"
                >
                  <LogOut className="h-5 w-5 transition-all duration-300 group-hover:-translate-x-1" />
                  <span className="absolute top-full right-0 mt-1 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Sign out
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;