
import { LoaderCircle } from 'lucide-react';

const baseStyles = `
  inline-flex
  items-center
  justify-center
  gap-2
  whitespace-nowrap
  rounded-lg
  font-medium
  transition-colors
  duration-200
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-interactive-primary
  focus-visible:ring-offset-2
  focus-visible:ring-offset-background
  disabled:pointer-events-none
  disabled:opacity-50
  disabled:cursor-not-allowed
`;

const variants = {
  primary: `
  bg-interactive-primary
  text-interactive-primary-foreground
  hover:bg-interactive-hover
  active:bg-interactive-pressed
`,

  secondary: `
    bg-interactive-soft
    text-text-primary
    hover:opacity-80
    active:opacity-70
  `,

  outline: `
    border
    border-border
    bg-transparent
    text-text-primary
    hover:bg-surface
    active:bg-interactive-soft
  `,

  danger: `
    bg-error
    text-white
    hover:opacity-90
    active:opacity-80
  `,

  ghost: `
    bg-transparent
    text-text-secondary
    hover:bg-surface
    hover:text-text-primary
    active:bg-interactive-soft
  `,
};

const sizes = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-10 px-4 text-sm sm:text-base',
  lg: 'min-h-12 px-5 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : 'w-auto max-w-full'}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <LoaderCircle
          size={16}
          className="animate-spin shrink-0"
          aria-hidden="true"
        />
      )}

      {children}
    </button>
  );
}
