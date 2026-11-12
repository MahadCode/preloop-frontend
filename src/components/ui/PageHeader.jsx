export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 border-b border-stone pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-smoke">
            <span className="h-1.5 w-1.5 rounded-full bg-violet" />
            {eyebrow}
          </p>
        )}
        <h1 className="text-[32px] font-light leading-tight tracking-tight text-ink sm:text-[40px] sm:leading-[48px]">{title}</h1>
        {description && (
          <p className="mt-2 max-w-xl text-[13px] leading-5 text-graphite">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
