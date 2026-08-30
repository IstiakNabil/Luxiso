import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import Footer from "./Footer/Footer";
import WelcomeModal from "@/features/welcome/WelcomeModal";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import { useScrollToHash } from "@/app/hooks/useScrollToHash";
import { useSiteSettings } from "@/hooks/useSiteSettings";

function RootLayout() {
  useScrollToHash();
  // Load global settings once, app-wide — also pushes the
  // configured currency symbol into formatPrice().
  useSiteSettings();

  return (
    <div className="min-h-screen">
      <WelcomeModal />

      {/* Scaled separately so it still renders above the
          (unscaled) Navbar in the stacking order. */}
      <div className="mobile-scale-130">
        <AnnouncementBar />
      </div>

      <Navbar />

      {/* Everything below the navbar scales up 30% on mobile —
          see .mobile-scale-130 in index.css. */}
      <div className="mobile-scale-130">
        <main>
          <Outlet />
        </main>

        <Footer />
      </div>

      <Toaster position="top-right" richColors closeButton />
      <WhatsAppButton />
    </div>
  );
}

export default RootLayout;
