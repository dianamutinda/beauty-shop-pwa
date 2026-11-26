
import { useState } from 'react';
import { UserRound } from 'lucide-react';

const sizes = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-14 w-14 text-lg',
  '2xl': 'h-16 w-16 text-xl',
};

const statuses = {
  online: 'bg-success',
  offline: 'bg-text-muted',
  busy: 'bg-error',
  away: 'bg-warning',
};

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function Avatar({
  src,
  name = '',
  alt,
  size = 'md',
  shape = 'circle',
  status,
  fallbackIcon = false,
  className = '',
}) {
  const [imageError, setImageError] = useState(false);

  const hasImage = Boolean(src) && !imageError;
  const initials = getInitials(name);

  const shapeStyles = {
    circle: 'rounded-full',
    square: 'rounded-lg',
    rounded: 'rounded-xl',
  };

  return (
    <span
      className={`
        relative inline-flex shrink-0 items-center justify-center
        overflow-visible bg-interactive-soft
        font-semibold text-interactive-primary
        ${sizes[size] || sizes.md}
        ${className}
      `}
    >
      <span
        className={`
          flex h-full w-full items-center justify-center
          overflow-hidden bg-interactive-soft
          ${shapeStyles[shape] || shapeStyles.circle}
        `}
      >
        {hasImage ? (
          <img
            src={src}
            alt={alt || name || 'User profile'}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : fallbackIcon ? (
          <UserRound className="h-1/2 w-1/2" aria-hidden="true" />
        ) : initials ? (
          <span aria-hidden="true">{initials}</span>
        ) : (
          <UserRound className="h-1/2 w-1/2" aria-hidden="true" />
        )}
      </span>

      {status && statuses[status] && (
        <span
          className={`
            absolute bottom-0 right-0
            h-3 w-3 rounded-full border-2 border-background
            ${statuses[status]}
          `}
          aria-label={`Status: ${status}`}
          title={status}
        />
      )}
    </span>
  );
}
