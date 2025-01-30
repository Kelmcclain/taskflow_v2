import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import Header from "./Header";

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Layout: React.FC = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme() as ThemeContextType;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header
        user={user ? { email: user.email || '' } : null}
        theme={theme}
        onSignOut={handleSignOut}
        onToggleTheme={toggleTheme}
      />

      <main>
        <div className="pt-16">
          <Outlet />
        </div>
      </main>
    </div>
  );
};