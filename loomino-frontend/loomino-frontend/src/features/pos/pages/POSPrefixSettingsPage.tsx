import { useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import { useDocumentPrefixes, useUpdateDocumentPrefix } from "../hooks/useSettings";

function POSPrefixSettingsPage() {
  const { data, isLoading } = useDocumentPrefixes();
  const updateMutation = useUpdateDocumentPrefix();

  const [editingType, setEditingType] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState("");

  const startEdit = (documentType: string, currentPrefix: string) => {
    setEditingType(documentType);
    setDraftValue(currentPrefix);
  };

  const handleSave = async (documentType: string) => {
    if (!draftValue.trim()) {
      toast.error("Prefix can't be empty.");
      return;
    }
    try {
      await updateMutation.mutateAsync({ documentType, prefix: draftValue.trim() });
      toast.success("Prefix updated.");
      setEditingType(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-bold text-[#221F35]">Prefixes</h1>
        <p className="text-[13px] text-[#726C8C]">
          Changing a prefix here only affects new documents created from now on — existing
          reference numbers keep their original prefix.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        {isLoading ? (
          <p className="text-[13px] text-[#A8A2C9]">Loading…</p>
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#EDEBFA] text-[#726C8C]">
                <th className="py-2 pr-4 font-medium">Document Type</th>
                <th className="py-2 pr-4 font-medium">Prefix</th>
                <th className="py-2 pr-4 font-medium">Example</th>
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody>
              {data?.map((row) => (
                <tr key={row.document_type} className="border-b border-[#F5F4FA]">
                  <td className="py-2.5 pr-4 text-[#221F35]">{row.document_type_display}</td>
                  <td className="py-2.5 pr-4">
                    {editingType === row.document_type ? (
                      <input
                        value={draftValue}
                        onChange={(e) => setDraftValue(e.target.value.toUpperCase())}
                        autoFocus
                        className="w-24 rounded-lg border border-[#E7E4F3] px-2 py-1 text-[13px] outline-none focus:border-[#7C6AE8]"
                      />
                    ) : (
                      <span className="font-medium text-[#221F35]">{row.prefix}</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-[#A8A2C9]">{row.prefix}00001</td>
                  <td className="py-2.5 pr-4 text-right">
                    {editingType === row.document_type ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingType(null)}
                          className="rounded-md border border-[#E7E4F3] px-3 py-1 text-[12px] font-medium text-[#726C8C] hover:bg-[#F5F4FA]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSave(row.document_type)}
                          disabled={updateMutation.isPending}
                          className="rounded-md bg-[#7C6AE8] px-3 py-1 text-[12px] font-medium text-white hover:bg-[#6C5AD8] disabled:opacity-60"
                        >
                          {updateMutation.isPending ? "Saving…" : "Save"}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(row.document_type, row.prefix)}
                        className="flex items-center gap-1 rounded-md border border-[#E7E4F3] px-2.5 py-1 text-[12px] font-medium text-[#726C8C] hover:bg-[#F5F4FA]"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default POSPrefixSettingsPage;
