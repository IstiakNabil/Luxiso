import {
  FaInstagram,
  FaFacebookF,
  FaPinterestP,
  FaTiktok,
} from "react-icons/fa";

function SocialLinks() {
  return (
    <div className="mt-10 flex items-center gap-5">
      <button className="transition hover:opacity-70">
        <FaInstagram size={22} color="white" />
      </button>

      <button className="transition hover:opacity-70">
        <FaFacebookF size={22} color="white" />
      </button>

      <button className="transition hover:opacity-70">
        <FaPinterestP size={22} color="white" />
      </button>

      <button className="transition hover:opacity-70">
        <FaTiktok size={22} color="white" />
      </button>
    </div>
  );
}

export default SocialLinks;