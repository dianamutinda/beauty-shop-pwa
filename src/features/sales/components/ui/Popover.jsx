
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Popover({
  trigger,
  triggerLabel = 'Open popover',
  children,
  position = 'bottom',
  align = 'start',
  width = 'w-72',
  disabled = false,
  onOpenChange,
  className = '',
}) {
  const generatedId = useId();

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [coordinates, setCoordinates] = useState({
    top: 0,
    left: 0,
  });

  const closePopover = (restoreFocus = false) => {
    setIsOpen(false);
    onOpenChange?.(false);

    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  };

  const updatePosition = () => {
    const triggerRect = triggerRef.current?.getBoundingClientRect();
    const panel = panelRef.current;

    if (!triggerRect || !panel) return;

    const panelRect = panel.getBoundingClientRect();
    const padding = 8;
    const gap = 8;

    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    const actualPosition =
      position === 'auto'
        ? spaceBelow >= panelRect.height + gap || spaceBelow >= spaceAbove
          ? 'bottom'
          : 'top'
        : position;

    let top =
      actualPosition === 'top'
        ? triggerRect.top - panelRect.height - gap
        : triggerRect.bottom + gap;

    let left = triggerRect.left;

    if (align === 'center') {
      left = triggerRect.left + (triggerRect.width - panelRect.width) / 2;
    } else if (align === 'end') {
      left = triggerRect.right - panelRect.width;
    }

    left = Math.max(
      padding,
      Math.min(left, window.innerWidth - panelRect.width - padding)
    );

    top = Math.max(
      padding,
      Math.min(top, window.innerHeight - panelRect.height - padding)
    );

    setCoordinates({ top, left });
  };

  const openPopover = () => {
    if (disabled) return;

    setIsOpen(true);
    onOpenChange?.(true);
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleOutsideClick = (event) => {
      if (
        !rootRef.current?.contains(event.target) &&
        !panelRef.current?.contains(event.target)
      ) {
        closePopover();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePopover(true);
      }
    };

    const handleViewportChange = () => updatePosition();

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen, position, align]);

  useEffect(() => {
    if (isOpen) updatePosition();
  }, [isOpen, children]);

  return (
    <div ref={rootRef} className={`inline-flex ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={`${generatedId}-panel`}
        onClick={() => {
          if (isOpen) {
            closePopover();
          } else {
            openPopover();
          }
        }}
        className="inline-flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {trigger}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            id={`${generatedId}-panel`}
            role="dialog"
            aria-label={triggerLabel}
            style={{
              position: 'fixed',
              top: coordinates.top,
              left: coordinates.left,
            }}
            className={`
              z-[110]
              ${width}
              max-w-[calc(100vw-1rem)]
              max-h-[calc(100dvh-1rem)]
              overflow-y-auto
              rounded-xl
              border border-border
              bg-background
              p-4
              text-text-primary
              shadow-lg
            `}
          >
            {children}
          </div>,
          document.body
        )}
    </div>
  );
}
