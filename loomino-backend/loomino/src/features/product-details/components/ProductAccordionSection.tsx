import type { ProductDetail } from "@/types/product";
import { useState } from "react";
import ProductAccordion from "./ProductAccordion";


interface ProductAccordionSectionProps {
  product: ProductDetail;
}

type AccordionSection =
  | "fitting"
  | "fabric"
  | "detail"
  | "shipping";

function ProductAccordionSection({
  product,
}: ProductAccordionSectionProps) {


    const [openSection, setOpenSection] =
  useState<AccordionSection>("fabric");
  return (
    <div className="w-full">
      {/* Left Side */}
      <div className="w-full">
        <ProductAccordion
  title="Fitting"
  content={product.fitting}
  isOpen={openSection === "fitting"}
  onToggle={() => setOpenSection("fitting")}
/>

        <ProductAccordion
  title="Fabric & Care"
  content={product.fabric_and_care}
  isOpen={openSection === "fabric"}
  onToggle={() => setOpenSection("fabric")}
/>

        <ProductAccordion
  title="Product Detail"
  content={product.description}
  isOpen={openSection === "detail"}
  onToggle={() => setOpenSection("detail")}
/>

        <ProductAccordion
  title="Shipping & Return"
  content={product.shipping_and_return}
  isOpen={openSection === "shipping"}
  onToggle={() => setOpenSection("shipping")}
/>
      </div>

      {/* Right Side */}
      
    </div>
  );
}

export default ProductAccordionSection;