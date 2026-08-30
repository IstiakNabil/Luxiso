import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileSpreadsheet,
  Printer,
  Columns3,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";

import type { Paginated } from "../types/pos";
import {
  buildCsv,
  buildExcelHtml,
  downloadBlob,
  openPrintWindow,
} from "../utils/exportHelpers";

const PAGE_SIZE = 25;

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right";
  /**
   * Plain-text value for CSV/Excel/Print/PDF. Required for any column
   * whose `render` returns JSX (badges, buttons) rather than plain
   * text — falls back to String(render(row)) when omitted, which only
   * works for columns that render plain strings/numbers directly.
   */
  exportValue?: (row: T) => string;
  /** Set false for action/button columns that shouldn't appear in exports at all. */
  exportable?: boolean;
}

interface DataTableShellProps<T> {
  title: string;
  data: Paginated<T> | undefined;
  isLoading: boolean;
  columns: Column<T>[];
  page: number;
  onPageChange: (page: number) => void;
  emptyLabel?: string;
  rowKey: (row: T) => string | number;
  /**
   * Fetches every row across all pages (respecting current filters),
   * used only when an export button is clicked — on-screen rendering
   * always uses just `data.results` for the current page.
   */
  fetchAll: () => Promise<T[]>;
  /** Used to name downloaded files, e.g. "sales-payment-due". */
  filenameBase: string;
}

function DataTableShell<T>({
  title,
  data,
  isLoading,
  columns,
  page,
  onPageChange,
  emptyLabel = "No data available",
  rowKey,
  fetchAll,
  filenameBase,
}: DataTableShellProps<T>) {
  const count = data?.count ?? 0;
  const rows = data?.results ?? [];
  const from = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, count);

  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const visibleColumns = useMemo(
    () => columns.filter((col) => !hiddenColumns.has(col.header)),
    [columns, hiddenColumns],
  );

  const toggleColumn = (header: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(header)) next.delete(header);
      else next.add(header);
      return next;
    });
  };

  const exportColumns = columns.filter((col) => col.exportable !== false);

  const cellText = (col: Column<T>, row: T): string => {
    if (col.exportValue) return col.exportValue(row);
    const rendered = col.render(row);
    return typeof rendered === "string" || typeof rendered === "number"
      ? String(rendered)
      : "";
  };

  const withExportRows = async (
    action: (headers: string[], rows: string[][]) => void,
  ) => {
    setExporting(true);
    try {
      const allRows = await fetchAll();
      const headers = exportColumns.map((col) => col.header);
      const dataRows = allRows.map((row) => exportColumns.map((col) => cellText(col, row)));
      action(headers, dataRows);
    } catch {
      toast.error("Couldn't prepare the export. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportCsv = () =>
    withExportRows((headers, dataRows) => {
      const csv = buildCsv(headers, dataRows);
      downloadBlob(csv, `${filenameBase}.csv`, "text/csv;charset=utf-8;");
    });

  const handleExportExcel = () =>
    withExportRows((headers, dataRows) => {
      const html = buildExcelHtml(title, headers, dataRows);
      downloadBlob(html, `${filenameBase}.xls`, "application/vnd.ms-excel");
    });

  const handlePrint = () =>
    withExportRows((headers, dataRows) => {
      openPrintWindow(title, headers, dataRows);
    });

  const handleExportPdf = () =>
    withExportRows((headers, dataRows) => {
      // Same print-dialog path as Print — see openPrintWindow's docstring.
      openPrintWindow(title, headers, dataRows);
    });

  return (
    <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-[#E8A23D]" />
          <h3 className="text-[14px] font-semibold text-[#221F35]">{title}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <ToolbarButton
            icon={<FileText size={13} />}
            label="Export to CSV"
            onClick={handleExportCsv}
            disabled={exporting}
          />
          <ToolbarButton
            icon={<FileSpreadsheet size={13} />}
            label="Export to Excel"
            onClick={handleExportExcel}
            disabled={exporting}
          />
          <ToolbarButton
            icon={<Printer size={13} />}
            label="Print"
            onClick={handlePrint}
            disabled={exporting}
          />
          <div className="relative">
            <ToolbarButton
              icon={<Columns3 size={13} />}
              label="Column visibility"
              onClick={() => setColumnMenuOpen((o) => !o)}
            />
            {columnMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setColumnMenuOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-[#E7E4F3] bg-white p-2 shadow-lg">
                  {columns.map((col) => (
                    <label
                      key={col.header}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-[#3A3560] hover:bg-[#F5F4FA]"
                    >
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.has(col.header)}
                        onChange={() => toggleColumn(col.header)}
                        className="h-3.5 w-3.5 accent-[#7C6AE8]"
                      />
                      {col.header}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
          <ToolbarButton
            icon={<FileDown size={13} />}
            label="Export to PDF"
            onClick={handleExportPdf}
            disabled={exporting}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#EDEBFA] text-[#726C8C]">
              {visibleColumns.map((col) => (
                <th
                  key={col.header}
                  className={`py-2 pr-4 font-medium ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={visibleColumns.length} className="py-6 text-center text-[#A8A2C9]">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} className="py-6 text-center text-[#A8A2C9]">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)} className="border-b border-[#F5F4FA]">
                  {visibleColumns.map((col) => (
                    <td
                      key={col.header}
                      className={`py-2.5 pr-4 text-[#3A3560] ${
                        col.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-[12px] text-[#8A84B8]">
        <span>
          Showing {from} to {to} of {count} entries
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!data?.previous}
            onClick={() => onPageChange(page - 1)}
            className="flex items-center gap-1 rounded-md border border-[#E7E4F3] px-2.5 py-1 font-medium text-[#726C8C] transition hover:bg-[#F5F4FA] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <button
            type="button"
            disabled={!data?.next}
            onClick={() => onPageChange(page + 1)}
            className="flex items-center gap-1 rounded-md border border-[#E7E4F3] px-2.5 py-1 font-medium text-[#726C8C] transition hover:bg-[#F5F4FA] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="flex items-center gap-1.5 rounded-md border border-[#E7E4F3] px-2.5 py-1.5 text-[11px] font-medium text-[#726C8C] transition hover:bg-[#F5F4FA] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default DataTableShell;
