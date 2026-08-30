/**
 * Thin promo strip above the navbar. Mobile matches the
 * Figma header strip (16px tall, 10px text); desktop keeps
 * the roomier original sizing.
 */
function AnnouncementBar() {
  return (
    <div className="flex h-4 items-center justify-center bg-black text-center text-[10px] font-medium leading-[1.4] text-white lg:h-auto lg:py-3 lg:text-sm">
      Enjoy Free Shipping On All Orders
    </div>
  );
}

export default AnnouncementBar;
