import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { deleteAccount } from "../../../api/auth";
import { logout } from "../authSlice";
import { getErrorMessage } from "../../../lib/errors";
import { Field } from "../../../components/ui/Field";
import Button from "../../../components/ui/Button";
import PageHeader from "../../../components/ui/PageHeader";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";

export default function DeleteAccountPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (values) => {
    setError("");
    setPendingValues(values);
    setOpen(true);
  };

  const confirm = async () => {
    setSubmitting(true);
    try {
      await deleteAccount(pendingValues);
      dispatch(logout());
      navigate("/login", { replace: true });
    } catch (err) {
      setOpen(false);
      setError(getErrorMessage(err, "The account could not be deleted."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        eyebrow="Account"
        title="Delete account"
        description="This removes the account after the username and password match."
      />
      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {error && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <Field label="Username" {...register("username", { required: "Username is required." })} error={errors.username?.message} />
        <Field label="Password" type="password" {...register("password", { required: "Password is required." })} error={errors.password?.message} />
        <Button type="submit" variant="danger">Delete account</Button>
      </form>
      <ConfirmDialog
        open={open}
        title="Delete this account?"
        body="The account, and the session that belongs to it, will be removed. This cannot be undone from PrepLoop."
        confirmLabel="Delete account"
        loading={submitting}
        onConfirm={confirm}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
