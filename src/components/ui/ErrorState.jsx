import { getErrorMessage } from "../../lib/errors";
import Button from "./Button";

export default function ErrorState({ title = "This could not be loaded", error, onRetry }) {
  const message = typeof error === "string" ? error : getErrorMessage(error, "The request failed.");

  return (
    <div className="rounded-card border border-danger/20 bg-danger-soft px-6 py-8">
      <h2 className="text-xl font-light tracking-tight text-danger">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-graphite">{message}</p>
      {onRetry && (
        <Button className="mt-5" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
