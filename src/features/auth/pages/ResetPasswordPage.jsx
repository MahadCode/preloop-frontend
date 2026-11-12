import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { resetPassword } from "../../../api/auth";
import { getErrorMessage } from "../../../lib/errors";
import { Field } from "../../../components/ui/Field";
import Button from "../../../components/ui/Button";
import { AuthCard } from "./LoginPage";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ password, confirm }) => {
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await resetPassword(token, { password });
      setMessage(response.data?.message || "Password updated. You can log in.");
      window.setTimeout(() => navigate("/login"), 1600);
    } catch (err) {
      setError(getErrorMessage(err, "The password could not be reset."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title="Choose a new password" subtitle="This uses the token from the recovery email.">
      {message ? (
        <p className="rounded-xl bg-taupe px-3 py-2 text-sm text-ink">{message} Returning to login.</p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {error && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
          <Field label="New password" type="password" {...register("password", { required: "Password is required.", minLength: { value: 8, message: "Use at least 8 characters." } })} error={errors.password?.message} />
          <Field label="Confirm password" type="password" {...register("confirm", { required: "Confirm the password." })} error={errors.confirm?.message} />
          <Button type="submit" className="w-full" loading={submitting}>Update password</Button>
        </form>
      )}
      <p className="mt-4 text-sm">
        <Link to="/login" className="text-ink underline">Back to login</Link>
      </p>
    </AuthCard>
  );
}
