import { useRef, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Upload,
  Trash2,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import {
  listProductImages,
  uploadProductImage,
  updateProductImage,
  deleteProductImage,
} from "../services/media.service";
import {
  IMAGE_TYPES,
  type AdminProductImage,
} from "../types/commerce";

interface ProductImageManagerProps {
  productId: number;
}

/**
 * Upload / retype / reorder / delete images for a product.
 * Backed by /products/images/admin/ (multipart upload).
 */
function ProductImageManager({
  productId,
}: ProductImageManagerProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const queryKey = ["admin", "product-images", productId];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => listProductImages(productId),
  });

  const images = data ?? [];
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey });

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (list.length === 0) return;

    setUploading(true);
    try {
      let order = images.length;
      for (const file of list) {
        await uploadProductImage({
          product: productId,
          file,
          // First image of a product defaults to the cover.
          image_type:
            images.length === 0 && order === 0
              ? "cover"
              : "gallery",
          display_order: order,
        });
        order += 1;
      }
      invalidate();
      toast.success(
        list.length === 1
          ? "Image uploaded."
          : `${list.length} images uploaded.`,
      );
    } catch (e) {
      toast.error(
        getApiErrorMessage(e, "Couldn't upload image."),
      );
    } finally {
      setUploading(false);
    }
  };

  const retype = useMutation({
    mutationFn: ({
      id,
      image_type,
    }: {
      id: number;
      image_type: string;
    }) => updateProductImage(id, { image_type }),
    onSuccess: () => {
      invalidate();
      toast.success("Image updated.");
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Couldn't update.")),
  });

  const reorder = useMutation({
    mutationFn: ({
      id,
      display_order,
    }: {
      id: number;
      display_order: number;
    }) => updateProductImage(id, { display_order }),
    onSuccess: invalidate,
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't reorder."),
      ),
  });

  const remove = useMutation({
    mutationFn: deleteProductImage,
    onSuccess: () => {
      invalidate();
      toast.success("Image deleted.");
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Couldn't delete.")),
  });

  const move = (img: AdminProductImage, dir: -1 | 1) => {
    const idx = images.findIndex((i) => i.id === img.id);
    const target = images[idx + dir];
    if (!target) return;
    reorder.mutate({
      id: img.id,
      display_order: target.display_order,
    });
    reorder.mutate({
      id: target.id,
      display_order: img.display_order,
    });
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void upload(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 transition ${
          dragOver
            ? "border-[#A88548] bg-[#FBF6EC]"
            : "border-[#DDD3C0] bg-[#FBF8F2] hover:border-[#A88548]"
        }`}
      >
        {uploading ? (
          <Loader2
            size={22}
            className="animate-spin text-[#A88548]"
          />
        ) : (
          <Upload size={22} className="text-[#A88548]" />
        )}
        <p className="mt-2 text-[13px] font-medium text-[#3A2E1B]">
          {uploading
            ? "Uploading…"
            : "Drop images here, or click to browse"}
        </p>
        <p className="text-[12px] text-[#A89A80]">
          You can select multiple files
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void upload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Existing images */}
      <div className="mt-4">
        {isLoading && (
          <p className="py-4 text-center text-[13px] text-[#A89A80]">
            Loading images…
          </p>
        )}

        {!isLoading && images.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-4 text-[13px] text-[#A89A80]">
            <ImageIcon size={15} />
            No images yet.
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="overflow-hidden rounded-lg border border-[#E4DACA] bg-white"
            >
              <div className="relative h-[110px] bg-[#F4EFE5]">
                {img.image_url && (
                  <img
                    src={img.image_url}
                    alt={img.product_name}
                    className="h-full w-full object-cover"
                  />
                )}
                <button
                  type="button"
                  aria-label="Delete image"
                  onClick={() => remove.mutate(img.id)}
                  className="absolute right-1.5 top-1.5 rounded-md bg-white/90 p-1.5 text-[#9A3B3B] hover:bg-white"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="p-2">
                <select
                  value={img.image_type}
                  onChange={(e) =>
                    retype.mutate({
                      id: img.id,
                      image_type: e.target.value,
                    })
                  }
                  className="mb-1.5 h-[30px] w-full rounded-md border border-[#DDD3C0] px-1.5 text-[12px] capitalize outline-none focus:border-[#A88548]"
                >
                  {IMAGE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => move(img, -1)}
                    className="flex-1 rounded-md border border-[#E4DACA] py-1 text-[11px] text-[#6B5E48] disabled:opacity-40"
                  >
                    ← Move
                  </button>
                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => move(img, 1)}
                    className="flex-1 rounded-md border border-[#E4DACA] py-1 text-[11px] text-[#6B5E48] disabled:opacity-40"
                  >
                    Move →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {images.length > 0 && (
          <p className="mt-3 text-[12px] leading-[1.6] text-[#A89A80]">
            <strong>Cover</strong> is the main shop image,{" "}
            <strong>hover</strong> shows on mouse-over, and{" "}
            <strong>gallery</strong> images appear on the
            product page.
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductImageManager;
