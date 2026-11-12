import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { requestPasswordRecovery } from "../../../api/auth";
import { getErrorMessage } from "../../../lib/errors";
import { Field } from "../../../components/ui/Field";
import Button from "../../../components/ui/Button";
import { AuthCard } from "./LoginPage";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (values) => {
    setSubmitting(true);
    setError("");
    try {
      const response = await requestPasswordRecovery(values);
      setMessage(response.data?.message || "If the account matches, a recovery email is on its way.");
    } catch (err) {
      setError(getErrorMessage(err, "The recovery email could not be requested."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title="Forgot password" subtitle="Enter the username and email on the account.">
      {message ? (
        <p className="rounded-xl bg-taupe px-3 py-2 text-sm text-ink">{message}</p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {error && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
          <Field label="Username" {...register("username", { required: "Username is required." })} error={errors.username?.message} />
          <Field label="Email" type="email" {...register("email", { required: "Email is required." })} error={errors.email?.message} />
          <Button type="submit" className="w-full" loading={submitting}>Send reset link</Button>
        </form>
      )}
      <p className="mt-4 text-sm">
        <Link to="/login" className="text-ink underline">Back to login</Link>
      </p>
    </AuthCard>
  );
}
