import { useRef, useState } from "react";
import type { ProductImage } from "@/types/product";

interface ProductGalleryProps {
  images: ProductImage[];
}

function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
    const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const activeImage =
    images[selectedImage] ?? images[0];

  return (
    <div className="flex h-auto w-full flex-col-reverse items-start gap-4 lg:h-[512px] lg:flex-row lg:gap-0">
  {/* Thumbnail Viewport */}
  <div
    ref={thumbnailContainerRef}
    className="w-full overflow-x-auto scrollbar-hide lg:h-[512px] lg:w-[125px] lg:overflow-y-auto"
  >
    <div className="flex flex-row gap-4 lg:flex-col">
      {images.map((image, index) => (
        <button
          key={image.id}
          type="button"
          onClick={() => setSelectedImage(index)}
          className={`h-[160px] w-[125px] shrink-0 overflow-hidden transition ${
            selectedImage === index
              ? "ring-2 ring-[#8A6A2E]"
              : "ring-1 ring-transparent"
          }`}
        >
          <img
            src={image.image}
            alt={`Product ${index + 1}`}
            className="h-full w-full object-cover"
          />
        </button>
      ))}
    </div>
  </div>

  {/* 16px Gap */}
  <div className="w-4 shrink-0" />

  {/* Main Image */}
  <div className="aspect-[459/512] w-full overflow-hidden lg:h-[512px] lg:w-[459px]">
    <img
      src={activeImage?.image}
      alt={activeImage?.image_type ?? "Product"}
      className="h-full w-full object-cover"
    />
  </div>
</div>
  );
}

export default ProductGallery;