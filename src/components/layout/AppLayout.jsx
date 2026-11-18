
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Header from './Header';
import Sidebar from './Sidebar';

export default function AppLayout({
  brandName = 'My Shop',
  user,
  notificationCount = 0,
  onNotificationsClick,
  onProfileClick,
  headerActions,
  sidebarSections,
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-background">

      <Header
        brandName={brandName}
        user={user}
        notificationCount={notificationCount}
        onNotificationsClick={onNotificationsClick}
        onProfileClick={onProfileClick}
        actions={headerActions}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">

        <Sidebar
          brandName={brandName}
          sections={sidebarSections}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
