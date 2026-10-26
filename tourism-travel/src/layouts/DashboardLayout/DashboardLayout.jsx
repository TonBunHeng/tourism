import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import AuthModal from '../../components/common/AuthModal';
import LogoutAlert from '../../components/layout/LogoutAlert';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Sidebar (Desktop Fixed, Mobile Drawer) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Layout with Margin Offset for Sidebar on Desktop */}
      <div className="lg:pl-72 flex flex-col min-h-screen flex-1">
        {/* Top Management Header */}
        <DashboardHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Dashboard Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Modals & Alerts */}
      <AuthModal />
      <LogoutAlert />
    </div>
  );
}
