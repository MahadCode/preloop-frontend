import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { getCurrentUser, login, register as registerAccount } from "../../../api/auth";
import { login as loginAction } from "../authSlice";
import { getErrorMessage, getFieldErrors } from "../../../lib/errors";
import { Field, TextArea } from "../../../components/ui/Field";
import Button from "../../../components/ui/Button";
import { AuthCard } from "./LoginPage";

export default function SignupPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setError, formState: { errors } } = useForm();

  const onSubmit = async (values) => {
    setSubmitting(true);
    setFormError("");
    try {
      await registerAccount(values);
      try {
        await login(values.username, values.password);
        const userData = await getCurrentUser();
        dispatch(loginAction({ userData }));
      } catch {
        setFormError("The account was created. Sign in to continue.");
      }
      navigate("/verification-email-sent", { replace: true, state: { from: "signup" } });
    } catch (error) {
      const fields = getFieldErrors(error);
      Object.entries(fields).forEach(([name, message]) => {
        setError(name, { message });
      });
      if (!Object.keys(fields).length) {
        setFormError(getErrorMessage(error, "Unable to create the account."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create an account"
      subtitle={
        <>
          Already registered? <Link className="text-ink underline" to="/login">Log in</Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {formError && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{formError}</p>}
        <Field label="Username" {...register("username", { required: "Username is required." })} error={errors.username?.message} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" {...register("first_name", { required: "First name is required." })} error={errors.first_name?.message} />
          <Field label="Last name" {...register("last_name", { required: "Last name is required." })} error={errors.last_name?.message} />
        </div>
        <Field label="Email" type="email" {...register("email", { required: "Email is required." })} error={errors.email?.message} />
        <Field label="Phone" type="tel" {...register("phone", { required: "Phone is required." })} error={errors.phone?.message} />
        <TextArea label="Bio" rows={3} {...register("bio", { required: "Bio is required." })} error={errors.bio?.message} />
        <Field label="Password" type="password" autoComplete="new-password" {...register("password", { required: "Password is required.", minLength: { value: 8, message: "Use at least 8 characters." } })} error={errors.password?.message} />
        <Button type="submit" className="w-full" loading={submitting}>Create account</Button>
      </form>
    </AuthCard>
  );
}
