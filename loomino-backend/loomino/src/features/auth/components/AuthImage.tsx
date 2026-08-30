interface AuthImageProps {
  src: string;
}

function AuthImage({
  src,
}: AuthImageProps) {
  return (
    <img
      src={src}
      alt="Authentication"
      className="h-full w-full object-cover"
    />
  );
}

export default AuthImage;