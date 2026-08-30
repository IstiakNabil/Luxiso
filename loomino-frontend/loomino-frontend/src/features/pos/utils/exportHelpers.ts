import type { Paginated } from "../types/pos";

/**
 * Loops a paginated service call until it runs out of pages, for
 * "export all matching rows" rather than just the current page.
 * Capped at 40 pages (1000 rows at 25/page) as a sanity limit —
 * plenty for any of this app's tables, and avoids a runaway loop if
 * something's ever wrong with a `next` cursor.
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<Paginated<T>>,
  maxPages = 40,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext && page <= maxPages) {
    const result = await fetchPage(page);
    all.push(...result.results);
    hasNext = Boolean(result.next);
    page += 1;
  }

  return all;
}

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function buildCsv(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((row) =>
    row.map((cell) => escapeCsvCell(cell)).join(","),
  );
  return lines.join("\r\n");
}

/**
 * "Excel export" here means an HTML table saved with a .xls
 * extension — Excel opens HTML tables transparently under that
 * extension. This avoids pulling in a binary-xlsx library (e.g.
 * SheetJS) as a new dependency just for this. Good enough for
 * tabular reports; doesn't support formulas/formatting.
 */
export function buildExcelHtml(title: string, headers: string[], rows: string[][]): string {
  const headerRow = `<tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>`;
  const bodyRows = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("");
  return `<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body><table border="1">${headerRow}${bodyRows}</table></body></html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Opens a print-formatted window and triggers the browser's print
 * dialog. Used for both "Print" and "Export to PDF" — there's no
 * server-side PDF generation, so PDF export means the person picks
 * "Save as PDF" as the destination in that dialog. This is a
 * deliberate simplification: true PDF generation would need a new
 * dependency (e.g. jsPDF) for comparatively little gain over the
 * browser's built-in print-to-PDF.
 */
export function openPrintWindow(title: string, headers: string[], rows: string[][]) {
  const headerRow = `<tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>`;
  const bodyRows = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("");

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h1 { font-size: 16px; margin-bottom: 12px; }
          table { border-collapse: collapse; width: 100%; font-size: 12px; }
          th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
          th { background: #f5f4fa; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <table>${headerRow}${bodyRows}</table>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  // Give the new window a beat to paint before invoking print.
  setTimeout(() => printWindow.print(), 250);
}
