interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Page gutter wrapper.
 *
 * Mobile follows the Figma mobile frames: 360px wide with
 * 20px side gutters (320px of content). Desktop keeps the
 * 108px gutters from the 1440px design, capped at 1920px.
 */
function Container({
  children,
  className = "",
}: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[1920px] px-5 md:px-10 lg:px-[108px] ${className}`}
    >
      {children}
    </div>
  );
}

export default Container;