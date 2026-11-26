
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'

import Header from './Header'
import Sidebar from './Sidebar'
import SyncBadge from '../SyncBadge'

import { useTheme } from '../../../../context/ThemeContext'
import { useRole } from '../../../../context/AuthContext'

export default function AppLayout({
  brandName = 'My Shop',
  notificationCount = 0,
  onNotificationsClick,
  onProfileClick,
  headerActions,
  sidebarSections,
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const { isDark, toggleTheme } = useTheme()
  const { user, profile } = useRole()

  const themeButton = (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="
        flex h-10 w-10 shrink-0 items-center justify-center
        rounded-lg text-text-secondary transition-colors
        hover:bg-surface hover:text-text-primary
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-interactive-primary
      "
    >
      {isDark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  )

  const headerUser = profile
    ? {
        ...profile,
        name:
          profile.name ||
          profile.full_name ||
          profile.email ||
          user?.email ||
          '',
        avatar: profile.avatar_url || profile.avatar || '',
      }
    : user
      ? {
          name: user.email || '',
          avatar: '',
        }
      : null

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-background">
      <Header
        brandName={brandName}
        user={headerUser}
        notificationCount={notificationCount}
        onNotificationsClick={onNotificationsClick}
        onProfileClick={onProfileClick}
        actions={
          <>
            <SyncBadge />
            {themeButton}
            {headerActions}
          </>
        }
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          sections={sidebarSections}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        <main className="min-w-0 min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
