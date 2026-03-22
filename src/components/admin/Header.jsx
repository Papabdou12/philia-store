import React from 'react';
import { Menu, User, Sun, Moon, ExternalLink } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import NotificationDropdown from '@/components/admin/NotificationDropdown';

const Header = ({ title, onMenuClick }) => {
  const { user } = useAdminAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-bronze/20">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-serif text-gray-900 dark:text-white">{title}</h2>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Voir le site */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Voir le site"
            className="p-2 rounded-lg text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-5 h-5" />
          </a>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
            className="p-2 rounded-lg text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <NotificationDropdown />

          {/* User */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-bronze/20">
            <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gold" />
            </div>
            <div className="hidden sm:block">
              <p className="text-gray-900 dark:text-white text-sm font-medium">
                {user?.user_metadata?.name || 'Admin'}
              </p>
              <p className="text-gray-400 dark:text-white/40 text-xs">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
