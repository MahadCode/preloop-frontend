import { initials } from "../../lib/format";

export default function Avatar({ user, size = "md" }) {
  const sizes = {
    xs: "h-7 w-7 text-[10px]",
    sm: "h-8 w-8 text-[11px]",
    md: "h-10 w-10 text-xs",
    lg: "h-14 w-14 text-sm",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-ink font-medium text-white ${sizes[size]}`}
      aria-hidden="true"
    >
      {initials(user)}
    </span>
  );
}
