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
    <div className="flex h-[512px] w-full items-start">
  {/* Thumbnail Viewport */}
  <div
    ref={thumbnailContainerRef}
    className="h-[512px] w-[125px] overflow-y-auto scrollbar-hide"
  >
    <div className="flex flex-col gap-4">
      {images.map((image, index) => (
        <button
          key={image.id}
          type="button"
          onClick={() => setSelectedImage(index)}
          className={`h-[160px] w-[125px] shrink-0 overflow-hidden transition ${
            selectedImage === index
              ? "ring-2 ring-[#4C300D]"
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
  <div className="h-[512px] w-[459px] overflow-hidden">
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