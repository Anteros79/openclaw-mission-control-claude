type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
};

export const DataTable = <T,>({ columns, rows, rowKey, onRowClick }: DataTableProps<T>) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-white/10">
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-4 py-3 text-xs uppercase tracking-[0.24em] text-white/42"
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={rowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className="border-b border-white/5 transition hover:bg-white/4 cursor-pointer"
          >
            {columns.map((col) => (
              <td key={col.key} className={col.className ?? "px-4 py-3 text-white/75"}>
                {col.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
