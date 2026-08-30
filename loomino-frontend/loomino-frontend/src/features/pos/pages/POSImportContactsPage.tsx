import { useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Upload, CheckCircle2, AlertCircle } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import {
  useImportContacts,
} from "../hooks/useContacts";
import { downloadContactImportTemplate } from "../services/pos.service";
import type { ContactImportResult } from "../types/pos";

function POSImportContactsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ContactImportResult | null>(null);
  const [downloading, setDownloading] = useState(false);

  const importMutation = useImportContacts();

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      await downloadContactImportTemplate();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Choose a CSV file first.");
      return;
    }
    try {
      const res = await importMutation.mutateAsync(selectedFile);
      setResult(res);
      if (res.created > 0) {
        toast.success(`${res.created} contact${res.created === 1 ? "" : "s"} imported.`);
      }
      if (res.failed.length > 0) {
        toast.error(`${res.failed.length} row${res.failed.length === 1 ? "" : "s"} had errors.`);
      }
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-bold text-[#221F35]">Import Contacts</h1>
        <p className="text-[13px] text-[#726C8C]">
          Bulk-add customers or suppliers from a CSV file
        </p>
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-1 text-[14px] font-semibold text-[#221F35]">1. Get the template</h3>
        <p className="mb-3 text-[13px] text-[#726C8C]">
          Download the blank CSV, fill it in with one contact per row, then upload it below.
          <code className="mx-1 rounded bg-[#F5F4FA] px-1.5 py-0.5 text-[12px]">
            contact_type
          </code>
          should be <code>customer</code>, <code>supplier</code>, or <code>both</code> — it
          defaults to <code>customer</code> if left blank.
        </p>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          disabled={downloading}
          className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] px-4 py-2 text-[13px] font-medium text-[#726C8C] hover:bg-[#F5F4FA] disabled:opacity-60"
        >
          <Download size={16} /> {downloading ? "Downloading…" : "Download CSV Template"}
        </button>
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-3 text-[14px] font-semibold text-[#221F35]">2. Upload your file</h3>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            className="text-[13px] text-[#3A3560]"
          />
          <button
            type="button"
            onClick={handleImport}
            disabled={importMutation.isPending || !selectedFile}
            className="flex items-center gap-2 rounded-lg bg-[#7C6AE8] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#6C5AD8] disabled:opacity-60"
          >
            <Upload size={16} /> {importMutation.isPending ? "Importing…" : "Import"}
          </button>
        </div>
      </div>

      {result && (
        <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
          <h3 className="mb-3 text-[14px] font-semibold text-[#221F35]">Result</h3>
          <div className="mb-3 flex items-center gap-2 text-[13px] text-[#2E9E5B]">
            <CheckCircle2 size={16} />
            {result.created} contact{result.created === 1 ? "" : "s"} created
          </div>
          {result.failed.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-[13px] text-[#C24F4F]">
                <AlertCircle size={16} />
                {result.failed.length} row{result.failed.length === 1 ? "" : "s"} skipped
              </div>
              <div className="flex flex-col gap-1.5">
                {result.failed.map((f) => (
                  <div
                    key={f.row}
                    className="rounded-lg border border-[#F3DCDC] bg-[#FBE9E9] px-3 py-2 text-[12px] text-[#8A3A3A]"
                  >
                    Row {f.row}:{" "}
                    {Object.entries(f.errors)
                      .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
                      .join(" · ")}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default POSImportContactsPage;
