function CartTableHeader() {
  return (
    <div className="mt-[72px] hidden border-b border-[#DCD3C3] pb-4 md:block">
      <div className="grid grid-cols-[minmax(0,1fr)_140px_180px_140px] items-center">
        <h2 className="text-[22px] font-medium">
          Order Summary
        </h2>

        <p className="text-center text-[18px]">Price</p>

        <p className="text-center text-[18px]">Quantity</p>

        <p className="text-right text-[18px]">Total</p>
      </div>
    </div>
  );
}

export default CartTableHeader;
