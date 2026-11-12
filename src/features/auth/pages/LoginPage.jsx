import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { getCurrentUser, login } from "../../../api/auth";
import { login as loginAction } from "../authSlice";
import { getErrorMessage } from "../../../lib/errors";
import { Field } from "../../../components/ui/Field";
import Button from "../../../components/ui/Button";

function safeNext(value) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export default function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ username, password }) => {
    setSubmitting(true);
    setError("");
    try {
      await login(username, password);
      const userData = await getCurrentUser();
      dispatch(loginAction({ userData }));
      navigate(safeNext(params.get("next")), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Invalid username or password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Log in"
      subtitle={
        <>
          New to PrepLoop? <Link className="text-ink underline" to="/signup">Create an account</Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <Field label="Username" autoComplete="username" {...register("username", { required: "Username is required." })} error={errors.username?.message} />
        <Field label="Password" type="password" autoComplete="current-password" {...register("password", { required: "Password is required." })} error={errors.password?.message} />
        <Button type="submit" className="w-full" loading={submitting}>Sign in</Button>
      </form>
      <p className="mt-4 text-sm">
        <Link to="/forgot-password" className="text-smoke underline">Forgot your password?</Link>
      </p>
    </AuthCard>
  );
}

export function AuthCard({ title, subtitle, children }) {
  return (
    <div className="mx-auto w-full max-w-md px-5 py-14">
      <div className="rounded-card border border-stone bg-paper p-6 sm:p-8">
        <h1 className="text-3xl font-light tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-smoke">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
