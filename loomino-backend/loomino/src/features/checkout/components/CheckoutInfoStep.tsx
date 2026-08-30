import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import { COUNTRY_OPTIONS } from "@/lib/constants";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useCreateAddress } from "@/features/addresses/hooks/useCreateAddress";
import type { Address } from "@/features/addresses/types/address";
import CheckoutInput from "./CheckoutInput";
import CheckoutSelect from "./CheckoutSelect";
import {
  shippingInfoSchema,
  type ShippingInfoValues,
} from "../schemas/checkout.schemas";

interface CheckoutInfoStepProps {
  onComplete: (address: Address) => void;
}

function CheckoutInfoStep({
  onComplete,
}: CheckoutInfoStepProps) {
  const { user } = useAuth();
  const { logout } = useLogout();
  const createAddress = useCreateAddress();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingInfoValues>({
    resolver: zodResolver(shippingInfoSchema),
    defaultValues: { country: COUNTRY_OPTIONS[0] },
  });

  const onSubmit = async (values: ShippingInfoValues) => {
    try {
      const address = await createAddress.mutateAsync({
        full_name:
          `${values.first_name} ${values.last_name}`.trim(),
        phone_number: values.phone_number,
        country: values.country,
        division: values.division,
        district: values.district,
        postal_code: values.postal_code,
        address_line: values.address_line,
        landmark: values.landmark || "",
        is_default: values.save_for_next_time ?? false,
      });

      onComplete(address);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not save your address. Please try again.",
        ),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Contact */}
      <div className="flex items-center justify-between">
        <h2 className="text-[22px]">Contact</h2>

        <p className="text-[16px]">
          Have An Account?{" "}
          <button
            type="button"
            onClick={() => void logout()}
            className="text-[#5B3A0E] hover:underline"
          >
            Log Out
          </button>
        </p>
      </div>

      <div className="mt-5">
        <input
          type="email"
          value={user?.email ?? ""}
          readOnly
          className="h-[52px] w-full border border-[#B9AE97] bg-transparent px-4 text-[15px] text-[#3F3A30] outline-none"
        />
      </div>

      {/* Shipping address */}
      <h2 className="mt-10 text-[22px]">
        Shipping Address
      </h2>

      <div className="mt-5 space-y-4">
        <CheckoutSelect
          options={COUNTRY_OPTIONS}
          error={errors.country?.message}
          {...register("country")}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CheckoutInput
            placeholder="First Name"
            autoComplete="given-name"
            error={errors.first_name?.message}
            {...register("first_name")}
          />
          <CheckoutInput
            placeholder="Last Name"
            autoComplete="family-name"
            error={errors.last_name?.message}
            {...register("last_name")}
          />
        </div>

        <CheckoutInput
          placeholder="Landmark (Optional)"
          error={errors.landmark?.message}
          {...register("landmark")}
        />

        <CheckoutInput
          placeholder="Street Address"
          autoComplete="address-line1"
          icon={<Search size={18} />}
          error={errors.address_line?.message}
          {...register("address_line")}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CheckoutInput
            placeholder="Postal Code"
            autoComplete="postal-code"
            error={errors.postal_code?.message}
            {...register("postal_code")}
          />
          <CheckoutInput
            placeholder="City"
            autoComplete="address-level2"
            error={errors.district?.message}
            {...register("district")}
          />
        </div>

        <CheckoutInput
          placeholder="State / Region"
          autoComplete="address-level1"
          error={errors.division?.message}
          {...register("division")}
        />

        <CheckoutInput
          type="tel"
          placeholder="Phone"
          autoComplete="tel"
          icon={<Smartphone size={18} />}
          error={errors.phone_number?.message}
          {...register("phone_number")}
        />

        <label className="flex items-center gap-3 pt-1 text-[15px]">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#5B3A0E]"
            {...register("save_for_next_time")}
          />
          Save This Information For Next Time
        </label>
      </div>

      {/* Actions */}
      <div className="mt-10 flex items-center justify-between">
        <a
          href="/cart"
          className="flex items-center gap-2 text-[16px] text-[#5B3A0E] hover:underline"
        >
          <span aria-hidden>&lsaquo;</span> Return To Cart
        </a>

        <button
          type="submit"
          disabled={createAddress.isPending}
          className="h-[52px] w-[220px] bg-[#5B3A0E] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createAddress.isPending
            ? "Saving..."
            : "Continue To Payment"}
        </button>
      </div>
    </form>
  );
}

export default CheckoutInfoStep;
