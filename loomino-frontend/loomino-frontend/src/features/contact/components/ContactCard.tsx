import type { ReactNode } from "react";

interface ContactCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  actionLabel: string;
  href?: string;
  onClick?: () => void;
}

/**
 * One of the three contact method cards (chat / call / email).
 * Outlined brown button, centered content, per the Figma frame.
 */
function ContactCard({
  icon,
  title,
  subtitle,
  actionLabel,
  href,
  onClick,
}: ContactCardProps) {
  const button = (
    <span className="flex h-[40px] w-full items-center justify-center border border-[#8A6A2E] px-4 text-[14px] text-[#8A6A2E] transition hover:bg-[#E7DFCF]">
      {actionLabel}
    </span>
  );

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <div className="flex flex-col items-center gap-3">
        <span className="text-[#8A6A2E]">{icon}</span>
        <h3 className="text-[16px] font-bold capitalize text-[#1F1210]">
          {title}
        </h3>
        <p className="text-center text-[12px] capitalize leading-[1.8] text-[#1F1210]">
          {subtitle}
        </p>
      </div>

      {href ? (
        <a href={href} className="w-full">
          {button}
        </a>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="w-full"
        >
          {button}
        </button>
      )}
    </div>
  );
}

export default ContactCard;
