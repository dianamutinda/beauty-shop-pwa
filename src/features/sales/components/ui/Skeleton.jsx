
export default function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
}) {
  const baseStyles = `
    animate-pulse rounded-md bg-border/70
  `;

  const variants = {
    text: 'h-4 w-full',
    circle: 'rounded-full aspect-square',
    rectangle: 'w-full rounded-lg',
    card: 'w-full rounded-xl border border-border bg-surface',
  };

  const customStyles = {
    width,
    height,
  };

  if (variant === 'circle' || variant === 'rectangle' || variant === 'card') {
    return (
      <div
        aria-hidden="true"
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${className}
        `}
        style={customStyles}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`flex w-full flex-col gap-2 ${className}`}
    >
      {Array.from({ length: Math.max(1, lines) }).map((_, index) => (
        <div
          key={index}
          className={`
            ${baseStyles}
            ${variants.text}
            ${index === lines - 1 && lines > 1 ? 'max-w-[65%]' : ''}
          `}
          style={index === 0 ? customStyles : undefined}
        />
      ))}
    </div>
  );
}
