import { MessageCircle, Phone, Mail } from "lucide-react";

import Breadcrumb from "@/components/common/Breadcrumb";
import ContactForm from "@/features/contact/components/ContactForm";
import ContactCard from "@/features/contact/components/ContactCard";

function ContactPage() {
  return (
    <div className="font-loomino min-h-[calc(100vh-110px)] bg-[#F0E6D8]">
      <div className="mx-auto max-w-[1920px] px-6 pt-[32px] md:px-[108px]">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "Contact Us" },
          ]}
        />
      </div>

      <div className="mx-auto max-w-[1224px] px-6 pb-[80px] md:px-[108px]">
        <h1 className="text-[32px] font-semibold capitalize leading-[1.4] text-[#0C0C0C]">
          Contact Us
        </h1>

        {/* Intro */}
        <p className="mt-6 max-w-[1016px] text-[16px] leading-[1.8] text-[#0C0C0C]">
          We always love hearing from our customers! Please
          don't hesitate to contact us should you have any
          questions regarding our products and sizing
          recommendations, or inquiries about your current
          order. Contact our Customer Care team through the
          form below, email us at hello@loomino.com, or live
          chat with us. We'll aim to respond within 1–2
          business days.
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
          />
          <ContactCard
            icon={<Phone size={24} />}
            title="Call Us"
            subtitle="We're here to talk to you"
            actionLabel="+1 (929) 460-3208"
            href="tel:+19294603208"
          />
          <ContactCard
            icon={<Mail size={24} />}
            title="Email Us"
            subtitle="You are welcome to send us an email"
            actionLabel="Send Email"
            href="mailto:hello@loomino.com"
          />
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
