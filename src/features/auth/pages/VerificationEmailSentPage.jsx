import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { resendEmailVerification } from "../../../api/auth";
import { getErrorMessage } from "../../../lib/errors";
import Button from "../../../components/ui/Button";
import { AuthCard } from "./LoginPage";

const reasons = [
  [/\/add-question$/, "Verify your email before adding a question."],
  [/submit-solution$/, "Verify your email before submitting a solution."],
  [/\/report$/, "Verify your email before reporting content."],
  [/\/edit$/, "Verify your email before editing."],
  [/^\/questions\//, "Verify your email before opening a question."],
  [/^\/dashboard/, "Verify your email before opening preparation tools."],
  [/^\/moderation/, "Verify your email before moderation."],
  [/^\/practice/, "Verify your email before practice."],
  [/^\/taxonomy/, "Verify your email before managing taxonomy."],
  [/^\/reports/, "Verify your email before viewing reports."],
];

export default function VerificationEmailSentPage() {
  const location = useLocation();
  const authenticated = useSelector((state) => state.auth.status);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const from = location.state?.from;
  const redirectTo = location.state?.redirectTo || "";
  const context = reasons.find(([pattern]) => pattern.test(redirectTo))?.[1]
    || "Confirm the link in your inbox to activate the account.";

  const resend = async () => {
    setSending(true);
    setError("");
    try {
      await resendEmailVerification();
      setMessage("A new verification email has been requested.");
    } catch (err) {
      setError(getErrorMessage(err, "The verification email could not be sent."));
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (from !== "verify-email" || !authenticated) return undefined;
    const timer = window.setTimeout(() => {
      resend();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [from, authenticated]);

  return (
    <AuthCard title="Check your inbox" subtitle={context}>
      {from === "signup" && (
        <p className="mb-4 text-sm leading-6 text-graphite">
          The account is created and this browser is signed in. Open the verification link, then return here and reload so PrepLoop can see the active status.
        </p>
      )}
      {message && <p className="mb-3 rounded-xl bg-taupe px-3 py-2 text-sm text-ink">{message}</p>}
      {error && <p className="mb-3 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
      {authenticated ? (
        <Button onClick={resend} loading={sending}>Resend verification email</Button>
      ) : (
        <p className="text-sm text-smoke">
          Sign in before requesting another email. <Link className="text-ink underline" to="/login">Log in</Link>
        </p>
      )}
      <p className="mt-6 text-sm">
        <Link to="/" className="text-ink underline">Back to PrepLoop</Link>
      </p>
    </AuthCard>
  );
}
