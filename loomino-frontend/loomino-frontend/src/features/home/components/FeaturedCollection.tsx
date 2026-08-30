import Container from "@/components/layout/Container";

function FeaturedCollection() {
  return (
    <section className="bg-[#F0E6D8] py-12 lg:py-20">
      <Container className="text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#9A8564]">
          Featured Collection
        </p>

        <h2 className="text-[26px] font-medium text-[#2D2A26] lg:text-[40px]">
          Timeless Pieces, Thoughtfully Made.
        </h2>

        <div className="mt-6 flex items-center justify-center gap-4 lg:mt-8">
          <div className="h-px w-24 bg-[#D4B483]" />

          <span className="text-xl text-[#D4B483]">
            ✦
          </span>

          <div className="h-px w-24 bg-[#D4B483]" />
        </div>
      </Container>
    </section>
  );
}

export default FeaturedCollection;