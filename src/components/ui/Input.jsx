
import { useId } from 'react';

const sizes = {
  sm: 'h-9 text-sm',
  md: 'h-10 text-sm sm:text-base',
  lg: 'h-12 text-base',
};

export default function Input({
  label,
  type = 'text',
  size = 'md',
  error,
  hint,
  leftIcon,
  rightElement,
  fullWidth = true,
  className = '',
  id,
  disabled = false,
  ...props
}) {
  const generatedId = useId();

  const inputId = id || generatedId;
  const messageId = `${inputId}-message`;

  const hasMessage = Boolean(error || hint);

  return (
    <div className={`${fullWidth ? 'w-full' : 'w-auto'} min-w-0 ${className}`}>

      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}

      <div
        className={`
          flex w-full min-w-0 items-center gap-2
          rounded-lg border bg-background
          transition-colors duration-200
          focus-within:ring-2
          focus-within:ring-interactive-primary
          focus-within:border-interactive-primary
          ${error ? 'border-error' : 'border-border'}
          ${disabled ? 'cursor-not-allowed opacity-60' : ''}
          ${sizes[size] || sizes.md}
        `}
      >

        {leftIcon && (
          <span className="ml-3 shrink-0 text-text-muted">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          type={type}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={hasMessage ? messageId : undefined}
          className="
            h-full w-full min-w-0 bg-transparent
            px-3 text-text-primary outline-none
            placeholder:text-text-muted
            disabled:cursor-not-allowed
          "
          {...props}
        />

        {rightElement && (
          <span className="mr-3 shrink-0">
            {rightElement}
          </span>
        )}

      </div>

      {hasMessage && (
        <p
          id={messageId}
          className={`mt-1.5 text-xs ${
            error ? 'text-error' : 'text-text-muted'
          }`}
        >
          {error || hint}
        </p>
      )}

    </div>
  );
}
