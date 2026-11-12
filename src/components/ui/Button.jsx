const variants = {
  primary: "bg-ink text-white hover:bg-neutral-800",
  secondary: "border border-stone bg-canvas text-graphite hover:bg-taupe",
  ghost: "text-graphite hover:bg-taupe",
  danger: "bg-danger text-white hover:bg-red-800",
};

const sizes = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  type = "button",
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition disabled:cursor-not-allowed disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? "Working..." : children}
    </button>
  );
}
