const tones = {
  neutral: "bg-stone text-graphite",
  ink: "bg-ink text-white",
  violet: "bg-violet/10 text-violet",
  ember: "bg-ember/10 text-ember",
  danger: "bg-danger-soft text-danger",
  easy: "bg-stone text-ink",
  medium: "bg-taupe text-graphite ring-1 ring-stone",
  hard: "bg-ink text-white",
};

export default function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide ${tones[tone] || tones.neutral} ${className}`}
    >
      {children}
    </span>
  );
}
