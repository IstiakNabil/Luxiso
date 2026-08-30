import { useState } from "react";
import { toast } from "sonner";
import { Search, Check } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import Modal from "./Modal";
import { usePOSAuth } from "../hooks/usePOSAuth";
import { useAccountSearch } from "../hooks/useUserManagement";
import { useCreateStaff, useUpdateStaff } from "../hooks/useUserManagement";
import type { AccountSearchResult, POSRole, POSStaffDetail } from "../types/pos";

const ROLE_OPTIONS: { value: POSRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "cashier", label: "Cashier" },
];

interface StaffFormModalProps {
  mode: "add" | "edit";
  staff?: POSStaffDetail;
  onClose: () => void;
}

function StaffFormModal({ mode, staff, onClose }: StaffFormModalProps) {
  const { me } = usePOSAuth();
  const locations = me?.has_pos_access ? me.locations : [];

  const [selectedAccount, setSelectedAccount] = useState<AccountSearchResult | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<POSRole>(staff?.role ?? "cashier");
  const [locationIds, setLocationIds] = useState<number[]>(
    staff?.location_ids ?? [],
  );
  const [isActive, setIsActive] = useState(staff?.is_active ?? true);

  const searchQuery = useAccountSearch(query);
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const toggleLocation = (id: number) => {
    setLocationIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    try {
      if (mode === "add") {
        if (!selectedAccount) {
          toast.error("Pick an account first.");
          return;
        }
        await createMutation.mutateAsync({
          user: selectedAccount.id,
          role,
          locations: locationIds,
        });
        toast.success(`${selectedAccount.name || selectedAccount.email} added to POS.`);
      } else if (staff) {
        await updateMutation.mutateAsync({
          id: staff.id,
          payload: { role, locations: locationIds, is_active: isActive },
        });
        toast.success("Staff profile updated.");
      }
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <Modal title={mode === "add" ? "Add POS Staff" : "Edit POS Staff"} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {mode === "add" ? (
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Find account
            </label>
            {selectedAccount ? (
              <div className="flex items-center justify-between rounded-lg border border-[#E7E4F3] bg-[#F5F4FA] px-3 py-2">
                <div>
                  <p className="text-[13px] font-medium text-[#221F35]">
                    {selectedAccount.name || "(no name)"}
                  </p>
                  <p className="text-[12px] text-[#726C8C]">{selectedAccount.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAccount(null)}
                  className="text-[12px] font-medium text-[#7C6AE8] hover:underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] px-3 py-2">
                  <Search size={14} className="text-[#8A84B8]" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name or email (min 2 chars)"
                    className="w-full bg-transparent text-[13px] text-[#221F35] outline-none"
                  />
                </div>
                {query.trim().length >= 2 && (
                  <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-[#E7E4F3]">
                    {searchQuery.isLoading ? (
                      <p className="px-3 py-3 text-[13px] text-[#A8A2C9]">Searching…</p>
                    ) : searchQuery.data?.results.length === 0 ? (
                      <p className="px-3 py-3 text-[13px] text-[#A8A2C9]">
                        No matching accounts.
                      </p>
                    ) : (
                      searchQuery.data?.results.map((account) => (
                        <button
                          key={account.id}
                          type="button"
                          disabled={account.has_pos_profile}
                          onClick={() => {
                            setSelectedAccount(account);
                            setQuery("");
                          }}
                          className="flex w-full items-center justify-between border-b border-[#F5F4FA] px-3 py-2 text-left last:border-b-0 hover:bg-[#F5F4FA] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <div>
                            <p className="text-[13px] font-medium text-[#221F35]">
                              {account.name || "(no name)"}
                            </p>
                            <p className="text-[12px] text-[#726C8C]">{account.email}</p>
                          </div>
                          {account.has_pos_profile && (
                            <span className="text-[11px] text-[#A8A2C9]">
                              Already POS staff
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-[#E7E4F3] bg-[#F5F4FA] px-3 py-2">
            <p className="text-[13px] font-medium text-[#221F35]">{staff?.name}</p>
            <p className="text-[12px] text-[#726C8C]">{staff?.email}</p>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
            Role
          </label>
          <div className="flex gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-[13px] font-medium transition ${
                  role === opt.value
                    ? "border-[#7C6AE8] bg-[#F1EAFB] text-[#7C4FD6]"
                    : "border-[#E7E4F3] text-[#726C8C] hover:bg-[#F5F4FA]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
            Locations
          </label>
          {locations.length === 0 ? (
            <p className="text-[12px] text-[#A8A2C9]">No locations set up yet.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {locations.map((loc) => {
                const checked = locationIds.includes(loc.id);
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => toggleLocation(loc.id)}
                    className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] px-3 py-2 text-left text-[13px] text-[#221F35] hover:bg-[#F5F4FA]"
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded border ${
                        checked
                          ? "border-[#7C6AE8] bg-[#7C6AE8] text-white"
                          : "border-[#C9C4E8]"
                      }`}
                    >
                      {checked && <Check size={12} />}
                    </span>
                    {loc.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {mode === "edit" && (
          <label className="flex items-center gap-2 text-[13px] text-[#221F35]">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-[#C9C4E8] accent-[#7C6AE8]"
            />
            Active
          </label>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E7E4F3] px-4 py-2 text-[13px] font-medium text-[#726C8C] hover:bg-[#F5F4FA]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-[#7C6AE8] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#6C5AD8] disabled:opacity-60"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default StaffFormModal;
