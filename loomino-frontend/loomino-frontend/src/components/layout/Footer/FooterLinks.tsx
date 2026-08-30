import { Link } from "react-router-dom";

import { useSiteSettings } from "@/hooks/useSiteSettings";

interface FooterLink {
  label: string;
  /** Internal route. */
  to?: string;
  /** External URL (privacy/terms from settings). Wins over `to`. */
  href?: string;
}

function FooterLinks() {
  const { data: settings } = useSiteSettings();

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: "About Loomino",
      links: [
        { label: "Collection", to: "/shop" },
        { label: "Our Story", to: "/sustainability" },
        {
          label: "Privacy Policy",
          href: settings?.privacy_policy_link || undefined,
        },
        { label: "Support System", to: "/contact" },
        {
          label: "Terms & Condition",
          href: settings?.terms_conditions_link || undefined,
        },
        { label: "Copyright Notice" },
      ],
    },
    {
      title: "Help & Support",
      links: [
        { label: "Orders & Shipping" },
        { label: "Returns & Refunds" },
        { label: "FAQs", to: "/faqs" },
        { label: "Contact Us", to: "/contact" },
      ],
    },
    {
      title: "Join Up",
      links: [
        { label: "Loomino Club" },
        { label: "Careers" },
        { label: "Visit Us", to: "/contact" },
      ],
    },
  ];

  const linkClass =
    "cursor-pointer text-sm text-white transition hover:text-[#D4B483] lg:text-base";

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:flex lg:gap-20">
      {columns.map((column) => (
        <div key={column.title}>
          <h4 className="mb-4 text-[18px] font-medium text-white lg:mb-6 lg:text-[22px]">
            {column.title}
          </h4>

          <ul className="space-y-3 lg:space-y-4">
            {column.links.map((link) => (
              <li key={link.label}>
                {link.href ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {link.label}
                  </a>
                ) : link.to ? (
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                ) : (
                  <span className={linkClass}>{link.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default FooterLinks;
