
import { PackageOpen } from 'lucide-react';

import Button from './Button';

export default function EmptyState({
  icon,
  title = 'Nothing here yet',
  description = 'There is currently no information to display.',
  action,
  secondaryAction,
  size = 'md',
  className = '',
}) {
  const sizes = {
    sm: {
      wrapper: 'py-8',
      icon: 'h-11 w-11',
      iconSize: 20,
      title: 'text-base',
      description: 'text-xs',
    },
    md: {
      wrapper: 'py-12 sm:py-16',
      icon: 'h-14 w-14',
      iconSize: 24,
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      wrapper: 'py-16 sm:py-20',
      icon: 'h-16 w-16',
      iconSize: 28,
      title: 'text-xl',
      description: 'text-sm sm:text-base',
    },
  };

  const currentSize = sizes[size] || sizes.md;
  const Icon = icon || PackageOpen;

  return (
    <div
      className={`
        flex w-full min-w-0 flex-col items-center justify-center
        px-4 text-center
        ${currentSize.wrapper}
        ${className}
      `}
    >
      <div
        className={`
          flex shrink-0 items-center justify-center
          rounded-full bg-interactive-soft text-interactive-primary
          ${currentSize.icon}
        `}
      >
        {typeof icon === 'function' ? (
          <Icon size={currentSize.iconSize} aria-hidden="true" />
        ) : (
          <Icon size={currentSize.iconSize} aria-hidden="true" />
        )}
      </div>

      <h3
        className={`
          mt-4 font-semibold text-text-primary
          ${currentSize.title}
        `}
      >
        {title}
      </h3>

      {description && (
        <p
          className={`
            mt-2 max-w-sm leading-6 text-text-secondary
            ${currentSize.description}
          `}
        >
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-5 flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'primary'}
              size="md"
              fullWidth
              className="sm:w-auto"
            >
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant || 'outline'}
              size="md"
              fullWidth
              className="sm:w-auto"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
