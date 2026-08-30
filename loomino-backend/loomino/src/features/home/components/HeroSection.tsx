import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMediaUrl } from "@/lib/utils";
import fallbackHeroImage from "@/assets/images/hero/hero-banner.jpg";
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

const ROTATE_MS = 6000;

function HeroSection() {
  const { data: banners } = useSiteBanners();
  const [index, setIndex] = useState(0);

  const slideImages = HERO_SLIDE_KEYS.map((key) => {
    const banner = banners?.find((b) => b.key === key);
    return (
      (banner?.image ? getMediaUrl(banner.image) : null) ??
      fallbackHeroImage
    );
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slideImages.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [slideImages.length]);

  return (
    <section className="font-loomino relative h-[660px] w-full overflow-hidden">
      <div
        className="absolute inset-0 flex h-full w-full transition-transform duration-700 ease-in-out"
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
        <div className="mx-auto flex h-full max-w-[1920px] flex-col justify-center px-[108px]">
          <h1
            className="whitespace-pre-line text-[48px] capitalize leading-[1.37] text-[#F0E6D8]"
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
            className="mt-[27px] flex h-[40px] w-[184px] items-center justify-center gap-1 bg-[#4C300D] p-4 text-[14px] capitalize text-[#F2F2F7] transition hover:opacity-90"
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
