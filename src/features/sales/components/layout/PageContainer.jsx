
export default function PageContainer({
  children,
  className = '',
  maxWidth = 'max-w-[1440px]',
}) {
  return (
    <div
      className={`
        mx-auto w-full
        ${maxWidth}
        px-4 py-5
        sm:px-6 sm:py-6
        lg:px-8 lg:py-8
        ${className}
      `}
    >
      {children}
    </div>
  );
}
