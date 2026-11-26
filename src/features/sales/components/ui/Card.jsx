
const baseStyles = `
  w-full
  min-w-0
  rounded-xl
  border
  border-border
  bg-surface
  text-text-primary
`;

const variants = {
  default: '',
  
  outlined: `
    bg-background
  `,

  elevated: `
    shadow-sm
  `,
};

const paddings = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-5',
  lg: 'p-4 sm:p-6 lg:p-8',
};

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  ...props
}) {
  return (
    <div
      className={`
        ${baseStyles}
        ${variants[variant] || variants.default}
        ${paddings[padding] || paddings.md}
        ${hoverable ? 'transition-colors duration-200 hover:border-interactive-primary' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
