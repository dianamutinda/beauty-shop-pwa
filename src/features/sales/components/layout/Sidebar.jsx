
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Search,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Clock,
  ClipboardList,
  UserCircle,
} from 'lucide-react'

import { useRole } from '../../../../context/AuthContext'

const ownerSections = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Products', path: '/owner/products', icon: Package },
      { label: 'Stock', path: '/owner/stock', icon: Boxes },
      { label: 'Sales', path: '/owner/sales', icon: ShoppingCart },
      { label: 'Credit Customers', path: '/owner/credit-customers', icon: Users },
      { label: 'Workers', path: '/owner/workers', icon: UserCircle },
    ],
  },
  {
    title: 'BUSINESS',
    items: [
      { label: 'Sales Summary', path: '/owner/sales-summary', icon: BarChart3 },
      { label: 'Activity', path: '/owner/activity', icon: ClipboardList },
      { label: 'Settings', path: '/owner/settings', icon: Settings },
    ],
  },
]

const workerSections = [
  {
    title: 'WORKSPACE',
    items: [
      { label: 'Home', path: '/', icon: LayoutDashboard, end: true },
      { label: 'Search Products', path: '/search', icon: Search },
      { label: 'New Sale', path: '/sale', icon: ShoppingCart },
      { label: 'Sales History', path: '/sales', icon: Clock },
      { label: 'Credit Customers', path: '/credit-customers', icon: Users },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Sales Today', path: '/sales-today', icon: BarChart3 },
      { label: 'End of Day', path: '/end-of-day', icon: ClipboardList },
      { label: 'Account', path: '/account', icon: UserCircle },
    ],
  },
]

export default function Sidebar({
  sections,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  className = '',
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(true)
  const [mobileExpanded, setMobileExpanded] = useState(false)

  const { role } = useRole()
  const location = useLocation()

  const isOwner = location.pathname.startsWith('/owner') || role === 'owner'

  const navigationSections =
    sections || (isOwner ? ownerSections : workerSections)

  const isControlled = controlledCollapsed !== undefined

  const collapsed = isControlled
    ? controlledCollapsed
    : internalCollapsed

  const toggleCollapsed = () => {
    const nextValue = !collapsed

    if (isControlled) {
      onCollapsedChange?.(nextValue)
    } else {
      setInternalCollapsed(nextValue)
    }
  }

  return (
    <aside
      className={`
        relative z-30 flex h-full min-h-0 shrink-0 flex-col
        border-r border-border bg-background
        transition-[width] duration-200

        ${mobileExpanded ? 'w-60' : 'w-[76px]'}

        ${collapsed ? 'lg:w-[76px]' : 'lg:w-64'}

        ${className}
      `}
    >
      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className="min-h-0 flex-1 space-y-6 overflow-y-auto px-2 py-5 lg:px-3"
      >
        {navigationSections.map((section) => (
          <div key={section.title}>
            {/* Mobile section heading */}
            {mobileExpanded && (
              <h2 className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-text-muted lg:hidden">
                {section.title}
              </h2>
            )}

            {/* Desktop section heading */}
            {!collapsed && (
              <h2 className="mb-2 hidden px-3 text-[11px] font-semibold tracking-wider text-text-muted lg:block">
                {section.title}
              </h2>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end ?? item.path === '/owner/dashboard'}
                    title={item.label}
                    aria-label={item.label}
                    className={({ isActive }) => `
                      flex min-h-10 items-center rounded-lg
                      py-2 text-sm font-medium
                      transition-colors duration-150

                      ${mobileExpanded
                        ? 'justify-start gap-3 px-3'
                        : 'justify-center px-1'
                      }

                      ${!collapsed
                        ? 'lg:justify-start lg:gap-3 lg:px-3'
                        : 'lg:justify-center lg:gap-0 lg:px-1'
                      }

                      ${
                        isActive
                          ? 'bg-interactive-soft text-interactive-primary'
                          : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                      }
                    `}
                  >
                    <Icon size={19} className="shrink-0" />

                    {/* Mobile label */}
                    {mobileExpanded && (
                      <span className="truncate lg:hidden">
                        {item.label}
                      </span>
                    )}

                    {/* Desktop label */}
                    {!collapsed && (
                      <span className="hidden truncate lg:block">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar controls */}
      <div className="shrink-0 border-t border-divider p-2">
        {/* Mobile expand/collapse */}
        <button
          type="button"
          onClick={() => setMobileExpanded((value) => !value)}
          aria-label={mobileExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={mobileExpanded}
          title={mobileExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className="
            flex min-h-10 w-full items-center justify-center gap-3
            rounded-lg px-1 text-sm text-text-secondary
            transition-colors hover:bg-surface hover:text-text-primary
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-interactive-primary
            lg:hidden
          "
        >
          {mobileExpanded ? (
            <>
              <ChevronLeft size={19} />
              <span>Collapse</span>
            </>
          ) : (
            <ChevronRight size={19} />
          )}
        </button>

        {/* Desktop expand/collapse */}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="
            hidden min-h-10 w-full items-center justify-center gap-3
            rounded-lg px-1 text-sm text-text-secondary
            transition-colors hover:bg-surface hover:text-text-primary
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-interactive-primary
            lg:flex
          "
        >
          {collapsed ? (
            <ChevronRight size={19} />
          ) : (
            <>
              <ChevronLeft size={19} />
              <span>Collapse sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
