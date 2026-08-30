import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMediaUrl } from "@/lib/utils";
import fallbackHeroImage from "@/assets/images/hero/no-image.png";
import { useSiteBanners } from "../hooks/useSiteBanners";

// The homepage hero always loops through exactly these 3 fixed
// CMS slots (CMS > Site Banners > Homepage). Each falls back to
// the bundled default photo until an admin uploads a
// replacement, so the loop is always "3 slides" even before any
// images are set.
const HERO_SLIDE_KEYS = [
  "hero_slide_1",
  "hero_slide_2",
  "hero_slide_3",
] as const;

// Optional phone-cropped counterpart for each slide (CMS > Site
// Banners > Homepage > "Hero — Slide N (Mobile)"), so admins can
// upload a portrait-friendly crop instead of the desktop photo
// getting cut off by object-cover on narrow screens. Falls back
// to the same slide's desktop image if it hasn't been set.
const HERO_SLIDE_MOBILE_KEYS = [
  "hero_slide_1_mobile",
  "hero_slide_2_mobile",
  "hero_slide_3_mobile",
] as const;

const ROTATE_MS = 6000;

function HeroSection() {
  const { data: banners } = useSiteBanners();
  const [index, setIndex] = useState(0);

  const findImage = (key: string) => {
    const banner = banners?.find((b) => b.key === key);
    return banner?.image ? getMediaUrl(banner.image) : null;
  };

  const slideImages = HERO_SLIDE_KEYS.map(
    (key) => findImage(key) ?? fallbackHeroImage,
  );

  // Each mobile slide falls back to that same slide's desktop
  // image (not the bundled default) if no mobile crop has been
  // uploaded yet, so it never regresses below what's already
  // showing today.
  const mobileSlideImages = HERO_SLIDE_MOBILE_KEYS.map(
    (key, i) => findImage(key) ?? slideImages[i],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slideImages.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [slideImages.length]);

  return (
    <section className="font-loomino relative h-[544px] w-full overflow-hidden lg:h-[660px]">
      {/* Mobile-cropped track */}
      <div
        className="absolute inset-0 flex h-full w-full transition-transform duration-700 ease-in-out lg:hidden"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {mobileSlideImages.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Hero slide ${i + 1}`}
            className="h-full w-full shrink-0 object-cover"
          />
        ))}
      </div>

      {/* Desktop track */}
      <div
        className="absolute inset-0 hidden h-full w-full transition-transform duration-700 ease-in-out lg:flex"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slideImages.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Hero slide ${i + 1}`}
            className="h-full w-full shrink-0 object-cover"
          />
        ))}
      </div>

      <div className="absolute inset-0">
        <div className="mx-auto flex h-full max-w-[1920px] flex-col justify-end px-5 pb-10 md:px-10 lg:justify-center lg:px-[108px] lg:pb-0">
          <h1
            className="whitespace-pre-line text-[32px] capitalize leading-[1.37] text-[#F0E6D8] lg:text-[48px]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
            }}
          >
            Vibrant Heritage
            <br />
            Refined Minimalism
          </h1>

          <Link
            to="/shop?is_new_arrival=true"
            className="mt-6 flex h-[40px] w-[152px] items-center justify-center gap-1 bg-[#5C1626] p-4 text-[14px] capitalize text-[#F2F2F7] transition hover:opacity-90 lg:mt-[27px] lg:w-[184px]"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
          >
            New In
          </Link>

          <div className="mt-8 flex gap-2">
            {slideImages.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index
                    ? "w-6 bg-[#F0E6D8]"
                    : "w-2 bg-[#F0E6D8]/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
