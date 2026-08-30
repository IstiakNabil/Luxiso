import shopHero from "@/assets/images/shop/shop-hero.jpg";

function ShopHero() {
  return (
    <section className="mx-auto max-w-[1920px]">
      <img
        src={shopHero}
        alt="Shop Hero"
        className="h-[665px] w-full object-cover"
      />
    </section>
  );
}

export default ShopHero;