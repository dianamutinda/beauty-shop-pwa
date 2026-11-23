
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
} from 'lucide-react'

const defaultSections = [
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
      { label: 'Customers', path: '/owner/customers', icon: Users },
    ],
  },
  {
    title: 'BUSINESS',
    items: [
      { label: 'Reports', path: '/owner/reports', icon: BarChart3 },
      { label: 'Settings', path: '/owner/settings', icon: Settings },
    ],
  },
]

export default function Sidebar({
  sections = defaultSections,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  className = '',
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)

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
        flex h-full min-h-0 shrink-0 flex-col
        border-r border-border bg-background
        transition-[width] duration-200
        ${collapsed
          ? 'w-14 lg:w-[76px]'
          : 'w-[220px] sm:w-60 lg:w-64'
        }
        ${className}
      `}
    >
      {/* Brand Icon */}
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-divider">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-interactive-soft text-interactive-primary">
          <Store size={20} />
        </div>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className="min-h-0 flex-1 space-y-6 overflow-y-auto px-2 py-5 lg:px-3"
      >
        {sections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <h2 className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-text-muted">
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
                    title={collapsed ? item.label : undefined}
                    aria-label={collapsed ? item.label : undefined}
                    className={({ isActive }) => `
                      group flex min-h-10 items-center gap-3
                      rounded-lg px-3 py-2 text-sm font-medium
                      transition-colors duration-150
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-interactive-primary
                      ${collapsed ? 'justify-center px-1' : ''}
                      ${
                        isActive
                          ? 'bg-interactive-soft text-interactive-primary'
                          : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                      }
                    `}
                  >
                    <Icon size={19} className="shrink-0" />

                    {!collapsed && (
                      <span className="truncate">
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

      {/* Collapse Control */}
      <div className="shrink-0 border-t border-divider p-2 sm:p-3">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className={`
            flex min-h-10 w-full items-center gap-3
            rounded-lg px-3 text-sm text-text-secondary
            transition-colors hover:bg-surface hover:text-text-primary
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-interactive-primary
            ${collapsed ? 'justify-center px-1' : ''}
          `}
        >
          {collapsed
            ? <ChevronRight size={19} />
            : <ChevronLeft size={19} />
          }

          {!collapsed && <span>Collapse sidebar</span>}
        </button>
      </div>
    </aside>
  )
}
