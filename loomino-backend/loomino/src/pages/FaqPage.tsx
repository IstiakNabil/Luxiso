import { useState } from "react";

import Breadcrumb from "@/components/common/Breadcrumb";
import { FAQ_ITEMS } from "@/features/faq/faqData";
import FaqAccordionItem from "@/features/faq/components/FaqAccordionItem";

function FaqPage() {
  // First item open by default, matching the Figma frame.
  const [openIndex, setOpenIndex] = useState<number | null>(
    0,
  );

  return (
    <div className="font-loomino min-h-[calc(100vh-110px)] bg-[#F0E6D8]">
      <div className="mx-auto max-w-[1920px] px-6 pt-[32px] md:px-[108px]">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "FAQs" },
          ]}
        />
      </div>

      <div className="mx-auto max-w-[1920px] px-6 pb-[80px] md:px-[108px]">
        <h1 className="text-[32px] font-semibold capitalize leading-[1.4] text-[#0C0C0C]">
          FAQs
        </h1>

        <div className="mx-auto mt-8 w-full max-w-[1016px]">
          {FAQ_ITEMS.map((item, index) => (
            <FaqAccordionItem
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex(
                  openIndex === index ? null : index,
                )
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default FaqPage;
