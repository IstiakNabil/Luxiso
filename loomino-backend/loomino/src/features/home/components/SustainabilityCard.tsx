import { Link } from "react-router-dom";

function SustainabilityCard() {
  return (
    <div className="w-[430px] rounded-md bg-white px-10 py-8 shadow-md">
      <h3 className="mx-auto max-w-[320px] text-center text-[22px] leading-[1.8] text-[#2D2A26]">
        Stylish Sustainability In Clothing Promotes Eco
        <br />
        Friendly Choices For A Greater Future
      </h3>

      <div className="mt-10 flex justify-center">
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
