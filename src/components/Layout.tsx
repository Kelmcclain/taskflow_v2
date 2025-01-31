import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import Header from "./Header";

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Create a context for the mobile menu state
export const MobileMenuContext = React.createContext<{
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}>({
  isMobileMenuOpen: false,
  setIsMobileMenuOpen: () => {},
});

export const Layout: React.FC = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme() as ThemeContextType;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/taskflow_v2/auth");
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Check if we're on a workspace page
  const isWorkspacePage = location.pathname.includes('/workspace/');

  return (
    <MobileMenuContext.Provider value={{ isMobileMenuOpen, setIsMobileMenuOpen }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Header
          user={user ? { email: user.email || '' } : null}
          theme={theme}
          onSignOut={handleSignOut}
          onToggleTheme={toggleTheme}
          isMobileMenuOpen={isWorkspacePage ? isMobileMenuOpen : undefined}
          onMobileMenuToggle={isWorkspacePage ? handleMobileMenuToggle : undefined}
        />

        <main>
          <div className="pt-16">
            <Outlet />
          </div>
        </main>
      </div>
    </MobileMenuContext.Provider>
  );
};