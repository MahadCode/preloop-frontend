import { useState } from "react";
import { useForm } from "react-hook-form";
import { changePassword } from "../../../api/auth";
import { getErrorMessage } from "../../../lib/errors";
import { Field } from "../../../components/ui/Field";
import Button from "../../../components/ui/Button";
import PageHeader from "../../../components/ui/PageHeader";

export default function ChangePasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async ({ current_password, new_password, confirm }) => {
    setError("");
    setMessage("");
    if (new_password !== confirm) {
      setError("The new passwords do not match.");
      return;
    }
    if (current_password === new_password) {
      setError("Choose a password that is different from the current one.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await changePassword({ current_password, new_password });
      setMessage(response.data?.message || "Password changed.");
      reset();
    } catch (err) {
      setError(getErrorMessage(err, "The password could not be changed."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader eyebrow="Account" title="Change password" description="Confirm the current password, then choose a new one." />
      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {message && <p className="rounded-xl bg-taupe px-3 py-2 text-sm text-ink">{message}</p>}
        {error && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <Field label="Current password" type="password" {...register("current_password", { required: "Current password is required." })} error={errors.current_password?.message} />
        <Field label="New password" type="password" {...register("new_password", { required: "New password is required.", minLength: { value: 8, message: "Use at least 8 characters." } })} error={errors.new_password?.message} />
        <Field label="Confirm new password" type="password" {...register("confirm", { required: "Confirm the new password." })} error={errors.confirm?.message} />
        <Button type="submit" loading={submitting}>Update password</Button>
      </form>
    </div>
  );
}
