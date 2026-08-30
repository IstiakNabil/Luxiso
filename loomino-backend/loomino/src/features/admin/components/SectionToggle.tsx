interface SectionToggleProps {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

/**
 * A storefront-section toggle (New In / Featured / Modiweek /
 * Active). The hint explains exactly where the product will
 * appear so admins know what each flag does.
 */
function SectionToggle({
  label,
  hint,
  checked,
  onChange,
}: SectionToggleProps) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
        checked
          ? "border-[#A88548] bg-[#FBF6EC]"
          : "border-[#E4DACA] bg-white hover:bg-[#FBF8F2]"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-[#A88548]"
      />
      <span>
        <span className="block text-[13px] font-semibold text-[#2C2418]">
          {label}
        </span>
        <span className="block text-[12px] leading-[1.5] text-[#8A7C64]">
          {hint}
        </span>
      </span>
    </label>
  );
}

export default SectionToggle;
