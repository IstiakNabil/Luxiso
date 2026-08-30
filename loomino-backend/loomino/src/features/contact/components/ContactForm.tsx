import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/apiError";
import FieldError from "@/features/auth/components/FieldError";
import {
  contactSchema,
  CONTACT_SUBJECTS,
  type ContactFormValues,
} from "../schemas";

/**
 * "Write Us" contact form. Underline-style inputs per the
 * Figma frame. NOTE: there is no backend contact endpoint,
 * so submission validates and shows a success state locally
 * — it does not send anywhere yet.
 */
function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (values: ContactFormValues) => {
    try {
      await api.post("/contact/messages/", {
        sender_name: values.full_name,
        sender_email: values.email,
        phone: "",
        subject: values.subject,
        message: values.message,
      });
      setSubmitted(true);
      toast.success(
        "Thanks for reaching out! We'll get back to you within 1–2 business days.",
      );
      reset();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Couldn't send your message. Please try again.",
        ),
      );
    }
  };

  const inputClass =
    "h-[40px] w-full border-b border-[#606060] bg-transparent px-4 text-[14px] text-[#0C0C0C] outline-none transition placeholder:text-[#606060] focus:border-[#4C300D]";

  return (
    <div className="w-full max-w-[1016px]">
      {/* Write Us heading */}
      <div className="flex items-center gap-2">
        <Mail size={24} className="text-[#4C300D]" />
        <h2 className="text-[24px] font-bold capitalize text-[#0C0C0C]">
          Write Us
        </h2>
      </div>

      {submitted ? (
        <div className="mt-8 flex flex-col items-center gap-4 border border-[#CBCBCB] bg-[#F0F2EF] py-14 text-center">
          <CheckCircle2
            size={48}
            className="text-[#4C300D]"
          />
          <p className="text-[18px] font-semibold text-[#0C0C0C]">
            Your message has been received.
          </p>
          <p className="max-w-[420px] text-[14px] leading-[1.8] text-[#606060]">
            We'll aim to respond within 1–2 business days.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-2 text-[14px] text-[#4C300D] hover:underline"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8"
          noValidate
        >
          <h3 className="text-[20px] font-bold capitalize text-[#0C0C0C]">
            Your Information
          </h3>

          <div className="mt-6 space-y-6">
            <div>
              <input
                placeholder="Full Name"
                className={inputClass}
                {...register("full_name")}
              />
              <FieldError
                message={errors.full_name?.message}
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                className={inputClass}
                {...register("email")}
              />
              <FieldError
                message={errors.email?.message}
              />
            </div>

            <div>
              <select
                className={`${inputClass} appearance-none`}
                defaultValue=""
                {...register("subject")}
              >
                <option value="" disabled>
                  Subject
                </option>
                {CONTACT_SUBJECTS.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              <FieldError
                message={errors.subject?.message}
              />
            </div>

            <div>
              <input
                placeholder="Order Number (optional)"
                className={inputClass}
                {...register("order_number")}
              />
            </div>

            <div>
              <input
                placeholder="Message"
                className={inputClass}
                {...register("message")}
              />
              <FieldError
                message={errors.message?.message}
              />
            </div>
          </div>

          {/* Privacy */}
          <label className="mt-8 flex items-center gap-2 text-[14px] capitalize text-[#0C0C0C]">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#4C300D]"
              {...register("privacy")}
            />
            I have read and understood the contact us
            privacy and policy.
          </label>
          <FieldError message={errors.privacy?.message} />

          {/* Send */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="h-[40px] w-full bg-[#4C300D] px-4 text-[14px] text-[#F0E6D8] transition hover:opacity-90 md:w-[288px]"
            >
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ContactForm;
