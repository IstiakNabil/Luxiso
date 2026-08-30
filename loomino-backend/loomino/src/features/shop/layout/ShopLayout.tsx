import Container from "@/components/layout/Container";

interface ShopLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

function ShopLayout({
  sidebar,
  children,
}: ShopLayoutProps) {
  return (
    <section className="py-16">
      <Container>
        <div className="flex items-start gap-6">
          {/* Sidebar */}
          <aside className="w-[392px] flex-shrink-0">
            {sidebar}
          </aside>

          {/* Products */}
          <main className="w-[808px]">
            {children}
          </main>
        </div>
      </Container>
    </section>
  );
}

export default ShopLayout;