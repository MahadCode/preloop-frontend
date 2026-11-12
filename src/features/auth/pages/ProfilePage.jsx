import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { updateProfile } from "../../../api/auth";
import { login } from "../authSlice";
import { getErrorMessage, getFieldErrors } from "../../../lib/errors";
import { displayName } from "../../../lib/format";
import { Field, TextArea } from "../../../components/ui/Field";
import Button from "../../../components/ui/Button";
import PageHeader from "../../../components/ui/PageHeader";
import { useToast } from "../../../components/ui/Toast";
import Avatar from "../../../components/ui/Avatar";

export default function ProfilePage() {
  const user = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    values: {
      username: user?.username || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
    },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const response = await updateProfile(values);
      dispatch(login({ userData: { ...user, ...response.data } }));
      setEditing(false);
      toast({ title: "Profile saved" });
    } catch (error) {
      const fields = getFieldErrors(error);
      Object.entries(fields).forEach(([name, message]) => setError(name, { message }));
      if (!Object.keys(fields).length) {
        toast({ tone: "danger", message: getErrorMessage(error, "Profile could not be saved.") });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="The name, phone, and bio shown with your questions and comments."
        actions={!editing && <Button onClick={() => setEditing(true)}>Edit profile</Button>}
      />
      <div className="mt-8 flex items-center gap-4">
        <Avatar user={user} size="lg" />
        <div>
          <p className="text-xl text-ink">{displayName(user)}</p>
          <p className="text-sm text-smoke">{user?.email}</p>
        </div>
      </div>
      {editing ? (
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Username" {...register("username", { required: "Username is required." })} error={errors.username?.message} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" {...register("first_name", { required: "First name is required." })} error={errors.first_name?.message} />
            <Field label="Last name" {...register("last_name", { required: "Last name is required." })} error={errors.last_name?.message} />
          </div>
          <Field label="Phone" {...register("phone", { required: "Phone is required." })} error={errors.phone?.message} />
          <TextArea label="Bio" {...register("bio", { required: "Bio is required." })} error={errors.bio?.message} />
          <p className="text-xs text-smoke">Email stays {user?.email}. The profile endpoint does not change it.</p>
          <div className="flex gap-2">
            <Button type="submit" loading={submitting}>Save</Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <Info label="Username" value={user?.username} />
          <Info label="Phone" value={user?.phone} />
          <Info label="Role" value={user?.role} />
          <Info label="Status" value={user?.account_status} />
          <div className="sm:col-span-2">
            <Info label="Bio" value={user?.bio} />
          </div>
        </dl>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-stone bg-paper px-4 py-3">
      <dt className="font-mono text-[11px] uppercase tracking-wide text-ash">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value || "—"}</dd>
    </div>
  );
}
