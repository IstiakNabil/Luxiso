import kurtiImage from "@/assets/images/collection/kurti.jpg";
import sareeImage from "@/assets/images/collection/saree.jpg";
import shrugsImage from "@/assets/images/collection/shrugs.jpg";
import kameezImage from "@/assets/images/collection/kameez.jpg";

import { getMediaUrl } from "@/lib/utils";
import Container from "@/components/layout/Container";
import CollectionTile from "./CollectionTile";
import { useSiteBanners } from "../hooks/useSiteBanners";

/**
 * Collection section, matching the Figma frame (node 1:2680)
 * proportions: two equal-width fluid columns (each tile keeps
 * its Figma aspect ratio via CollectionTile) so their bottoms
 * align at any container width. The tall-then-short column
 * (Kurti/Shrugs) uses a 144px gap; the short-then-tall column
 * (Saree/Kameez) uses a 64px gap — different gaps by design,
 * not a shared constant, since the tile heights themselves
 * differ per column. Category button placement alternates per
 * the design.
 *
 * Each tile image comes from the admin-managed Site Banners
 * (CMS > Site Banners), falling back to the bundled default
 * photo until an admin uploads a replacement.
 */
function CollectionSection() {
  const { data: banners } = useSiteBanners();

  const imageFor = (key: string, fallback: string) => {
    const banner = banners?.find((b) => b.key === key);
    return (banner?.image ? getMediaUrl(banner.image) : null) ?? fallback;
  };

  return (
    <section className="w-full bg-[#F7F0E5] py-20">
      <Container>
        <h2 className="mb-10 text-[32px] font-semibold text-[#0C0C0C]">
          Collection
        </h2>

        <div className="flex gap-6">
          {/* Left column — tall then short. The 144px gap is a
              spacer (not Tailwind `gap`) so it scales with the
              column width via aspect-ratio, same as the tiles —
              otherwise a fixed-px gap would throw the two
              columns' totals out of sync at widths other than
              600px. */}
          <div className="flex flex-1 flex-col">
            <CollectionTile
              title="Kurti"
              image={imageFor("collection_kurti", kurtiImage)}
              height={840}
              to="/shop?category=kurti"
              buttonAlign="left"
            />
            <div
              aria-hidden
              className="w-full"
              style={{ aspectRatio: "600 / 144" }}
            />
            <CollectionTile
              title="Shrugs"
              image={imageFor("collection_shrugs", shrugsImage)}
              height={435}
              to="/shop?category=shrugs"
              buttonAlign="right"
              buttonBottom={13}
            />
          </div>

          {/* Right column — short then tall (64px scaling gap) */}
          <div className="flex flex-1 flex-col">
            <CollectionTile
              title="Saree"
              image={imageFor("collection_saree", sareeImage)}
              height={518}
              to="/shop?category=saree"
              buttonAlign="right"
            />
            <div
              aria-hidden
              className="w-full"
              style={{ aspectRatio: "600 / 64" }}
            />
            <CollectionTile
              title="Kameez"
              image={imageFor("collection_kameez", kameezImage)}
              height={837}
              to="/shop?category=kameez"
              buttonAlign="right"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

export default CollectionSection;
