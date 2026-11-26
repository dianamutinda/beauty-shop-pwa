
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Check, ChevronDown, Search } from 'lucide-react';

const sizes = {
  sm: 'min-h-9 text-sm',
  md: 'min-h-10 text-sm sm:text-base',
  lg: 'min-h-12 text-base',
};

export default function Select({
  label,
  options = [],
  placeholder = 'Select an option',
  value,
  defaultValue,
  onChange,
  size = 'md',
  error,
  hint,
  disabled = false,
  searchable = false,
  searchPlaceholder = 'Search options...',
  noOptionsMessage = 'No options found',
  fullWidth = true,
  className = '',
  id,
}) {
  const generatedId = useId();
  const selectId = id || generatedId;

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const optionRefs = useRef([]);

  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;

  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  }, [options, search]);

  const enabledOptions = filteredOptions
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => !option.disabled);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearch('');
    setActiveIndex(-1);
  }, []);

  const openDropdown = () => {
    if (disabled) return;

    const selectedIndex = filteredOptions.findIndex(
      (option) => option.value === selectedValue && !option.disabled
    );

    const firstEnabledIndex = filteredOptions.findIndex(
      (option) => !option.disabled
    );

    setActiveIndex(
      selectedIndex >= 0 ? selectedIndex : firstEnabledIndex
    );

    setIsOpen(true);
  };

  const selectOption = (option) => {
    if (option.disabled) return;

    if (!isControlled) {
      setInternalValue(option.value);
    }

    onChange?.(option.value, option);
    closeDropdown();
    triggerRef.current?.focus();
  };

  const moveActiveOption = (direction) => {
    if (!enabledOptions.length) return;

    const currentPosition = enabledOptions.findIndex(
      ({ index }) => index === activeIndex
    );

    let nextPosition;

    if (currentPosition === -1) {
      nextPosition = direction > 0 ? 0 : enabledOptions.length - 1;
    } else {
      nextPosition =
        (currentPosition + direction + enabledOptions.length) %
        enabledOptions.length;
    }

    setActiveIndex(enabledOptions[nextPosition].index);
  };

  const handleTriggerKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();

      if (!isOpen) {
        openDropdown();
      } else {
        moveActiveOption(event.key === 'ArrowDown' ? 1 : -1);
      }
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      if (!isOpen) openDropdown();
      else if (activeIndex >= 0) {
        selectOption(filteredOptions[activeIndex]);
      }
    }

    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      closeDropdown();
    }
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveActiveOption(event.key === 'ArrowDown' ? 1 : -1);
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      if (activeIndex >= 0) {
        selectOption(filteredOptions[activeIndex]);
      }
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeDropdown();
      triggerRef.current?.focus();
    }

    if (event.key === 'Tab') {
      closeDropdown();
    }
  };

  // Close when the user clicks outside the component.
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [isOpen, closeDropdown]);

  // Focus the search field when the searchable menu opens.
  useEffect(() => {
    if (isOpen && searchable) {
      searchRef.current?.focus();
    }
  }, [isOpen, searchable]);

  // Keep the active option visible while navigating with the keyboard.
  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      optionRefs.current[activeIndex]?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [activeIndex, isOpen]);

  const hasMessage = Boolean(error || hint);

  return (
    <div
      ref={rootRef}
      className={`${fullWidth ? 'w-full' : 'w-auto'} min-w-0 ${className}`}
    >
      {label && (
        <label
          id={`${selectId}-label`}
          className="mb-1.5 block text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          ref={triggerRef}
          id={selectId}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={
            label ? `${selectId}-label` : undefined
          }
          aria-label={!label ? placeholder : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={
            hasMessage ? `${selectId}-message` : undefined
          }
          onClick={() => {
            if (isOpen) closeDropdown();
            else openDropdown();
          }}
          onKeyDown={handleTriggerKeyDown}
          className={`
            flex w-full items-center justify-between gap-3
            rounded-lg border bg-background px-3
            text-left transition-colors duration-200
            focus:outline-none focus:ring-2
            focus:ring-interactive-primary
            disabled:cursor-not-allowed disabled:opacity-60
            ${sizes[size] || sizes.md}
            ${error ? 'border-error' : 'border-border'}
            ${isOpen ? 'border-interactive-primary' : ''}
          `}
        >
          <span
            className={`min-w-0 truncate ${
              selectedOption
                ? 'text-text-primary'
                : 'text-text-muted'
            }`}
          >
            {selectedOption?.label || placeholder}
          </span>

          <ChevronDown
            size={18}
            aria-hidden="true"
            className={`shrink-0 text-text-muted transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
            {searchable && (
              <div className="border-b border-divider p-2">
                <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3">
                  <Search
                    size={16}
                    className="shrink-0 text-text-muted"
                  />

                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);

                      const firstEnabled = filteredOptions.findIndex(
                        (option) => !option.disabled
                      );

                      setActiveIndex(firstEnabled);
                    }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={searchPlaceholder}
                    aria-label="Search options"
                    className="h-full w-full min-w-0 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
                  />
                </div>
              </div>
            )}

            <ul
              role="listbox"
              aria-labelledby={label ? `${selectId}-label` : undefined}
              className="max-h-60 overflow-y-auto p-1.5"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-5 text-center text-sm text-text-muted">
                  {noOptionsMessage}
                </li>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = option.value === selectedValue;
                  const isActive = index === activeIndex;

                  return (
                    <li
                      key={option.value}
                      ref={(element) => {
                        optionRefs.current[index] = element;
                      }}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={Boolean(option.disabled)}
                      onMouseEnter={() => {
                        if (!option.disabled) setActiveIndex(index);
                      }}
                      onClick={() => selectOption(option)}
                      className={`
                        flex min-h-10 cursor-pointer items-center
                        justify-between gap-3 rounded-lg px-3 py-2
                        text-sm transition-colors
                        ${isSelected
                          ? 'bg-interactive-soft font-medium text-text-primary'
                          : 'text-text-secondary'}
                        ${isActive && !isSelected ? 'bg-surface' : ''}
                        ${option.disabled
                          ? 'cursor-not-allowed opacity-40'
                          : ''}
                      `}
                    >
                      <span className="min-w-0 truncate">
                        {option.label}
                      </span>

                      {isSelected && (
                        <Check
                          size={16}
                          className="shrink-0 text-interactive-primary"
                        />
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>

      {hasMessage && (
        <p
          id={`${selectId}-message`}
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
