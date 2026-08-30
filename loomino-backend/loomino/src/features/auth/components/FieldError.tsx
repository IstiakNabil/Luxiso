interface FieldErrorProps {
  message?: string;
}

/** Inline validation error shown under a form field. */
function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="mt-1 text-[13px] text-red-600"
    >
      {message}
    </p>
  );
}

export default FieldError;
