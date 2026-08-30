import { Minus, Plus } from "lucide-react";

interface CartQuantitySelectorProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  disabled?: boolean;
}

function CartQuantitySelector({
  quantity,
  onDecrease,
  onIncrease,
  disabled = false,
}: CartQuantitySelectorProps) {
  return (
    <div className="flex h-[36px] w-[80px] items-center justify-between bg-[#DCE0CD] px-2.5">
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled || quantity <= 1}
        aria-label="Decrease quantity"
        className="text-[#5B3A0E] transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus size={14} strokeWidth={2.5} />
      </button>

      <span className="text-[15px] font-medium">
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled}
        aria-label="Increase quantity"
        className="text-[#5B3A0E] transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export default CartQuantitySelector;
