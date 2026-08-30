import { z } from "zod";

export const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone_number: z
    .string()
    .max(20, "Phone number is too long")
    .optional(),
});

export type ProfileFormValues = z.infer<
  typeof profileSchema
>;

/** Address form shared by add/edit. Maps to the backend Address model. */
export const addressSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
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
});

export type AddressFormValues = z.infer<
  typeof addressSchema
>;
