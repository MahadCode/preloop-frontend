import { useState } from "react";
import {
  createCompany,
  createJobRole,
  createTag,
  deleteCompany,
  deleteJobRole,
  deleteTag,
  listCompanies,
  listJobRoles,
  listTags,
  updateCompany,
  updateJobRole,
  updateTag,
} from "../../../api/taxonomy";
import { useAsync } from "../../../lib/useAsync";
import { getErrorMessage } from "../../../lib/errors";
import PageHeader from "../../../components/ui/PageHeader";
import { Field } from "../../../components/ui/Field";
import Button from "../../../components/ui/Button";
import ErrorState from "../../../components/ui/ErrorState";
import EmptyState from "../../../components/ui/EmptyState";
import { PageSkeleton } from "../../../components/ui/Skeleton";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { useToast } from "../../../components/ui/Toast";

const groups = [
  {
    key: "companies",
    title: "Companies",
    load: listCompanies,
    create: createCompany,
    update: updateCompany,
    remove: deleteCompany,
  },
  {
    key: "roles",
    title: "Job roles",
    load: listJobRoles,
    create: createJobRole,
    update: updateJobRole,
    remove: deleteJobRole,
  },
  {
    key: "tags",
    title: "Topics",
    load: listTags,
    create: createTag,
    update: updateTag,
    remove: deleteTag,
  },
];

export default function TaxonomyPage() {
  const state = useAsync(
    () => Promise.all(groups.map((group) => group.load())).then((lists) => {
      const data = {};
      groups.forEach((group, index) => {
        data[group.key] = lists[index];
      });
      return data;
    }),
    [],
  );

  if (state.loading) return <PageSkeleton />;
  if (state.error) return <ErrorState error={state.error} onRetry={state.reload} />;

  return (
    <div>
      <PageHeader
        eyebrow="Taxonomy"
        title="Companies, roles, and topics"
        description="Creating an entry uses the live taxonomy API. Rename and deactivate call the update and delete routes documented for Phase 2, so those actions show the server response."
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {groups.map((group) => (
          <TaxonomyColumn
            key={group.key}
            group={group}
            items={state.data[group.key] || []}
            onChange={(items) => state.setData((current) => ({ ...current, [group.key]: items }))}
          />
        ))}
      </div>
    </div>
  );
}

function TaxonomyColumn({ group, items, onChange }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState("");

  const add = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    setPending(true);
    setError("");
    try {
      const response = await group.create(name.trim());
      onChange([response.data, ...items]);
      setName("");
      toast({ title: `${group.title.slice(0, -1)} added` });
    } catch (err) {
      setError(getErrorMessage(err, "This entry could not be created."));
    } finally {
      setPending(false);
    }
  };

  const rename = async (item) => {
    setPending(true);
    try {
      const response = await group.update(item.id, { name: draft.trim() });
      onChange(items.map((current) => (current.id === item.id ? response.data : current)));
      setEditing(null);
      toast({ title: "Saved" });
    } catch (err) {
      toast({ tone: "danger", message: getErrorMessage(err, "Rename is not available from the server yet.") });
    } finally {
      setPending(false);
    }
  };

  const deactivate = async () => {
    setPending(true);
    try {
      await group.remove(removing.id);
      onChange(items.filter((item) => item.id !== removing.id));
      toast({ title: "Removed" });
      setRemoving(null);
    } catch (err) {
      toast({ tone: "danger", message: getErrorMessage(err, "Deactivate is not available from the server yet.") });
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="rounded-2xl bg-canvas p-5 shadow-sm">
      <h2 className="text-2xl font-light text-ink">{group.title}</h2>
      <form onSubmit={add} className="mt-4 flex gap-2">
        <Field value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" aria-label={`${group.title} name`} />
        <Button type="submit" loading={pending}>Add</Button>
      </form>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      {items.length === 0 ? (
        <div className="mt-4"><EmptyState title="None yet" body="The list from the server is empty." /></div>
      ) : (
        <ul className="mt-4 divide-y divide-stone">
          {items.map((item) => (
            <li key={item.id} className="py-3">
              {editing === item.id ? (
                <div className="flex gap-2">
                  <Field value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="New name" />
                  <Button size="sm" onClick={() => rename(item)} loading={pending}>Save</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-ink">{item.name}</span>
                  <span className="flex gap-2">
                    <button type="button" className="text-xs text-smoke hover:text-ink" onClick={() => { setEditing(item.id); setDraft(item.name); }}>Rename</button>
                    <button type="button" className="text-xs text-danger" onClick={() => setRemoving(item)}>Deactivate</button>
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={Boolean(removing)}
        title="Deactivate this entry?"
        body="The entry leaves the public lists. Questions that already use it keep the name."
        confirmLabel="Deactivate"
        loading={pending}
        onConfirm={deactivate}
        onClose={() => setRemoving(null)}
      />
    </section>
  );
}
