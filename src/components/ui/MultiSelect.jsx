export default function MultiSelect({
  label,
  options = [],
  value = [],
  onChange,
  error,
  emptyLabel = "Nothing is available yet.",
}) {
  const selected = value.map(Number);

  const toggle = (id) => {
    const numeric = Number(id);
    if (selected.includes(numeric)) {
      onChange(selected.filter((item) => item !== numeric));
    } else {
      onChange([...selected, numeric]);
    }
  };

  return (
    <div>
      {label && <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>}
      {options.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone px-3 py-3 text-sm text-smoke">
          {emptyLabel}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const active = selected.includes(Number(option.id));
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggle(option.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-stone bg-paper text-graphite hover:bg-taupe"
                }`}
                aria-pressed={active}
              >
                {option.name}
              </button>
            );
          })}
        </div>
      )}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </div>
  );
}
