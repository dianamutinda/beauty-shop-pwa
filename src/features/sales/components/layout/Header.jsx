
import { Bell } from 'lucide-react';
import Avatar from '../ui/Avatar';

export default function Header({
  brandName = 'My Shop',
  logo,
  search,
  notificationCount = 0,
  onNotificationsClick,
  user,
  onProfileClick,
  actions,
  className = '',
}) {
  return (
    <header
      className={`
        sticky top-0 z-40
        w-full border-b border-border
        bg-background
        ${className}
      `}
    >
      <div className="
        mx-auto flex min-h-16 w-full max-w-screen-2xl
        items-center justify-between gap-3
        px-4 sm:px-6 lg:px-8
      ">
        {/* Brand */}
        <div className="flex min-w-0 shrink-0 items-center gap-3">
          {logo && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg">
              {logo}
            </div>
          )}

          <span className="truncate text-base font-semibold text-text-primary sm:text-lg">
            {brandName}
          </span>
        </div>

        {/* Desktop search */}
        {search && (
          <div className="hidden min-w-0 max-w-md flex-1 md:block md:px-6">
            {search}
          </div>
        )}

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {actions}

          {onNotificationsClick && (
            <button
              type="button"
              onClick={onNotificationsClick}
              aria-label={
                notificationCount > 0
                  ? `Notifications, ${notificationCount} unread`
                  : 'Notifications'
              }
              className="
                relative flex h-10 w-10 shrink-0
                items-center justify-center rounded-lg
                text-text-secondary transition-colors
                hover:bg-surface hover:text-text-primary
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-interactive-primary
              "
            >
              <Bell size={20} aria-hidden="true" />

              {notificationCount > 0 && (
                <span className="
                  absolute right-1.5 top-1.5
                  flex h-4 min-w-4 items-center
                  justify-center rounded-full
                  bg-error px-1 text-[10px]
                  font-semibold text-white
                ">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          )}

          {/* Profile */}
          {user && (
            <button
              type="button"
              onClick={onProfileClick}
              aria-label={`Open profile for ${user.name || 'user'}`}
              className="
                flex shrink-0 items-center gap-2
                rounded-lg p-1.5 transition-colors
                hover:bg-surface
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-interactive-primary
              "
            >
              <Avatar
                src={user.avatar}
                name={user.name || ''}
                size="sm"
              />

              <span className="hidden max-w-32 truncate text-sm font-medium text-text-primary lg:block">
                {user.name}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile search */}
      {search && (
        <div className="border-t border-divider px-4 py-3 md:hidden">
          {search}
        </div>
      )}
    </header>
  );
}
