
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  BellRing,
  CheckCheck,
  Package,
  ShoppingCart,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Info,
} from 'lucide-react'

const notificationIcons = {
  inventory: Package,
  sale: ShoppingCart,
  payment: CreditCard,
  warning: AlertTriangle,
  system: RefreshCw,
  info: Info,
}

const notificationStyles = {
  inventory: 'bg-warning/10 text-warning',
  sale: 'bg-interactive-soft text-interactive-primary',
  payment: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  system: 'bg-info/10 text-info',
  info: 'bg-surface text-text-secondary',
}

function NotificationItem({
  notification,
  onRead,
  onNotificationClick,
}) {
  const Icon = notificationIcons[notification.type] || Info

  const iconStyle =
    notificationStyles[notification.type] || notificationStyles.info

  const handleClick = () => {
    if (!notification.read) {
      onRead?.(notification.id)
    }

    onNotificationClick?.(notification)
  }

  const content = (
    <div
      className={`flex min-w-0 gap-3 px-4 py-4 transition-colors sm:px-5 ${
        notification.read
          ? 'bg-surface hover:bg-background'
          : 'bg-interactive-soft/40 hover:bg-interactive-soft/70'
      }`}
    >
      {/* Notification Icon */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
      >
        <Icon size={18} strokeWidth={1.8} />
      </div>

      {/* Notification Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`min-w-0 flex-1 break-words text-sm leading-5 ${
              notification.read
                ? 'font-medium text-text-secondary'
                : 'font-semibold text-text-primary'
            }`}
          >
            {notification.title}
          </p>

          {!notification.read && (
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-interactive-primary"
              aria-label="Unread"
            />
          )}
        </div>

        <p className="mt-1.5 break-words text-xs leading-5 text-text-secondary sm:text-sm">
          {notification.message}
        </p>

        {notification.time && (
          <p className="mt-2 text-[11px] text-text-muted">
            {notification.time}
          </p>
        )}
      </div>
    </div>
  )

  if (notification.to) {
    return (
      <Link
        to={notification.to}
        onClick={handleClick}
        className="block border-b border-divider last:border-b-0"
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="block w-full border-b border-divider text-left last:border-b-0"
    >
      {content}
    </button>
  )
}

export default function NotificationBell({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef(null)

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length

  const hasUnread = unreadCount > 0

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleNotificationClick = (notification) => {
    onNotificationClick?.(notification)
    setIsOpen(false)
  }

  return (
    <div
      ref={rootRef}
      className={`relative ${className}`}
    >
      {/* Bell Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={
          hasUnread
            ? `Notifications, ${unreadCount} unread`
            : 'Notifications'
        }
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
          isOpen
            ? 'border-interactive-primary bg-interactive-soft text-interactive-primary'
            : 'border-border bg-surface text-text-secondary hover:bg-background hover:text-text-primary'
        }`}
      >
        {isOpen ? (
          <BellRing size={19} strokeWidth={1.8} />
        ) : (
          <Bell size={19} strokeWidth={1.8} />
        )}

        {hasUnread && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-surface bg-error px-1 text-[9px] font-semibold leading-none text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="
            fixed left-4 right-4 top-20 z-[100]
            flex max-h-[calc(100dvh-6rem)] flex-col
            overflow-hidden rounded-xl border border-border
            bg-surface shadow-lg

            sm:absolute sm:left-auto sm:right-0 sm:top-full
            sm:mt-3 sm:w-[380px] sm:max-w-[calc(100vw-2rem)]
            sm:max-h-[min(480px,calc(100dvh-7rem))]
          "
        >
          {/* Panel Header */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-divider px-4 py-4 sm:px-5">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-text-primary">
                Notifications
              </h3>

              <p className="mt-1 text-xs text-text-muted">
                {hasUnread
                  ? `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`
                  : 'You are all caught up'}
              </p>
            </div>

            {hasUnread && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-interactive-primary hover:underline"
              >
                <CheckCheck size={15} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-interactive-soft text-interactive-primary">
                  <Bell size={21} />
                </div>

                <p className="mt-3 text-sm font-medium text-text-primary">
                  No notifications yet
                </p>

                <p className="mt-1 max-w-[240px] text-xs leading-5 text-text-muted">
                  Important shop updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={onMarkAsRead}
                  onNotificationClick={handleNotificationClick}
                />
              ))
            )}
          </div>

          {/* Panel Footer */}
          {notifications.length > 0 && (
            <div className="shrink-0 border-t border-divider px-4 py-3">
              <p className="text-center text-[11px] text-text-muted">
                Showing {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
