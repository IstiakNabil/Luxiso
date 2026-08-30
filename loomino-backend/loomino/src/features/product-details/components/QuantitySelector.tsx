import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  disabled?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
}

function QuantitySelector({
  quantity,
  maxQuantity,
   disabled = false,
  onDecrease,
  onIncrease,
}: QuantitySelectorProps) {
  return (
    <div className="mt-6">
      <p className="mb-3 text-[16px] font-medium text-[#0C0C0C]">Quantity</p>

      <div className="flex h-10 w-[140px] items-center border border-[#CBCBCB]">
        <button
          type="button"
          onClick={onDecrease}
          disabled={disabled || quantity === 1}
          className="flex h-full w-10 items-center justify-center border-r border-[#CBCBCB] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus size={16} />
        </button>

        <div className="flex flex-1 items-center justify-center text-[16px] font-medium">
          {quantity}
        </div>

        <button
          type="button"
          onClick={onIncrease}
          disabled={disabled || quantity >= maxQuantity}
          className="flex h-full w-10 items-center justify-center border-l border-[#CBCBCB] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default QuantitySelector;