import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NotificationProvider } from '../Notifications/NotificationProvider';
import { DebugNavigation } from '../DebugNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
        </div>
        <DebugNavigation />
      </div>
    </NotificationProvider>
  );
};