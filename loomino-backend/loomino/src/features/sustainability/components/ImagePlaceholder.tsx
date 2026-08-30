interface ImagePlaceholderProps {
  label: string;
  className?: string;
}

/**
 * Stand-in for a Figma-hosted image that isn't part of the
 * project yet. Replace with a real <img> once assets are added.
 */
function ImagePlaceholder({
  label,
  className = "",
}: ImagePlaceholderProps) {
  return (
    <div
      className={`flex items-center justify-center bg-[#D9CFBB] text-[13px] uppercase tracking-[1px] text-[#8B7A5C] ${className}`}
    >
      {label}
    </div>
  );
}

export default ImagePlaceholder;
