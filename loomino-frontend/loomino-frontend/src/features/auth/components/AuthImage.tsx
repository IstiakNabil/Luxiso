import { useSiteBanners } from "@/features/home/hooks/useSiteBanners";
import { getMediaUrl } from "@/lib/utils";

interface AuthImageProps {
  /** Bundled default -- shown until an admin uploads a CMS replacement (CMS > Site Banners > Auth Pages — Side Image). */
  src: string;
}

function AuthImage({ src }: AuthImageProps) {
  const { data: banners } = useSiteBanners();
  const banner = banners?.find((b) => b.key === "auth_image");
  const image = (banner?.image ? getMediaUrl(banner.image) : null) ?? src;

  return (
    <img
      src={image}
      alt="Authentication"
      className="h-full w-full object-cover"
    />
  );
}

export default AuthImage;
