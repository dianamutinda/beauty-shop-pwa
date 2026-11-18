
import { useId, useState } from 'react';

export default function Tabs({
  tabs = [],
  value,
  defaultValue,
  onChange,
  variant = 'underline',
  size = 'md',
  fullWidth = false,
  showContent = true,
  className = '',
}) {
  const generatedId = useId();

  const [internalValue, setInternalValue] = useState(
    defaultValue ?? tabs.find((tab) => !tab.disabled)?.value ?? ''
  );

  const isControlled = value !== undefined;
  const activeValue = isControlled ? value : internalValue;

  const activeTab = tabs.find((tab) => tab.value === activeValue);

  const variants = {
    underline: {
      container: 'border-b border-divider',
      tab: 'border-b-2 -mb-px rounded-none',
      active: 'border-interactive-primary text-interactive-primary',
      inactive: 'border-transparent text-text-secondary hover:text-text-primary hover:border-border',
    },
    pills: {
      container: 'gap-1 rounded-lg bg-surface p-1',
      tab: 'rounded-md border border-transparent',
      active: 'bg-background text-text-primary shadow-sm',
      inactive: 'text-text-secondary hover:text-text-primary hover:bg-background/60',
    },
    bordered: {
      container: 'gap-1',
      tab: 'rounded-lg border',
      active: 'border-interactive-primary bg-interactive-soft text-interactive-primary',
      inactive: 'border-border text-text-secondary hover:bg-surface',
    },
  };

  const sizes = {
    sm: 'px-3 py-2 text-xs sm:text-sm',
    md: 'px-3 py-2.5 text-sm',
    lg: 'px-4 py-3 text-sm sm:text-base',
  };

  const styles = variants[variant] || variants.underline;

  const selectTab = (tab) => {
    if (tab.disabled) return;

    if (!isControlled) {
      setInternalValue(tab.value);
    }

    onChange?.(tab.value);
  };

  const handleKeyDown = (event, currentIndex) => {
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight') {
      nextIndex = currentIndex + 1;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = currentIndex - 1;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();

    // Find the next enabled tab.
    const direction = nextIndex >= currentIndex ? 1 : -1;

    while (nextIndex >= 0 && nextIndex < tabs.length) {
      if (!tabs[nextIndex].disabled) {
        selectTab(tabs[nextIndex]);

        document
          .getElementById(`${generatedId}-tab-${nextIndex}`)
          ?.focus();

        return;
      }

      nextIndex += direction;
    }

    // Wrap around when navigating beyond the last or first tab.
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const wrappedTabs = direction === 1
        ? tabs
        : [...tabs].reverse();

      const wrappedIndex = direction === 1
        ? 0
        : tabs.length - 1;

      const enabledTab = wrappedTabs.find((tab) => !tab.disabled);

      if (enabledTab) {
        const originalIndex = tabs.indexOf(enabledTab);

        selectTab(enabledTab);

        document
          .getElementById(`${generatedId}-tab-${originalIndex}`)
          ?.focus();
      }
    }
  };

  return (
    <div className={`w-full min-w-0 ${className}`}>
      <div
        role="tablist"
        aria-label="Page sections"
        className={`
          flex w-full min-w-0 overflow-x-auto
          ${styles.container}
        `}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.value === activeValue;

          return (
            <button
              key={tab.value}
              id={`${generatedId}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${generatedId}-panel`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => selectTab(tab)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`
                inline-flex shrink-0 items-center justify-center
                gap-2 whitespace-nowrap font-medium
                transition-colors duration-200
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-interactive-primary
                disabled:cursor-not-allowed disabled:opacity-40
                ${styles.tab}
                ${styles.active && isActive ? styles.active : styles.inactive}
                ${sizes[size] || sizes.md}
                ${fullWidth ? 'flex-1' : ''}
              `}
            >
              {tab.icon && (
                <span className="shrink-0">{tab.icon}</span>
              )}

              <span>{tab.label}</span>

              {tab.count !== undefined && (
                <span
                  className={`
                    rounded-full px-2 py-0.5 text-xs
                    ${isActive
                      ? 'bg-interactive-soft text-interactive-primary'
                      : 'bg-surface text-text-muted'}
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {showContent && activeTab && (
        <div
          id={`${generatedId}-panel`}
          role="tabpanel"
          aria-labelledby={`${generatedId}-tab-${tabs.indexOf(activeTab)}`}
          tabIndex={0}
          className="min-w-0 pt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}
