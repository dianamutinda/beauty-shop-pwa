
export default function PageHeader({
  title,
  description,
  actions,
  className = '',
}) {
  return (
    <div
      className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
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
  )
}
