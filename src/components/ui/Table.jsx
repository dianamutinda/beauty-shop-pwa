
export default function Table({
  columns = [],
  data = [],
  rowKey = 'id',
  loading = false,
  error = '',
  emptyMessage = 'No records found.',
  className = '',
  minWidth = '600px',
  ariaLabel = 'Data table',
}) {
  const getRowKey = (row, index) => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }

    return row[rowKey] ?? index;
  };

  return (
    <div
      className={`w-full min-w-0 overflow-hidden rounded-xl border border-border bg-background ${className}`}
    >
      <div
        role="region"
        aria-label="Scrollable table"
        tabIndex={0}
        className="w-full overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-interactive-primary"
      >
        <table
          aria-label={ariaLabel}
          className="w-full border-collapse text-left text-sm"
          style={{ minWidth }}
        >
          <thead className="bg-surface">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`
                    whitespace-nowrap border-b border-divider
                    px-4 py-3 font-medium text-text-secondary
                    ${column.align === 'right' ? 'text-right' : ''}
                    ${column.align === 'center' ? 'text-center' : ''}
                    ${column.className || ''}
                  `}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-divider">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`loading-${index}`}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-4">
                      <div className="h-4 w-24 max-w-full animate-pulse rounded bg-surface" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="px-4 py-10 text-center text-sm text-error"
                >
                  {error}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="px-4 py-10 text-center text-sm text-text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={getRowKey(row, rowIndex)}
                  className="transition-colors hover:bg-surface/70"
                >
                  {columns.map((column) => {
                    const value = row[column.key];

                    return (
                      <td
                        key={column.key}
                        className={`
                          px-4 py-3.5 text-text-primary
                          ${column.align === 'right' ? 'text-right' : ''}
                          ${column.align === 'center' ? 'text-center' : ''}
                          ${column.cellClassName || ''}
                        `}
                      >
                        {column.render
                          ? column.render(value, row, rowIndex)
                          : value ?? '—'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
