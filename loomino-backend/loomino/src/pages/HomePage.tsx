
import BestSellers from "@/features/home/components/BestSellers";
import HeroSection from "@/features/home/components/HeroSection";
import FeaturedCollection from "@/features/home/components/FeaturedCollection";
import CollectionSection from "@/features/home/components/CollectionSection";
import MidweekSection from "@/features/home/components/MidweekSection";
import SustainabilitySection from "@/features/home/components/SustainabilitySection";
import CommunitySection from "@/features/home/components/CommunitySection";

function HomePage() {
return (
  <>
    <HeroSection />
    <FeaturedCollection />
    <BestSellers />
    <CollectionSection />
    <MidweekSection />
    <SustainabilitySection />
    <CommunitySection />
  </>
);
}

export default HomePage;