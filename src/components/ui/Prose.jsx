import DOMPurify from "dompurify";

export default function Prose({ html, className = "" }) {
  const clean = DOMPurify.sanitize(html || "", { USE_PROFILES: { html: true } });
  if (!clean.trim()) {
    return <p className="text-sm text-smoke">No description yet.</p>;
  }
  return (
    <div
      className={`prose-prep ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
