import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import ProfileField from "./ProfileField";
import ProfileSelect from "./ProfileSelect";
import { COUNTRY_OPTIONS } from "@/lib/constants";
import type { Address } from "@/features/addresses/types/address";
import {
  addressSchema,
  type AddressFormValues,
} from "../schemas/profile.schemas";

interface AddressFormProps {
  initial?: Address;
  submitting?: boolean;
  onSubmit: (values: AddressFormValues) => void;
  onCancel: () => void;
}

function AddressForm({
  initial,
  submitting = false,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      full_name: initial?.full_name ?? "",
      phone_number: initial?.phone_number ?? "",
      country: initial?.country ?? COUNTRY_OPTIONS[0],
      division: initial?.division ?? "",
      district: initial?.district ?? "",
      postal_code: initial?.postal_code ?? "",
      address_line: initial?.address_line ?? "",
      landmark: initial?.landmark ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border border-[#CBCBCB] bg-[#F0F2EF] p-6"
      noValidate
    >
      <h3 className="text-[18px] font-bold text-[#0C0C0C]">
        {initial ? "Edit Address" : "Add New Address"}
      </h3>

      <div className="mt-6 space-y-4">
        <ProfileField
          label="Full Name"
          error={errors.full_name?.message}
          {...register("full_name")}
        />

        <ProfileField
          label="Phone Number"
          type="tel"
          error={errors.phone_number?.message}
          {...register("phone_number")}
        />

        <ProfileField
          label="Street Address"
          error={errors.address_line?.message}
          {...register("address_line")}
        />

        <ProfileField
          label="City"
          error={errors.district?.message}
          {...register("district")}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ProfileField
            label="State / Region"
            error={errors.division?.message}
            {...register("division")}
          />
          <ProfileField
            label="Postal Code"
            error={errors.postal_code?.message}
            {...register("postal_code")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ProfileSelect
            label="Country"
            options={COUNTRY_OPTIONS}
            error={errors.country?.message}
            {...register("country")}
          />
          <ProfileField
            label="Landmark (Optional)"
            error={errors.landmark?.message}
            {...register("landmark")}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="h-[48px] w-[180px] bg-[#343E32] text-[14px] text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting
            ? "Saving..."
            : initial
              ? "Save Changes"
              : "Add Address"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="h-[48px] w-[120px] border border-[#4C300D] text-[14px] text-[#4C300D] transition hover:bg-[#E7DFCF]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default AddressForm;
