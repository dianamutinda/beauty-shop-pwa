
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange,
  siblingCount = 1,
  showInfo = true,
  className = '',
}) {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate visible page numbers.
  const visiblePages = new Set([1, totalPages]);

  for (
    let page = Math.max(2, currentPage - siblingCount);
    page <= Math.min(totalPages - 1, currentPage + siblingCount);
    page++
  ) {
    visiblePages.add(page);
  }

  const sortedPages = [...visiblePages].sort((a, b) => a - b);

  // Insert ellipses where page numbers are skipped.
  const pageItems = [];

  sortedPages.forEach((page, index) => {
    if (index > 0) {
      const previousPage = sortedPages[index - 1];
      const gap = page - previousPage;

      if (gap === 2) {
        pageItems.push(previousPage + 1);
      } else if (gap > 2) {
        pageItems.push(`ellipsis-${previousPage}`);
      }
    }

    pageItems.push(page);
  });

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    onPageChange?.(page);
  };

  const buttonStyles = `
    inline-flex h-9 min-w-9 items-center justify-center
    rounded-lg border border-border px-2
    text-sm font-medium transition-colors
    focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-interactive-primary
    disabled:pointer-events-none disabled:opacity-40
  `;

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      {showInfo && (
        <p className="text-sm text-text-secondary">
          Showing{' '}
          <span className="font-medium text-text-primary">
            {startItem}–{endItem}
          </span>{' '}
          of{' '}
          <span className="font-medium text-text-primary">
            {totalItems}
          </span>{' '}
          results
        </p>
      )}

      <div className="flex items-center justify-between gap-1 sm:justify-end">
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
          className={`
            ${buttonStyles}
            gap-1 text-text-secondary hover:bg-surface
          `}
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {pageItems.map((item) => {
            if (typeof item === 'string') {
              return (
                <span
                  key={item}
                  aria-hidden="true"
                  className="flex h-9 min-w-6 items-center justify-center text-sm text-text-muted"
                >
                  …
                </span>
              );
            }

            const isCurrent = item === currentPage;

            return (
              <button
                key={item}
                type="button"
                onClick={() => goToPage(item)}
                disabled={isCurrent}
                aria-label={`Go to page ${item}`}
                aria-current={isCurrent ? 'page' : undefined}
                className={`
                  ${buttonStyles}
                  ${
                    isCurrent
                      ? 'border-interactive-primary bg-interactive-primary text-white'
                      : 'text-text-secondary hover:bg-surface'
                  }
                `}
              >
                {item}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Go to next page"
          className={`
            ${buttonStyles}
            gap-1 text-text-secondary hover:bg-surface
          `}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
