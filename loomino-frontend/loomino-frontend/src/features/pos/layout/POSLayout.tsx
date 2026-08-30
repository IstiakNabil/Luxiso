import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

import POSSidebar from "./POSSidebar";
import POSTopbar from "./POSTopbar";

function POSLayout() {
  return (
    <div className="flex h-screen bg-[#F5F4FA]">
      <POSSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <POSTopbar />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default POSLayout;
