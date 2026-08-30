import { Link } from "react-router-dom";

import sundayImage from "@/assets/images/midweek/sunday.jpg";
import mondayImage from "@/assets/images/midweek/monday.jpg";
import tuesdayImage from "@/assets/images/midweek/tuesday.jpg";
import wednesdayImage from "@/assets/images/midweek/wednesday.jpg";
import thursdayImage from "@/assets/images/midweek/thursday.jpg";

import MidweekCard from "./MidweekCard";

const midweekItems = [
  {
    day: "Sunday",
    image: sundayImage,
  },
  {
    day: "Monday",
    image: mondayImage,
  },
  {
    day: "Tuesday",
    image: tuesdayImage,
  },
  {
    day: "Wednesday",
    image: wednesdayImage,
  },
  {
    day: "Thursday",
    image: thursdayImage,
  },
];

function MidweekSection() {
  return (
    <section className="w-full bg-[#F7F0E5] py-20">
      <div className="mx-auto w-full max-w-[1920px] px-[108px]">
      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-[32px] font-semibold text-[#1E1E1E]">
          Modiweek
        </h2>
        <Link
          to="/modiweek"
          className="text-[15px] font-medium text-[#4C300D] transition hover:underline"
        >
          See All →
        </Link>
      </div>

      <div className="flex gap-6">
        {midweekItems.map((item) => (
          <MidweekCard
            key={item.day}
            day={item.day}
            image={item.image}
          />
        ))}
      </div>
      </div>
    </section>
  );
}

export default MidweekSection;