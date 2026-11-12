const controlClass =
  "w-full rounded-md border border-stone bg-paper px-3 py-2.5 text-ink outline-none transition placeholder:text-ash focus:border-ink focus:ring-2 focus:ring-ink/10";

export function Field({ label, error, hint, id, className = "", ...props }) {
  const inputId = id || props.name;
  return (
    <label className={`block ${className}`} htmlFor={inputId}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      )}
      <input id={inputId} className={controlClass} {...props} />
      {hint && <span className="mt-1 block text-xs text-smoke">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

export function TextArea({ label, error, hint, id, className = "", rows = 5, ...props }) {
  const inputId = id || props.name;
  return (
    <label className={`block ${className}`} htmlFor={inputId}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      )}
      <textarea id={inputId} rows={rows} className={controlClass} {...props} />
      {hint && <span className="mt-1 block text-xs text-smoke">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}
