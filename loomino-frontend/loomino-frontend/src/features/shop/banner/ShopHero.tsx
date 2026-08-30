import shopHero from "@/assets/images/shop/image - Copy.png";

import { getMediaUrl } from "@/lib/utils";
import { useSiteBanners } from "@/features/home/hooks/useSiteBanners";

/**
 * Shop All hero banner. Image is managed from CMS > Site
 * Banners > Shop Page:
 *   - "Shop All — Hero Banner" (desktop)
 *   - "Shop All — Hero Banner (Mobile)" — optional; falls
 *     back to the desktop image (then the bundled default)
 *     if not set, so a portrait-heavy desktop photo doesn't
 *     get cropped awkwardly by object-cover on phones.
 */
function ShopHero() {
  const { data: banners } = useSiteBanners();

  const findImage = (key: string) => {
    const banner = banners?.find((b) => b.key === key);
    return banner?.image ? getMediaUrl(banner.image) : null;
  };

  const desktopImage = findImage("shop_hero") ?? shopHero;
  const mobileImage = findImage("shop_hero_mobile") ?? desktopImage;

  return (
    <section className="mx-auto max-w-[1920px]">
      <img
        src={mobileImage}
        alt="Shop Hero"
        className="h-[480px] w-full object-cover lg:hidden"
      />
      <img
        src={desktopImage}
        alt="Shop Hero"
        className="hidden h-[665px] w-full object-cover lg:block"
      />
    </section>
  );
}

export default ShopHero;