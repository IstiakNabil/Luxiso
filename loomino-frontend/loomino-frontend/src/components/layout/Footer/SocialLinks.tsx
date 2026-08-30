import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import type { IconType } from "react-icons";

import { useSiteSettings } from "@/hooks/useSiteSettings";

/**
 * Footer social icons. Each icon is driven by its URL from
 * Site Settings and is only rendered if that URL is set — a
 * blank field in the admin hides the icon entirely.
 */
function SocialLinks() {
  const { data: settings } = useSiteSettings();

  const links: { url: string | undefined; Icon: IconType; label: string }[] = [
    {
      url: settings?.instagram_url,
      Icon: FaInstagram,
      label: "Instagram",
    },
    {
      url: settings?.facebook_url,
      Icon: FaFacebookF,
      label: "Facebook",
    },
    {
      url: settings?.twitter_url,
      Icon: FaXTwitter,
      label: "Twitter",
    },
    {
      url: settings?.youtube_url,
      Icon: FaYoutube,
      label: "YouTube",
    },
    {
      url: settings?.linkedin_url,
      Icon: FaLinkedinIn,
      label: "LinkedIn",
    },
  ];

  const active = links.filter((l) => l.url && l.url.trim() !== "");

  if (active.length === 0) return null;

  return (
    <div className="mt-10 flex items-center gap-5">
      {active.map(({ url, Icon, label }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="transition hover:opacity-70"
        >
          <Icon size={22} color="white" />
        </a>
      ))}
    </div>
  );
}

export default SocialLinks;
