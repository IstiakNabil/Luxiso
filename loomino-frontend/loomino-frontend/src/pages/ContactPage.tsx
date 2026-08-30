import { MessageCircle, Phone, Mail } from "lucide-react";

import Breadcrumb from "@/components/common/Breadcrumb";
import ContactForm from "@/features/contact/components/ContactForm";
import ContactCard from "@/features/contact/components/ContactCard";
import { useSiteSettings } from "@/hooks/useSiteSettings";

function ContactPage() {
  const { data: settings } = useSiteSettings();

  const email = settings?.email_address || "hello@loomino.com";
  const phone = settings?.phone_number || "";
  const phoneDigits = phone.replace(/[^\d]/g, "");
  const address = settings?.physical_address || "";
  const mapUrl = settings?.google_map_embed_url || "";

  return (
    <div className="font-loomino min-h-[calc(100vh-110px)] bg-[#F0E6D8]">
      <div className="mx-auto max-w-[1920px] px-5 md:px-10 pt-[32px] lg:px-[108px]">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "Contact Us" },
          ]}
        />
      </div>

      <div className="mx-auto max-w-[1224px] px-5 md:px-10 pb-[80px] lg:px-[108px]">
        <h1 className="text-[32px] font-semibold capitalize leading-[1.4] text-[#1F1210]">
          Contact Us
        </h1>

        {/* Intro */}
        <p className="mt-6 max-w-[1016px] text-[16px] leading-[1.8] text-[#1F1210]">
          We always love hearing from our customers! Please
          don't hesitate to contact us should you have any
          questions regarding our products and sizing
          recommendations, or inquiries about your current
          order. Contact our Customer Care team through the
          form below, email us at {email}, or live chat with
          us. We'll aim to respond within 1–2 business days.
        </p>

        {/* Form */}
        <div className="mt-14 flex justify-center">
          <ContactForm />
        </div>

        {/* Three cards */}
        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3">
          <ContactCard
            icon={<MessageCircle size={24} />}
            title="Chat With Us"
            subtitle="We are here and ready to chat"
            actionLabel="Start Chat"
            href={
              phoneDigits
                ? `https://wa.me/${phoneDigits}`
                : undefined
            }
          />
          <ContactCard
            icon={<Phone size={24} />}
            title="Call Us"
            subtitle="We're here to talk to you"
            actionLabel={phone || "Call us"}
            href={phone ? `tel:${phone}` : undefined}
          />
          <ContactCard
            icon={<Mail size={24} />}
            title="Email Us"
            subtitle="You are welcome to send us an email"
            actionLabel="Send Email"
            href={`mailto:${email}`}
          />
        </div>

        {/* Store location */}
        {(address || mapUrl) && (
          <div className="mt-20">
            <h2 className="text-[24px] font-semibold capitalize text-[#1F1210]">
              Visit Our Store
            </h2>
            {address && (
              <p className="mt-4 whitespace-pre-line text-[16px] leading-[1.8] text-[#1F1210]">
                {address}
              </p>
            )}
            {mapUrl && (
              <div className="mt-6 h-[360px] w-full overflow-hidden rounded-md">
                <iframe
                  src={mapUrl}
                  title="Store location"
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactPage;
