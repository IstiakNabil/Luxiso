import { useState } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import Modal from "./Modal";
import { useCreateBusinessLocation, useUpdateBusinessLocation } from "../hooks/useSettings";
import type { BusinessLocation } from "../types/pos";

interface LocationFormModalProps {
  mode: "add" | "edit";
  location?: BusinessLocation;
  onClose: () => void;
}

function LocationFormModal({ mode, location, onClose }: LocationFormModalProps) {
  const [name, setName] = useState(location?.name ?? "");
  const [locationId, setLocationId] = useState(location?.location_id ?? "");
  const [landmark, setLandmark] = useState(location?.landmark ?? "");
  const [city, setCity] = useState(location?.city ?? "");
  const [zipCode, setZipCode] = useState(location?.zip_code ?? "");
  const [state, setState] = useState(location?.state ?? "");
  const [country, setCountry] = useState(location?.country ?? "");
  const [phone, setPhone] = useState(location?.phone ?? "");
  const [address, setAddress] = useState(location?.address ?? "");
  const [isActive, setIsActive] = useState(location?.is_active ?? true);

  const createMutation = useCreateBusinessLocation();
  const updateMutation = useUpdateBusinessLocation();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    const payload = {
      name,
      location_id: locationId,
      landmark,
      city,
      zip_code: zipCode,
      state,
      country,
      phone,
      address,
      is_active: isActive,
    };
    try {
      if (mode === "add") {
        await createMutation.mutateAsync(payload);
        toast.success(`${name} added.`);
      } else if (location) {
        await updateMutation.mutateAsync({ id: location.id, payload });
        toast.success("Location updated.");
      }
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <Modal title={mode === "add" ? "Add Location" : "Edit Location"} onClose={onClose}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Location ID</span>
          <input
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            placeholder="Optional"
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Landmark</span>
          <input
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">City</span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Zip Code</span>
          <input
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">State</span>
          <input
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Country</span>
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Phone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Address</span>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
        </label>
        {mode === "edit" && (
          <label className="flex items-center gap-2 text-[13px] text-[#221F35] md:col-span-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-[#C9C4E8] accent-[#7C6AE8]"
            />
            Active
          </label>
        )}
      </div>
      <div className="mt-4 flex justify-end gap-2">
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
          className="rounded-lg bg-[#7C6AE8] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#6C5AD8] disabled:opacity-60"
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>
    </Modal>
  );
}

export default LocationFormModal;
