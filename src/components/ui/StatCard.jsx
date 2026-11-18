
import Card from './Card';
import Badge from './Badge';

export default function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  trendVariant = 'success',
  className = '',
}) {
  return (
    <Card
      padding="sm"
      className={`min-w-0 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-secondary">
            {title}
          </p>

          <p className="mt-2 break-words text-xl font-semibold text-text-primary sm:text-2xl">
            {value}
          </p>
        </div>

        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-interactive-soft text-interactive-primary sm:h-10 sm:w-10">
            {icon}
          </div>
        )}
      </div>

      {(description || trend) && (
        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
          {trend && (
            <Badge variant={trendVariant} size="sm">
              {trend}
            </Badge>
          )}

          {description && (
            <span className="min-w-0 text-xs text-text-muted">
              {description}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
