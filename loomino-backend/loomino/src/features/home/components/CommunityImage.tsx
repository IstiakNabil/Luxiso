interface CommunityImageProps {
  image: string;
  alt: string;
  width: number;
  height: number;
}

function CommunityImage({
  image,
  alt,
  width,
  height,
}: CommunityImageProps) {
  return (
    <div
      className="overflow-hidden"
      style={{
        width,
        height,
      }}
    >
      <img
        src={image}
        alt={alt}
        className="h-full w-full object-cover transition duration-300 hover:scale-105"
      />
    </div>
  );
}

export default CommunityImage;