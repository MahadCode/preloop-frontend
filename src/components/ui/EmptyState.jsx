export default function EmptyState({ title, body, action }) {
  return (
    <div className="rounded-card border border-dashed border-stone bg-paper px-6 py-12 text-center">
      <h2 className="text-2xl font-light tracking-tight text-ink">{title}</h2>
      {body && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-smoke">{body}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
