import { Mail, Phone, Headphones, Clock, MapPin } from "lucide-react";

import { useSiteSettings } from "@/hooks/useSiteSettings";

/**
 * Footer contact strip — business email, phone, hotline,
 * service hours and physical address, all from Site Settings.
 * Each row is only shown if its field is set, so a blank field
 * in the admin simply drops that line.
 */
function FooterContact() {
  const { data: settings } = useSiteSettings();

  const rows = [
    settings?.email_address && {
      Icon: Mail,
      content: (
        <a
          href={`mailto:${settings.email_address}`}
          className="transition hover:text-[#D4B483]"
        >
          {settings.email_address}
        </a>
      ),
    },
    settings?.phone_number && {
      Icon: Phone,
      content: (
        <a
          href={`tel:${settings.phone_number}`}
          className="transition hover:text-[#D4B483]"
        >
          {settings.phone_number}
        </a>
      ),
    },
    settings?.hotline_number && {
      Icon: Headphones,
      content: <span>Hotline: {settings.hotline_number}</span>,
    },
    settings?.service_hours && {
      Icon: Clock,
      content: <span>{settings.service_hours}</span>,
    },
    settings?.physical_address && {
      Icon: MapPin,
      content: (
        <span className="whitespace-pre-line">
          {settings.physical_address}
        </span>
      ),
    },
  ].filter(Boolean) as { Icon: typeof Mail; content: React.ReactNode }[];

  if (rows.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      <h4 className="mb-4 text-[18px] font-medium text-white lg:mb-6 lg:text-[22px]">
        Get In Touch
      </h4>
      {rows.map(({ Icon, content }, i) => (
        <div
          key={i}
          className="flex items-start gap-3 text-sm text-white lg:text-base"
        >
          <Icon size={18} className="mt-0.5 shrink-0 text-[#D4B483]" />
          <div>{content}</div>
        </div>
      ))}
    </div>
  );
}

export default FooterContact;
