
import { useId, useState } from 'react';

export default function Tooltip({
  children,
  content,
  position = 'top',
  delay = 300,
  disabled = false,
  className = '',
}) {
  const generatedId = useId();

  const [isVisible, setIsVisible] = useState(false);
  const [showTimeout, setShowTimeout] = useState(null);

  const positions = {
    top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
    bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
    left: 'right-full top-1/2 mr-2 -translate-y-1/2',
    right: 'left-full top-1/2 ml-2 -translate-y-1/2',
  };

  const showTooltip = () => {
    if (disabled || !content) return;

    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    setShowTimeout(timeout);
  };

  const hideTooltip = () => {
    clearTimeout(showTimeout);
    setShowTimeout(null);
    setIsVisible(false);
  };

  return (
    <span
      className={`relative inline-flex min-w-0 ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      <span
        aria-describedby={isVisible ? generatedId : undefined}
        className="inline-flex min-w-0"
      >
        {children}
      </span>

      {isVisible && !disabled && content && (
        <span
          id={generatedId}
          role="tooltip"
          className={`
            pointer-events-none absolute z-[100]
            w-max max-w-[min(16rem,calc(100vw-2rem))]
            whitespace-normal rounded-lg
            bg-text-primary px-3 py-2
            text-xs leading-5 text-background
            shadow-md
            ${positions[position] || positions.top}
          `}
        >
          {content}
        </span>
      )}
    </span>
  );
}
