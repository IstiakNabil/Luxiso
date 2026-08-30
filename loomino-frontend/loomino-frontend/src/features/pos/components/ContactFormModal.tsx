import { useState } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import Modal from "./Modal";
import { useCreateContact, useUpdateContact } from "../hooks/useContacts";
import { useCustomerGroups } from "../hooks/useContacts";
import type { ContactDetail, ContactType, ContactWritePayload } from "../types/pos";

const TYPE_OPTIONS: { value: ContactType; label: string }[] = [
  { value: "customer", label: "Customer" },
  { value: "supplier", label: "Supplier" },
  { value: "both", label: "Both" },
];

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
      />
    </label>
  );
}

interface ContactFormModalProps {
  mode: "add" | "edit";
  /** Which list this Add was opened from — defaults the type picker. */
  defaultType?: ContactType;
  contact?: ContactDetail;
  onClose: () => void;
  /** When opened as a quick-add (e.g. from Add Purchase), hand the new contact back instead of just closing. */
  onCreated?: (contact: ContactDetail) => void;
}

function ContactFormModal({ mode, defaultType, contact, onClose, onCreated }: ContactFormModalProps) {
  const [contactType, setContactType] = useState<ContactType>(
    contact?.contact_type ?? defaultType ?? "customer",
  );
  const [name, setName] = useState(contact?.name ?? "");
  const [businessName, setBusinessName] = useState(contact?.business_name ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [address, setAddress] = useState(contact?.address ?? "");
  const [city, setCity] = useState(contact?.city ?? "");
  const [country, setCountry] = useState(contact?.country ?? "Bangladesh");
  const [taxNumber, setTaxNumber] = useState(contact?.tax_number ?? "");
  const [customerGroup, setCustomerGroup] = useState<number | "">(
    contact?.customer_group ?? "",
  );
  const [creditLimit, setCreditLimit] = useState(contact?.credit_limit ?? "0");
  const [payTermDays, setPayTermDays] = useState(
    contact?.pay_term_days != null ? String(contact.pay_term_days) : "",
  );
  const [openingBalance, setOpeningBalance] = useState(
    contact?.opening_balance ?? "0",
  );
  const [advanceBalance, setAdvanceBalance] = useState(
    contact?.advance_balance ?? "0",
  );
  const [customField1, setCustomField1] = useState(contact?.custom_field_1 ?? "");
  const [customField2, setCustomField2] = useState(contact?.custom_field_2 ?? "");
  const [isActive, setIsActive] = useState(contact?.is_active ?? true);

  const groupsQuery = useCustomerGroups();
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    const payload: ContactWritePayload = {
      contact_type: contactType,
      name,
      business_name: businessName,
      phone,
      email,
      address,
      city,
      country,
      tax_number: taxNumber,
      customer_group: customerGroup === "" ? null : customerGroup,
      credit_limit: creditLimit,
      pay_term_days: payTermDays === "" ? null : Number(payTermDays),
      opening_balance: openingBalance,
      advance_balance: advanceBalance,
      custom_field_1: customField1,
      custom_field_2: customField2,
      is_active: isActive,
    };

    try {
      if (mode === "add") {
        const created = await createMutation.mutateAsync(payload);
        toast.success(`${name} added.`);
        onCreated?.(created);
      } else if (contact) {
        await updateMutation.mutateAsync({ id: contact.id, payload });
        toast.success("Contact updated.");
      }
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <Modal
      title={mode === "add" ? "Add Contact" : "Edit Contact"}
      onClose={onClose}
      width="max-w-2xl"
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
            Type
          </label>
          <div className="flex gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setContactType(opt.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-[13px] font-medium transition ${
                  contactType === opt.value
                    ? "border-[#7C6AE8] bg-[#F1EAFB] text-[#7C4FD6]"
                    : "border-[#E7E4F3] text-[#726C8C] hover:bg-[#F5F4FA]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Name" value={name} onChange={setName} placeholder="Full name" />
          <Field
            label="Business Name"
            value={businessName}
            onChange={setBusinessName}
            placeholder="Optional"
          />
          <Field label="Phone" value={phone} onChange={setPhone} />
          <Field label="Email" value={email} onChange={setEmail} type="email" />
          <Field label="City" value={city} onChange={setCity} />
          <Field label="Country" value={country} onChange={setCountry} />
          <Field label="Tax Number" value={taxNumber} onChange={setTaxNumber} />

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Customer Group
            </span>
            <select
              value={customerGroup}
              onChange={(e) =>
                setCustomerGroup(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">None</option>
              {groupsQuery.data?.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>

          <Field
            label="Credit Limit"
            value={creditLimit}
            onChange={setCreditLimit}
            type="number"
          />
          <Field
            label="Pay Term (days)"
            value={payTermDays}
            onChange={setPayTermDays}
            type="number"
            placeholder="Leave blank for no term"
          />
          <Field
            label="Opening Balance"
            value={openingBalance}
            onChange={setOpeningBalance}
            type="number"
          />
          <Field
            label="Advance Balance"
            value={advanceBalance}
            onChange={setAdvanceBalance}
            type="number"
          />
          <Field label="Custom Field 1" value={customField1} onChange={setCustomField1} />
          <Field label="Custom Field 2" value={customField2} onChange={setCustomField2} />
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
            Address
          </span>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
          />
        </label>

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

export default ContactFormModal;
