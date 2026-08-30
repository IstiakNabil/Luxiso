import type { ReactNode } from "react";
import { X } from "lucide-react";

interface AdminModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Modal width. Default "sm" (480px). */
  size?: "sm" | "lg";
}

const WIDTHS: Record<string, string> = {
  sm: "max-w-[480px]",
  lg: "max-w-[860px]",
};

function AdminModal({
  open,
  title,
  onClose,
  children,
  size = "sm",
}: AdminModalProps) {
  if (!open) return null;

  return (
    <div className="font-loomino fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        className={`relative z-10 flex max-h-[90vh] w-full flex-col rounded-2xl bg-white shadow-xl ${WIDTHS[size]}`}
      >
        <div className="flex items-center justify-between border-b border-[#EFE9DE] px-6 py-4">
          <h2 className="text-[18px] font-bold text-[#2C2418]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[#8A7C64] hover:text-[#2C2418]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AdminModal;
