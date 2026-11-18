
import { useEffect, useId, useRef, useState } from 'react';
import { MoreHorizontal, Check } from 'lucide-react';

export default function Dropdown({
  items = [],
  trigger,
  triggerLabel = 'Open menu',
  align = 'right',
  width = 'w-52',
  className = '',
  onOpenChange,
}) {
  const generatedId = useId();

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const itemRefs = useRef([]);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuPosition, setMenuPosition] = useState('right-0');

  const enabledItems = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !item.disabled && !item.separator);

  const setOpen = (nextOpen) => {
    setIsOpen(nextOpen);
    onOpenChange?.(nextOpen);

    if (!nextOpen) {
      setActiveIndex(-1);
    }
  };

  const closeMenu = (restoreFocus = false) => {
    setOpen(false);

    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  };

  const updatePosition = () => {
    const triggerRect = triggerRef.current?.getBoundingClientRect();

    if (!triggerRect) return;

    const menuWidth = Math.min(
      menuRef.current?.offsetWidth || 208,
      window.innerWidth - 32
    );

    const spaceOnRight = window.innerWidth - triggerRect.left;
    const spaceOnLeft = triggerRect.right;

    if (align === 'left') {
      setMenuPosition(
        spaceOnRight >= menuWidth || spaceOnRight >= spaceOnLeft
          ? 'left-0'
          : 'right-0'
      );
    } else {
      setMenuPosition(
        spaceOnLeft >= menuWidth || spaceOnLeft >= spaceOnRight
          ? 'right-0'
          : 'left-0'
      );
    }
  };

  const openMenu = () => {
    if (!enabledItems.length) return;

    const firstEnabled = items.findIndex(
      (item) => !item.disabled && !item.separator
    );

    setActiveIndex(firstEnabled);
    setOpen(true);
  };

  const runAction = (item) => {
    if (item.disabled || item.separator) return;

    item.onClick?.();
    closeMenu(true);
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        closeMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu(true);
      }
    };

    const handleResize = () => updatePosition();

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, align]);

  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      itemRefs.current[activeIndex]?.focus();
    }
  }, [activeIndex, isOpen]);

  const handleMenuKeyDown = (event, currentIndex) => {
    if (!enabledItems.length) return;

    let nextIndex;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();

        const currentPosition = enabledItems.findIndex(
          ({ index }) => index === currentIndex
        );

        const direction = event.key === 'ArrowDown' ? 1 : -1;

        const nextPosition =
          currentPosition === -1
            ? 0
            : (currentPosition + direction + enabledItems.length) %
              enabledItems.length;

        nextIndex = enabledItems[nextPosition]?.index;
        break;
      }

      case 'Home':
        event.preventDefault();
        nextIndex = enabledItems[0].index;
        break;

      case 'End':
        event.preventDefault();
        nextIndex = enabledItems[enabledItems.length - 1].index;
        break;

      default:
        return;
    }

    if (nextIndex !== undefined) {
      setActiveIndex(nextIndex);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`relative inline-block ${className}`}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={`${generatedId}-menu`}
        onClick={() => {
          if (isOpen) closeMenu();
          else openMenu();
        }}
        onKeyDown={(event) => {
          if (
            event.key === 'ArrowDown' ||
            event.key === 'Enter' ||
            event.key === ' '
          ) {
            event.preventDefault();
            openMenu();
          }
        }}
        className="
          inline-flex min-h-9 items-center justify-center gap-2
          rounded-lg border border-border bg-background px-3
          text-sm font-medium text-text-secondary
          transition-colors hover:bg-surface hover:text-text-primary
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-interactive-primary
        "
      >
        {trigger || <MoreHorizontal size={20} />}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={`${generatedId}-menu`}
          role="menu"
          aria-label={triggerLabel}
          className={`
            absolute top-full z-50 mt-2
            ${menuPosition}
            ${width} max-w-[calc(100vw-2rem)]
            max-h-[min(20rem,calc(100dvh-6rem))]
            overflow-y-auto overflow-x-hidden
            rounded-xl border border-border
            bg-background p-1.5 shadow-lg
          `}
        >
          {items.map((item, index) => {
            if (item.separator) {
              return (
                <div
                  key={`separator-${index}`}
                  role="separator"
                  className="my-1.5 border-t border-divider"
                />
              );
            }

            return (
              <button
                key={item.label}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                type="button"
                role="menuitem"
                tabIndex={activeIndex === index ? 0 : -1}
                disabled={item.disabled}
                onClick={() => runAction(item)}
                onKeyDown={(event) => handleMenuKeyDown(event, index)}
                className={`
                  flex w-full min-h-10 items-center gap-3
                  rounded-lg px-3 py-2 text-left text-sm
                  transition-colors
                  focus-visible:outline-none focus-visible:bg-surface
                  disabled:cursor-not-allowed disabled:opacity-40
                  ${
                    item.danger
                      ? 'text-error hover:bg-error/10'
                      : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                  }
                `}
              >
                {item.icon && (
                  <span className="shrink-0">{item.icon}</span>
                )}

                <span className="min-w-0 flex-1">
                  {item.label}
                </span>

                {item.selected && (
                  <Check size={16} className="shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
