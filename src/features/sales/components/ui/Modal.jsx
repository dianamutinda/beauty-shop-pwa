
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  footer,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50 p-3 sm:p-6
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`
          flex w-full min-w-0 flex-col
          max-h-[calc(100dvh-1.5rem)]
          overflow-hidden rounded-xl
          border border-border
          bg-background shadow-xl
          ${sizes[size] || sizes.md}
          sm:max-h-[calc(100dvh-3rem)]
        `}
      >
        {/* Header */}
        <header className="
          flex shrink-0 items-center justify-between
          gap-4 border-b border-divider
          px-4 py-4 sm:px-6
        ">
          <h2
            id="modal-title"
            className="min-w-0 text-base font-semibold text-text-primary sm:text-lg"
          >
            {title}
          </h2>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="
                shrink-0 rounded-md p-2
                text-text-muted
                hover:bg-surface hover:text-text-primary
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-interactive-primary
              "
            >
              <X size={18} />
            </button>
          )}
        </header>

        {/* Content */}
        <div className="
          min-h-0 flex-1 overflow-y-auto
          px-4 py-4 sm:px-6 sm:py-5
        ">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <footer className="
            flex shrink-0 flex-col-reverse
            gap-2 border-t border-divider
            bg-surface px-4 py-4
            sm:flex-row sm:justify-end sm:px-6
          ">
            {footer}
          </footer>
        )}
      </section>
    </div>,
    document.body
  );
}
