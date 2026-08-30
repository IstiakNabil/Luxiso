function CartItemSkeleton() {
  return (
    <div className="border-b border-[#DCD3C3] py-8">
      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,1fr)_140px_180px_140px]">
        <div className="flex items-start gap-6">
          <div className="h-[160px] w-[140px] animate-pulse bg-[#E4DACA]" />

          <div className="flex-1 space-y-4 pt-2">
            <div className="h-5 w-2/5 animate-pulse bg-[#E4DACA]" />
            <div className="h-4 w-1/4 animate-pulse bg-[#E4DACA]" />
            <div className="h-4 w-1/3 animate-pulse bg-[#E4DACA]" />
          </div>
        </div>

        <div className="mx-auto hidden h-5 w-16 animate-pulse bg-[#E4DACA] md:block" />
        <div className="mx-auto hidden h-9 w-20 animate-pulse bg-[#E4DACA] md:block" />
        <div className="ml-auto hidden h-5 w-16 animate-pulse bg-[#E4DACA] md:block" />
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading cart">
      <CartItemSkeleton />
      <CartItemSkeleton />
      <CartItemSkeleton />
    </div>
  );
}

export default CartSkeleton;
