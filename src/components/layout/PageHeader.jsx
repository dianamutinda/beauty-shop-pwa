
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  className = '',
}) {
  return (
    <div className={`mb-6 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="mb-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <Link
            to="/owner/dashboard"
            className="flex items-center gap-1 transition hover:text-interactive-primary"
          >
            <Home size={13} />
            <span>Home</span>
          </Link>

          {breadcrumbs.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="flex items-center gap-2"
            >
              <ChevronRight size={13} />

              {item.to && index !== breadcrumbs.length - 1 ? (
                <Link
                  to={item.to}
                  className="transition hover:text-interactive-primary"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    index === breadcrumbs.length - 1
                      ? 'font-medium text-text-primary'
                      : ''
                  }
                >
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Heading and actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {title && (
            <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
              {title}
            </h1>
          )}

          {description && (
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
