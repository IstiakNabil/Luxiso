import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import Container from "@/components/layout/Container";

function Breadcrumb() {
  return (
    <section className="bg-[#F0E6D8] py-6">
      <Container>
        <div className="flex items-center gap-3 text-sm">
          <Link
            to="/"
            className="text-[#5B5B5B] transition hover:text-black"
          >
            Home
          </Link>

          <ChevronRight
            size={16}
            className="text-[#7B7B7B]"
          />

          <span className="font-medium text-[#1E1E1E]">
            Shop All
          </span>
        </div>
      </Container>
    </section>
  );
}

export default Breadcrumb;