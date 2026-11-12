export default function Card({ className = "", children, ...props }) {
  return (
    <section
      className={`rounded-card border border-stone bg-taupe/70 p-5 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}
