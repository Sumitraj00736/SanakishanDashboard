import React from "react";

/**
 * A reusable button component with a loading state.
 * @param {Object} props
 * @param {boolean} props.loading - Whether the button is in a loading state.
 * @param {React.ReactNode} props.children - The content of the button.
 * @param {string} props.className - Additional CSS classes.
 * @param {Function} props.onClick - Click handler.
 * @param {string} props.type - Button type (submit, button, etc.)
 * @param {boolean} props.disabled - Whether the button is disabled.
 */
export default function Button({
  loading = false,
  children,
  className = "",
  onClick,
  type = "button",
  disabled = false,
  ...props
}) {
  const baseStyles = "relative flex items-center justify-center transition-all duration-200 active:scale-95";
  const disabledStyles = (disabled || loading) ? "opacity-70 cursor-not-allowed" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${disabledStyles} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      <span>{children}</span>
    </button>
  );
}
