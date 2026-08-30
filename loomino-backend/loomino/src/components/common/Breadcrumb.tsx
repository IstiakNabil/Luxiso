import { Fragment } from "react";
import { Link } from "react-router-dom";

export interface Crumb {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: Crumb[];
}

/**
 * Breadcrumb matching the Figma pattern: brown (#4C300D)
 * links, #606060 slash separators, black active item,
 * Montserrat, capitalize.
 */
function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Fragment key={`${item.label}-${index}`}>
            <div className="px-4 py-1">
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="text-[18px] capitalize leading-[1.8] text-[#4C300D] hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`text-[18px] capitalize leading-[1.8] ${
                    isLast
                      ? "text-[#0C0C0C]"
                      : "text-[#4C300D]"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </div>

            {!isLast && (
              <span className="px-2 text-[18px] text-[#606060]">
                /
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
