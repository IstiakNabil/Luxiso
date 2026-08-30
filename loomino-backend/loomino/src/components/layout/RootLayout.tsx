import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import Footer from "./Footer/Footer";
import WelcomeModal from "@/features/welcome/WelcomeModal";

function RootLayout() {
  return (
    <div className="min-h-screen">
      <WelcomeModal />
      <AnnouncementBar />
      <Navbar />
      <main>
        <Outlet />
      </main>

      <Footer />

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default RootLayout;
