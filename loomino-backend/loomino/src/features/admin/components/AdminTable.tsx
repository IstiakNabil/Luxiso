import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyField: (row: T) => string | number;
  isLoading?: boolean;
  isError?: boolean;
  emptyMessage?: string;
}

function AdminTable<T>({
  columns,
  rows,
  keyField,
  isLoading,
  isError,
  emptyMessage = "No records found.",
}: AdminTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#EFE9DE] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#EFE9DE] text-[11px] uppercase tracking-[0.5px] text-[#A89A80]">
              {columns.map((col) => (
                <th
                  key={col.header}
                  className={`px-6 py-3.5 font-medium ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-[14px] text-[#A89A80]"
                >
                  Loading…
                </td>
              </tr>
            )}

            {isError && !isLoading && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-[14px] text-[#9A3B3B]"
                >
                  Couldn't load this data. Please try again.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-10 text-center text-[14px] text-[#A89A80]"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}

            {!isLoading &&
              !isError &&
              rows.map((row) => (
                <tr
                  key={keyField(row)}
                  className="border-b border-[#F1ECE2] text-[14px] text-[#3A2E1B] last:border-0 hover:bg-[#FBF8F2]"
                >
                  {columns.map((col) => (
                    <td
                      key={col.header}
                      className={`px-6 py-4 ${col.className ?? ""}`}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminTable;
