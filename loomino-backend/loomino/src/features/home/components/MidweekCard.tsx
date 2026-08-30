import { Heart } from "lucide-react";

interface MidweekCardProps {
  day: string;
  image: string;
}

function MidweekCard({
  day,
  image,
}: MidweekCardProps) {
  return (
    <article className="w-full min-w-0 flex-1">
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "288 / 426" }}
      >
        <img
          src={image}
          alt={day}
          className="h-full w-full object-cover"
        />

        <button className="absolute right-4 top-4">
          <Heart size={18} className="stroke-[1.8]" />
        </button>
      </div>

      <p className="mt-4 text-[13px] font-medium text-[#1E1E1E]">
        {day}
      </p>
    </article>
  );
}

export default MidweekCard;