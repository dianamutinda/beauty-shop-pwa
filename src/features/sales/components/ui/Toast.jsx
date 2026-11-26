
import { useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

const variants = {
  success: {
    icon: CheckCircle2,
    styles: 'border-success/30 bg-background text-success',
  },
  error: {
    icon: AlertCircle,
    styles: 'border-error/30 bg-background text-error',
  },
  warning: {
    icon: AlertTriangle,
    styles: 'border-warning/30 bg-background text-warning',
  },
  info: {
    icon: Info,
    styles: 'border-info/30 bg-background text-info',
  },
};

export default function Toast({
  message,
  type = 'success',
  duration = 3000,
  onClose,
  position = 'top-right',
  showCloseButton = true,
}) {
  useEffect(() => {
    if (!message || duration <= 0) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const variant = variants[type] || variants.success;
  const Icon = variant.icon;

  const positions = {
    'top-right': 'top-4 right-4 sm:top-6 sm:right-6',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 sm:top-6',
    'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6',
  };

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`
        fixed z-[100] ${positions[position] || positions['top-right']}
        flex w-[calc(100vw-2rem)] max-w-sm items-start gap-3
        rounded-xl border px-4 py-3 shadow-lg
        animate-in fade-in slide-in-from-top-2 duration-200
        ${variant.styles}
      `}
    >
      <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />

      <p className="min-w-0 flex-1 break-words text-sm font-medium text-text-primary">
        {message}
      </p>

      {showCloseButton && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="
            shrink-0 rounded-md p-1 text-text-muted
            transition-colors hover:bg-surface hover:text-text-primary
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-interactive-primary
          "
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
