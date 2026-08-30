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
          buttonAlign === "right" ? "right-2 lg:right-4" : "left-2 lg:left-4"
        }`}
        style={{ bottom: buttonBottom }}
      >
        <span className="flex h-7 min-w-[88px] items-center justify-center bg-white px-3 text-[11px] capitalize text-[#1F1210] transition group-hover:bg-[#5C1626] group-hover:text-white lg:h-[40px] lg:min-w-[160px] lg:px-4 lg:text-[14px]">
          {title}
        </span>
      </div>
    </Link>
  );
}

export default CollectionTile;
