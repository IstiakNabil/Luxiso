import { Link } from "react-router-dom";

interface FooterLink {
  label: string;
  to?: string;
}

const footerLinks: { title: string; links: FooterLink[] }[] =
  [
    {
      title: "About Loomino",
      links: [
        { label: "Collection", to: "/shop" },
        { label: "Sustainability", to: "/sustainability" },
        { label: "Privacy Policy" },
        { label: "Support System" },
        { label: "Terms & Condition" },
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
        { label: "Visit Us" },
      ],
    },
  ];

function FooterLinks() {
  return (
    <div className="flex gap-20">
      {footerLinks.map((column) => (
        <div key={column.title}>
          <h4 className="mb-6 text-[22px] font-medium text-white">
            {column.title}
          </h4>

          <ul className="space-y-4">
            {column.links.map((link) => (
              <li key={link.label}>
                {link.to ? (
                  <Link
                    to={link.to}
                    className="cursor-pointer text-base text-white transition hover:text-[#D4B483]"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <span className="cursor-pointer text-base text-white transition hover:text-[#D4B483]">
                    {link.label}
                  </span>
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
