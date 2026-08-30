function OrderCardSkeleton() {
  return (
    <div className="border border-[#CBCBCB] bg-[#F0F2EF] p-6">
      <div className="flex justify-between">
        <div className="space-y-3">
          <div className="h-3 w-16 animate-pulse bg-[#E1DACB]" />
          <div className="h-5 w-40 animate-pulse bg-[#E1DACB]" />
          <div className="h-4 w-32 animate-pulse bg-[#E1DACB]" />
        </div>
        <div className="space-y-3">
          <div className="h-6 w-24 animate-pulse bg-[#E1DACB]" />
          <div className="ml-auto h-6 w-20 animate-pulse bg-[#E1DACB]" />
        </div>
      </div>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div
      className="space-y-4"
      aria-busy="true"
      aria-label="Loading orders"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default OrdersSkeleton;
