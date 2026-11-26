
const variants = {
  success: `
    bg-success/10
    text-success
  `,

  warning: `
    bg-warning/10
    text-warning
  `,

  danger: `
    bg-error/10
    text-error
  `,

  info: `
    bg-info/10
    text-info
  `,

  neutral: `
    bg-surface
    text-text-secondary
    border border-border
  `,
};

const dotColors = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-error',
  info: 'bg-info',
  neutral: 'bg-text-muted',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-xs sm:text-sm gap-1.5',
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) {
  return (
    <span
      className={`
        inline-flex max-w-full items-center
        whitespace-nowrap rounded-full
        font-medium
        ${variants[variant] || variants.neutral}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`
            h-1.5 w-1.5 shrink-0 rounded-full
            ${dotColors[variant] || dotColors.neutral}
          `}
          aria-hidden="true"
        />
      )}

      {children}
    </span>
  );
}
