import { z } from "zod";

/**
 * Shipping address form. Maps the Figma fields onto the
 * backend Address model:
 * - first_name + last_name  -> full_name
 * - city                    -> district
 * - state/region            -> division
 */
export const shippingInfoSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone_number: z
    .string()
    .min(6, "Enter a valid phone number"),
  country: z.string().min(1, "Country is required"),
  division: z.string().min(1, "State / region is required"),
  district: z.string().min(1, "City is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  address_line: z
    .string()
    .min(1, "Street address is required"),
  landmark: z.string().optional(),
  save_for_next_time: z.boolean().optional(),
});

export type ShippingInfoValues = z.infer<
  typeof shippingInfoSchema
>;
