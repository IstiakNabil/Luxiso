import sustainabilityImage from "@/assets/images/sustainability/sustainability.jpg";
import { getMediaUrl } from "@/lib/utils";
import Container from "@/components/layout/Container";
import SustainabilityCard from "./SustainabilityCard";
import { useSiteBanners } from "../hooks/useSiteBanners";

function SustainabilitySection() {
  const { data: banners } = useSiteBanners();
  const banner = banners?.find((b) => b.key === "sustainability");
  const imageUrl =
    (banner?.image ? getMediaUrl(banner.image) : null) ??
    sustainabilityImage;

  return (
    <section className="mt-24">
  <Container className="px-0">
      <div
        className="flex h-[430px] items-center justify-end bg-cover bg-center pr-[120px]"
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
      >
        <SustainabilityCard />
      </div>
      </Container>
    </section>
  );
}

export default SustainabilitySection;