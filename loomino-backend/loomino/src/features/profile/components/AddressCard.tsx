import type { Address } from "@/features/addresses/types/address";

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  busy?: boolean;
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  busy = false,
}: AddressCardProps) {
  return (
    <div className="border border-[#CBCBCB] bg-[#F0F2EF] p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1 text-[15px] leading-[1.8]">
          <p className="text-[16px] font-bold text-[#0C0C0C]">
            {address.full_name}
            {address.is_default && (
              <span className="ml-3 bg-[#4C300D] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.6px] text-white">
                Default
              </span>
            )}
          </p>
          <p>{address.address_line}</p>
          <p>{address.district}</p>
          <p>
            {address.division} {address.postal_code}
          </p>
          <p>{address.country}</p>
          <p>{address.phone_number}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[#D8D0BF] pt-4 text-[14px]">
        <button
          type="button"
          onClick={onEdit}
          className="text-[#4C300D] hover:underline"
        >
          Edit
        </button>

        {!address.is_default && (
          <button
            type="button"
            onClick={onSetDefault}
            disabled={busy}
            className="text-[#4C300D] hover:underline disabled:opacity-50"
          >
            Set As Default
          </button>
        )}

        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="text-[#8A3B3B] hover:underline disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default AddressCard;
