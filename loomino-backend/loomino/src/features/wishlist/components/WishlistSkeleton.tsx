function CardSkeleton() {
  return (
    <div>
      <div className="h-[438px] w-full animate-pulse bg-[#E4DACA]" />
      <div className="mt-4 space-y-3 px-2">
        <div className="h-4 w-2/3 animate-pulse bg-[#E4DACA]" />
        <div className="h-4 w-1/2 animate-pulse bg-[#E4DACA]" />
      </div>
    </div>
  );
}

function WishlistSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Loading wishlist"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export default WishlistSkeleton;
