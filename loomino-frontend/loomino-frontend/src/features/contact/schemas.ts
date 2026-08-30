import { z } from "zod";

export const contactSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  subject: z.string().min(1, "Please choose a subject"),
  order_number: z.string().optional(),
  message: z.string().min(1, "Please enter a message"),
  privacy: z.literal(true, {
    message: "Please accept the privacy policy",
  }),
});

export type ContactFormValues = z.infer<
  typeof contactSchema
>;

export const CONTACT_SUBJECTS = [
  "General Inquiry",
  "Order Support",
  "Returns & Refunds",
  "Product & Sizing",
  "Feedback",
  "Other",
];
