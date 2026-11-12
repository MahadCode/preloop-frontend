import { useEffect } from "react";

export default function Modal({
  open,
  title,
  children,
  onClose,
  labelledBy = "dialog-title",
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card border border-stone bg-canvas p-5 shadow-xl sm:p-6"
      >
        {title && (
          <h2 id={labelledBy} className="text-2xl font-light tracking-tight text-ink">
            {title}
          </h2>
        )}
        <div className={title ? "mt-4" : ""}>{children}</div>
      </div>
    </div>
  );
}
