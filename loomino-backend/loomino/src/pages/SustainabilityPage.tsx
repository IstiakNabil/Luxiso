import Breadcrumb from "@/components/common/Breadcrumb";
import CmsImage from "@/components/common/CmsImage";
import {
  SUSTAINABILITY_INTRO,
  MISSIONS,
  PILLARS,
  SUPPLIERS_QUOTE,
  CLOSING_STATEMENT,
} from "@/features/sustainability/content";

// Maps each PILLARS label to its CMS > Site Banners key.
const PILLAR_BANNER_KEYS: Record<string, string> = {
  Processing: "sustainability_processing",
  Materials: "sustainability_materials",
  Packaging: "sustainability_packaging",
  "Product Caring": "sustainability_product_caring",
};

function SustainabilityPage() {
  return (
    <div className="font-loomino bg-[#F0E6D8]">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1920px] px-6 pt-[32px] md:px-[108px]">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "Sustainability" },
            { label: "Mission" },
          ]}
        />
      </div>

      {/* Hero */}
      <div className="relative mt-6 h-[420px] w-full overflow-hidden md:h-[600px]">
        <CmsImage
          bannerKey="sustainability_hero"
          label="Sustainability hero image"
          className="h-full w-full"
        />
        <div className="absolute inset-0 flex items-end justify-center bg-black/25 pb-12">
          <p className="px-6 text-center text-[28px] font-bold capitalize leading-[1.4] text-[#F0E6D8] md:text-[40px]">
            {SUSTAINABILITY_INTRO.heroTagline}
          </p>
        </div>
      </div>

      {/* Intro */}
      <section className="mx-auto max-w-[1224px] px-6 py-[64px] text-center md:px-[108px]">
        <h1 className="text-[28px] font-semibold capitalize leading-[1.4] text-[#0C0C0C] md:text-[32px]">
          {SUSTAINABILITY_INTRO.heading}
        </h1>
        <p className="mx-auto mt-8 max-w-[1000px] text-[18px] leading-[1.8] text-[#0C0C0C] md:text-[20px]">
          {SUSTAINABILITY_INTRO.lead}
        </p>
        <p className="mx-auto mt-8 max-w-[1224px] text-left text-[18px] leading-[1.8] text-[#0C0C0C] md:text-[20px]">
          {SUSTAINABILITY_INTRO.body}
        </p>
      </section>

      {/* Mission — "The Loomino Six" */}
      <section className="mx-auto max-w-[1224px] px-6 pb-[64px] md:px-[108px]">
        <h2 className="text-[24px] font-bold capitalize leading-[1.4] text-[#0C0C0C]">
          Our Mission, The Loomino Six:
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2">
          {MISSIONS.map((mission) => (
            <div key={mission.title}>
              <h3 className="text-[20px] font-bold capitalize leading-[1.4] text-[#0C0C0C]">
                {mission.title}
              </h3>
              <p className="mt-4 text-[18px] leading-[1.8] text-[#0C0C0C]">
                {mission.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pillar tiles */}
      <section className="mx-auto max-w-[1224px] px-6 pb-[64px] md:px-[108px]">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {PILLARS.map((pillar) => (
            <div key={pillar} className="flex flex-col gap-4">
              <CmsImage
                bannerKey={PILLAR_BANNER_KEYS[pillar]}
                label={`${pillar} image`}
                className="h-[360px] w-full"
              />
              <button
                type="button"
                className="h-[48px] w-full bg-[#4C300D] text-[16px] capitalize text-[#F0E6D8] transition hover:opacity-90"
              >
                {pillar}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Suppliers quote */}
      <section className="mx-auto max-w-[1224px] px-6 pb-[48px] md:px-[108px]">
        <p className="text-[18px] italic leading-[1.8] text-[#0C0C0C] md:text-[20px]">
          {SUPPLIERS_QUOTE}
        </p>
      </section>

      {/* People Beyond Us */}
      <section className="mx-auto max-w-[1224px] px-6 pb-[48px] md:px-[108px]">
        <h2 className="text-[24px] font-bold capitalize leading-[1.4] text-[#0C0C0C]">
          People Beyond Us
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          <CmsImage
            bannerKey="sustainability_team_1"
            label="Team 1"
            className="h-[243px]"
          />
          <CmsImage
            bannerKey="sustainability_team_2"
            label="Team 2"
            className="h-[243px]"
          />
          <CmsImage
            bannerKey="sustainability_team_3"
            label="Team 3"
            className="col-span-2 h-[243px]"
          />
          <CmsImage
            bannerKey="sustainability_team_4"
            label="Team 4"
            className="col-span-2 h-[283px]"
          />
          <CmsImage
            bannerKey="sustainability_team_5"
            label="Team 5"
            className="h-[283px]"
          />
          <CmsImage
            bannerKey="sustainability_team_6"
            label="Team 6"
            className="h-[283px]"
          />
        </div>

        <button
          type="button"
          className="mx-auto mt-10 flex h-[48px] w-full max-w-[600px] items-center justify-center bg-[#4C300D] text-[16px] capitalize text-[#F0E6D8] transition hover:opacity-90"
        >
          Our Suppliers
        </button>
      </section>

      {/* Closing */}
      <section className="mx-auto max-w-[1224px] px-6 pb-[80px] md:px-[108px]">
        <p className="text-[18px] leading-[1.8] text-[#0C0C0C] md:text-[20px]">
          {CLOSING_STATEMENT}
        </p>
      </section>
    </div>
  );
}

export default SustainabilityPage;
