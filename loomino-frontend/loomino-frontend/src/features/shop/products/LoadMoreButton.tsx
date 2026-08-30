interface LoadMoreButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

function LoadMoreButton({
  onClick,
  disabled = false,
}: LoadMoreButtonProps) {
  return (
    <div className="mt-12 flex justify-center">
      <button
        onClick={onClick}
        disabled={disabled}
        className="border border-[#8B6B3F] px-12 py-3 text-sm transition hover:bg-[#8B6B3F] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Load More
      </button>
    </div>
  );
}

export default LoadMoreButton;