import { Construction } from "lucide-react";

interface AdminPlaceholderProps {
  title: string;
  endpoint: string;
}

/**
 * Temporary placeholder for admin CRUD screens whose write
 * endpoints don't exist on the backend yet. Shows which
 * endpoint the screen will use once available.
 */
function AdminPlaceholder({
  title,
  endpoint,
}: AdminPlaceholderProps) {
  return (
    <div className="font-loomino flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8CDB8] bg-white text-center">
      <Construction size={40} className="text-[#A88548]" />
      <h2 className="mt-4 text-[20px] font-bold text-[#2C2418]">
        {title}
      </h2>
      <p className="mt-2 max-w-[420px] text-[14px] leading-[1.7] text-[#8A7C64]">
        This screen is ready to be wired up. It expects the
        backend endpoint{" "}
        <code className="rounded bg-[#F0E9DA] px-1.5 py-0.5 text-[#4C300D]">
          {endpoint}
        </code>
        .
      </p>
    </div>
  );
}

export default AdminPlaceholder;
