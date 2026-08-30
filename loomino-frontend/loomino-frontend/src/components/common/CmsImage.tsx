import { getMediaUrl } from "@/lib/utils";
import ImagePlaceholder from "@/features/sustainability/components/ImagePlaceholder";
import { useSiteBanners } from "@/features/home/hooks/useSiteBanners";

interface CmsImageProps {
  /** The SiteBanner key managed in CMS > Site Banners. */
  bannerKey: string;
  /** Shown as the placeholder label until an admin uploads an image. */
  label: string;
  className?: string;
  alt?: string;
}

/**
 * Renders the image an admin has uploaded for this slot (CMS >
 * Site Banners), or the same gray placeholder box as before if
 * nothing has been uploaded yet — so pages never look broken,
 * they just look exactly like they did pre-CMS until someone
 * fills the slot in.
 */
function CmsImage({
  bannerKey,
  label,
  className = "",
  alt,
}: CmsImageProps) {
  const { data: banners } = useSiteBanners();
  const banner = banners?.find((b) => b.key === bannerKey);
  const imageUrl = banner?.image
    ? getMediaUrl(banner.image)
    : null;

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt ?? label}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <ImagePlaceholder label={label} className={className} />
  );
}

export default CmsImage;
