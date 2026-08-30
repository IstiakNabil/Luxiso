import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

import { useWishlist } from "@/features/wishlist/hooks/useWishlist";
import WishlistCard from "@/features/wishlist/components/WishlistCard";
import WishlistSkeleton from "@/features/wishlist/components/WishlistSkeleton";

function WishlistPage() {
  const { data, isLoading, isError } = useWishlist();

  const count = data?.length ?? 0;

  return (
    <div className="font-loomino min-h-[calc(100vh-110px)] bg-[#F0E6D8]">
      <div className="mx-auto max-w-[1224px] px-6 py-[56px] md:px-[108px]">
        {/* Header (centered, per design) */}
        <div className="text-center">
          <h1 className="text-[20px] font-bold capitalize text-[#0C0C0C]">
            My Wish List
          </h1>
          {!isLoading && !isError && (
            <p className="mt-2 text-[16px] text-[#0C0C0C]">
              {count} {count === 1 ? "item" : "items"}
            </p>
          )}
        </div>

        <div className="mt-12">
          {isLoading && <WishlistSkeleton />}

          {isError && (
            <p className="py-16 text-center text-[17px] text-[#606060]">
              We couldn't load your wishlist. Please try
              again.
            </p>
          )}

          {data && data.length === 0 && (
            <div className="flex flex-col items-center py-[80px] text-center">
              <Heart
                size={64}
                strokeWidth={1.2}
                className="text-[#B39A73]"
              />
              <h2 className="mt-8 text-[24px] font-bold text-[#0C0C0C]">
                Your Wish List Is Empty
              </h2>
              <p className="mt-3 max-w-[380px] text-[16px] leading-[1.8] text-[#606060]">
                Save the pieces you love and find them all
                here.
              </p>
              <Link
                to="/shop"
                className="mt-8 inline-flex h-[48px] w-[220px] items-center justify-center bg-[#343E32] text-[14px] text-white transition hover:opacity-90"
              >
                Explore Collection
              </Link>
            </div>
          )}

          {data && data.length > 0 && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((item) => (
                <WishlistCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WishlistPage;
