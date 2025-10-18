import React from 'react';
import { Search, Bell, User, ChevronDown, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSGT } from '../../context/SGTContext';
import { useAuth } from '../../hooks/use-auth';
import { useTheme } from '../../context/ThemeContext';

export const Header: React.FC = () => {
  const { state } = useSGT();
  const { usuario, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pendingNotifications = state.notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-40 shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar expedientes, clientes, trámites..."
              className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2 ml-6">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 group"
            title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            ) : (
              <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-2.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 group">
            <Bell className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
            {pendingNotifications > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-semibold shadow-lg shadow-red-500/50 animate-pulse">
                {pendingNotifications > 9 ? '9+' : pendingNotifications}
              </span>
            )}
          </button>

          {/* User menu */}
          <div className="flex items-center space-x-2 ml-2">
            <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-blue-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {usuario?.nombre} {usuario?.apellido}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 capitalize font-medium">{usuario?.rol}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all group"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};