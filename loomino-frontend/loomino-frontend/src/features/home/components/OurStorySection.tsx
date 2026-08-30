import { Link } from "react-router-dom";

import sustainabilityImage from "@/assets/images/sustainability/image.png";
import { getMediaUrl } from "@/lib/utils";
import Container from "@/components/layout/Container";
import { useSiteBanners } from "../hooks/useSiteBanners";

// Placeholder copy — shown until an admin edits the Our Story
// slot in CMS > Site Banners > Homepage. Kept here so the band
// is never empty on a fresh install.
const FALLBACK = {
  eyebrow: "OUR STORY",
  heading: "The Essence\nof Loomino",
  body:
    "We celebrate curated craftsmanship through minimal designs and " +
    "toughtfully curated vibrant tones, made for every modern " +
    "women's festive moments.",
  cta: "Learn More",
};

/**
 * Homepage "Our Story" band. Background image is unchanged
 * (CMS "sustainability" slot, falling back to the bundled
 * photo); the content is a left-aligned editable text block
 * — eyebrow, serif heading, divider, paragraph, and an
 * underlined "Learn More" link — all editable from CMS > Site
 * Banners > Homepage > "Our Story".
 */
function OurStorySection() {
  const { data: banners } = useSiteBanners();

  const bgBanner = banners?.find((b) => b.key === "sustainability");
  const imageUrl =
    (bgBanner?.image ? getMediaUrl(bgBanner.image) : null) ??
    sustainabilityImage;

  const story = banners?.find((b) => b.key === "our_story");
  const eyebrow = story?.eyebrow?.trim() || FALLBACK.eyebrow;
  const heading = story?.heading?.trim() || FALLBACK.heading;
  const body = story?.body?.trim() || FALLBACK.body;
  const cta = story?.cta_label?.trim() || FALLBACK.cta;

  return (
    <section className="mt-12 lg:mt-24">
      <Container className="px-0">
        <div
          className="flex h-[408px] items-center bg-cover bg-center lg:h-[500px]"
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          <div className="w-full max-w-[520px] px-5 md:px-10 lg:pl-[100px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#3A2E1B]">
              {eyebrow}
            </p>

            <h2
              className="mt-4 whitespace-pre-line text-[34px] leading-[1.1] text-[#1E1E1E] lg:text-[46px]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
              }}
            >
              {heading}
            </h2>

            {/* Small decorative divider */}
            <div className="mt-4 flex items-center gap-2 text-[#B89B6E]">
              <span className="h-px w-10 bg-[#B89B6E]" />
              <span className="text-[12px]">✦</span>
            </div>

            <p className="mt-5 max-w-[380px] text-[14px] leading-[1.7] text-[#4A4034] lg:text-[15px]">
              {body}
            </p>

            <Link
              to="/sustainability"
              className="group mt-6 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.15em] text-[#1E1E1E]"
            >
              <span className="border-b-2 border-[#B89B6E] pb-1">
                {cta}
              </span>
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default OurStorySection;
