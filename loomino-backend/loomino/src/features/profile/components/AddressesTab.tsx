import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import { useAddresses } from "@/features/addresses/hooks/useAddresses";
import { useCreateAddress } from "@/features/addresses/hooks/useCreateAddress";
import { useUpdateAddress } from "@/features/addresses/hooks/useUpdateAddress";
import { useDeleteAddress } from "@/features/addresses/hooks/useDeleteAddress";
import { useSetDefaultAddress } from "@/features/addresses/hooks/useSetDefaultAddress";
import type { Address } from "@/features/addresses/types/address";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import type { AddressFormValues } from "../schemas/profile.schemas";

type Editing =
  | { mode: "none" }
  | { mode: "create" }
  | { mode: "edit"; address: Address };

function AddressesTab() {
  const { data: addresses, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefault = useSetDefaultAddress();

  const [editing, setEditing] = useState<Editing>({
    mode: "none",
  });
  const [confirmDelete, setConfirmDelete] = useState<
    number | null
  >(null);

  const handleCreate = async (
    values: AddressFormValues,
  ) => {
    try {
      await createAddress.mutateAsync({
        ...values,
        landmark: values.landmark || "",
      });
      toast.success("Address added.");
      setEditing({ mode: "none" });
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not add this address.",
        ),
      );
    }
  };

  const handleUpdate = async (
    id: number,
    values: AddressFormValues,
  ) => {
    try {
      await updateAddress.mutateAsync({
        id,
        payload: { ...values, landmark: values.landmark || "" },
      });
      toast.success("Address updated.");
      setEditing({ mode: "none" });
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not update this address.",
        ),
      );
    }
  };

  if (isLoading) {
    return (
      <p className="text-[16px] text-[#606060]">
        Loading addresses...
      </p>
    );
  }

  if (editing.mode === "create") {
    return (
      <AddressForm
        submitting={createAddress.isPending}
        onSubmit={handleCreate}
        onCancel={() => setEditing({ mode: "none" })}
      />
    );
  }

  if (editing.mode === "edit") {
    return (
      <AddressForm
        initial={editing.address}
        submitting={updateAddress.isPending}
        onSubmit={(values) =>
          handleUpdate(editing.address.id, values)
        }
        onCancel={() => setEditing({ mode: "none" })}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[16px] text-[#606060]">
          {addresses && addresses.length > 0
            ? "Manage your saved delivery addresses."
            : "You haven't saved any addresses yet."}
        </p>

        <button
          type="button"
          onClick={() => setEditing({ mode: "create" })}
          className="flex h-[44px] items-center gap-2 bg-[#343E32] px-5 text-[14px] text-white transition hover:opacity-90"
        >
          <Plus size={18} /> Add Address
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {addresses?.map((address) => (
          <div key={address.id}>
            <AddressCard
              address={address}
              busy={
                deleteAddress.isPending ||
                setDefault.isPending
              }
              onEdit={() =>
                setEditing({ mode: "edit", address })
              }
              onSetDefault={() =>
                setDefault.mutate(address.id)
              }
              onDelete={() =>
                setConfirmDelete(address.id)
              }
            />

            {confirmDelete === address.id && (
              <div className="mt-2 flex items-center gap-3 border border-[#E4C7C7] bg-[#F3E3E3] px-4 py-3 text-[14px]">
                <span className="text-[#8A3B3B]">
                  Delete this address?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    deleteAddress.mutate(address.id, {
                      onSettled: () =>
                        setConfirmDelete(null),
                    });
                  }}
                  className="font-semibold text-[#8A3B3B] hover:underline"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="text-[#4C300D] hover:underline"
                >
                  No
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AddressesTab;
