interface ProductDescriptionCardProps {
  description: string;
}

function ProductDescriptionCard({
  description,
}: ProductDescriptionCardProps) {
  return (
    <div className="w-full border border-[#CBCBCB] bg-white">
      <div className="border-b border-[#CBCBCB] px-5 py-4">
        <h3 className="text-[20px] font-semibold text-[#0C0C0C]">
          Product Detail
        </h3>
      </div>

      <div className="space-y-6 p-5">
        <p className="whitespace-pre-line text-[15px] leading-[1.8] text-[#606060]">
          {description}
        </p>

        <div className="flex flex-wrap gap-3">
          {["Quick Dry", "Chemical Free", "Machine Washable"].map(
            (tag) => (
              <span
                key={tag}
                className="border border-[#CBCBCB] px-4 py-2 text-[14px] text-[#0C0C0C]"
              >
                {tag}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDescriptionCard;
