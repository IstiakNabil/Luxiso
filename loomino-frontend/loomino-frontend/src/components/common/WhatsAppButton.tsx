import { FaWhatsapp } from "react-icons/fa6";

import { useSiteSettings } from "@/hooks/useSiteSettings";

/**
 * Floating WhatsApp button, bottom-right on every page. Wired
 * to the official number from Site Settings (phone_number) —
 * hidden entirely if that field is blank. Change the number in
 * Admin > Settings and this updates everywhere.
 */
function WhatsAppButton() {
  const { data: settings } = useSiteSettings();

  const raw = settings?.phone_number?.trim();
  if (!raw) return null;

  // wa.me needs digits only (no +, spaces, or dashes).
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 lg:bottom-8 lg:right-8"
    >
      <FaWhatsapp size={30} />
    </a>
  );
}

export default WhatsAppButton;
