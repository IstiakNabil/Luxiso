interface CommunityImageProps {
  image: string;
  alt: string;
  className?: string;
}

function CommunityImage({
  image,
  alt,
  className = "",
}: CommunityImageProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <img
        src={image}
        alt={alt}
        className="h-full w-full object-cover transition duration-300 hover:scale-105"
      />
    </div>
  );
}

export default CommunityImage;