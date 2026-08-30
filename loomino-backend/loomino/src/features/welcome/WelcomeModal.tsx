import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const SEEN_KEY = "loomino_welcome_seen";

/**
 * First-visit welcome modal, built to the Figma
 * Welcome/06 frame. Shows once per browser (tracked in
 * localStorage), dismissable, with a CTA to the shop.
 */
function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) {
        setOpen(true);
      }
    } catch {
      // localStorage unavailable — just don't show.
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(SEEN_KEY, "true");
    } catch {
      // ignore
    }
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () =>
      window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  const startShopping = () => {
    dismiss();
    navigate("/shop");
  };

  return (
    <div className="font-loomino fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close welcome"
        onClick={dismiss}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />

      {/* Card */}
      <div className="relative mx-6 flex w-full max-w-[854px] flex-col items-center gap-8 bg-white px-6 py-12 text-center">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute left-6 top-6 text-[#0C0C0C] transition hover:opacity-70"
        >
          <X size={24} />
        </button>

        <h2 className="text-[28px] font-semibold capitalize leading-[1.4] text-[#0C0C0C] md:text-[32px]">
          Welcome to Loomino
        </h2>

        <p
          className="text-[22px] capitalize italic leading-[1.8] text-[#0C0C0C] md:text-[24px]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Elegance in simplicity, Earth's harmony
        </p>

        <p className="text-[20px] font-bold capitalize leading-[1.4] text-[#0C0C0C] md:text-[24px]">
          Is It Your First Experience On Loomino?
        </p>

        <button
          type="button"
          onClick={startShopping}
          className="h-[48px] w-full max-w-[392px] bg-[#4C300D] text-[16px] capitalize text-white transition hover:opacity-90"
        >
          Create Your Own Style
        </button>
      </div>
    </div>
  );
}

export default WelcomeModal;
