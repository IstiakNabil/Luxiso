interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

function Container({
  children,
  className = "",
}: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-[1920px] px-[108px] ${className}`}>
      {children}
    </div>
  );
}

export default Container;