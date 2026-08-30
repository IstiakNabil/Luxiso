import { Link } from "react-router-dom";

interface CollectionTileProps {
  title: string;
  image: string;
  /**
   * The tile's height at the original 600px-wide Figma design —
   * used to compute an aspect-ratio so the tile keeps the same
   * proportions when it scales fluidly to a different width.
   */
  height: number;
  /** Destination link (e.g. /shop?category=kurti). */
  to: string;
  /** Horizontal placement of the category button. */
  buttonAlign?: "left" | "right";
  /** Distance in px from the bottom edge (default 16). */
  buttonBottom?: number;
}

/**
 * A single collection image with a white category button
 * overlaid at the bottom. The whole tile links through to the
 * shop with that category's filter pre-applied.
 */
function CollectionTile({
  title,
  image,
  height,
  to,
  buttonAlign = "left",
  buttonBottom = 16,
}: CollectionTileProps) {
  return (
    <Link
      to={to}
      className="group relative block w-full overflow-hidden"
      style={{ aspectRatio: `600 / ${height}` }}
      aria-label={`Shop ${title}`}
    >
      <img
        src={image}
        alt={title}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />

      <div
        className={`absolute ${
          buttonAlign === "right" ? "right-4" : "left-4"
        }`}
        style={{ bottom: buttonBottom }}
      >
        <span className="flex h-[40px] min-w-[160px] items-center justify-center bg-white px-4 text-[14px] capitalize text-[#0C0C0C] transition group-hover:bg-[#4C300D] group-hover:text-white">
          {title}
        </span>
      </div>
    </Link>
  );
}

export default CollectionTile;
