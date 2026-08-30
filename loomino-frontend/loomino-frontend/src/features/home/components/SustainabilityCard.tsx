import { Link } from "react-router-dom";

function SustainabilityCard() {
  return (
    <div className="w-full max-w-[430px] rounded-md bg-white px-6 py-6 shadow-md lg:px-10 lg:py-8">
      <h3 className="mx-auto max-w-[320px] text-center text-[16px] leading-[1.8] text-[#2D2A26] lg:text-[22px]">
        Stylish Sustainability In Clothing Promotes Eco
        <br />
        Friendly Choices For A Greater Future
      </h3>

      <div className="mt-6 flex justify-center lg:mt-10">
        <Link
          to="/sustainability"
          className="inline-flex items-center bg-[#2D2A26] px-6 py-2 text-sm text-white transition hover:bg-black"
        >
          Sustainability
        </Link>
      </div>
    </div>
  );
}

export default SustainabilityCard;
