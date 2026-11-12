import { useState } from "react";
import { createGoal, deleteGoal, listGoals, updateGoal } from "../../../api/progress";
import { listCompanies, listTags } from "../../../api/taxonomy";
import { useAsync } from "../../../lib/useAsync";
import { formatDate, formatPercent, metricLabel } from "../../../lib/format";
import { getErrorMessage, getFieldErrors } from "../../../lib/errors";
import PageHeader from "../../../components/ui/PageHeader";
import { Field } from "../../../components/ui/Field";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import { PageSkeleton } from "../../../components/ui/Skeleton";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { useToast } from "../../../components/ui/Toast";

const blank = {
  metric: "question_count",
  target_value: "",
  target_tag: "",
  target_company: "",
  deadline: "",
};

export default function GoalsPage() {
  const toast = useToast();
  const goals = useAsync(() => listGoals(), []);
  const taxonomy = useAsync(
    () => Promise.all([listTags(), listCompanies()]).then(([tags, companies]) => ({ tags, companies })),
    [],
  );
  const [draft, setDraft] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const payloadFor = (values) => ({
    metric: values.metric,
    deadline: values.deadline || null,
    target_value: values.metric === "question_count" ? Number(values.target_value) : null,
    target_tag: values.metric === "topic_mastery" ? Number(values.target_tag) : null,
    target_company: values.metric === "company_target" ? Number(values.target_company) : null,
  });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = payloadFor(draft);
      if (editingId) {
        const response = await updateGoal(editingId, payload);
        goals.setData((current) => current.map((goal) => (goal.id === editingId ? response.data : goal)));
        toast({ title: "Goal updated" });
      } else {
        const response = await createGoal(payload);
        goals.setData((current) => [response.data, ...(current || [])]);
        toast({ title: "Goal created" });
      }
      setDraft(blank);
      setEditingId(null);
    } catch (err) {
      const fields = getFieldErrors(err);
      setError(Object.values(fields).join(" ") || getErrorMessage(err, "The goal could not be saved."));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async () => {
    try {
      await deleteGoal(pendingDelete);
      goals.setData((current) => current.filter((goal) => goal.id !== pendingDelete));
      setPendingDelete(null);
      toast({ title: "Goal deleted" });
    } catch (err) {
      toast({ tone: "danger", message: getErrorMessage(err) });
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Preparation" title="Goals" description="Question counts, topics, and companies you are aiming at." />
      <form onSubmit={submit} className="mt-8 grid gap-4 rounded-2xl bg-canvas p-5 shadow-sm md:grid-cols-2">
        {error && <p className="md:col-span-2 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <Select label="Metric" value={draft.metric} onChange={(event) => setDraft({ ...blank, metric: event.target.value, deadline: draft.deadline })}>
          <option value="question_count">Question count</option>
          <option value="topic_mastery">Topic mastery</option>
          <option value="company_target">Company target</option>
        </Select>
        {draft.metric === "question_count" && (
          <Field label="Questions to solve" type="number" min="1" value={draft.target_value} onChange={(event) => setDraft({ ...draft, target_value: event.target.value })} />
        )}
        {draft.metric === "topic_mastery" && (
          <Select label="Topic" value={draft.target_tag} onChange={(event) => setDraft({ ...draft, target_tag: event.target.value })}>
            <option value="">Choose a topic</option>
            {(taxonomy.data?.tags || []).map((tag) => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
          </Select>
        )}
        {draft.metric === "company_target" && (
          <Select label="Company" value={draft.target_company} onChange={(event) => setDraft({ ...draft, target_company: event.target.value })}>
            <option value="">Choose a company</option>
            {(taxonomy.data?.companies || []).map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
          </Select>
        )}
        <Field label="Deadline" type="date" value={draft.deadline || ""} onChange={(event) => setDraft({ ...draft, deadline: event.target.value })} />
        <div className="flex items-end gap-2">
          <Button type="submit" loading={submitting}>{editingId ? "Save goal" : "Create goal"}</Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setDraft(blank); }}>Cancel</Button>
          )}
        </div>
      </form>
      <div className="mt-8">
        {goals.loading && <PageSkeleton />}
        {goals.error && <ErrorState error={goals.error} onRetry={goals.reload} />}
        {goals.data && goals.data.length === 0 && <EmptyState title="No goals yet" body="Use the form above to add the first one." />}
        <div className="grid gap-4">
          {(goals.data || []).map((goal) => (
            <article key={goal.id} className="rounded-2xl bg-canvas p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-light text-ink">{metricLabel(goal.metric)}</h2>
                  <p className="mt-1 text-sm text-smoke">
                    {goal.metric === "topic_mastery" && (goal.target_tag_name || "Topic")}
                    {goal.metric === "company_target" && (goal.target_company_name || "Company")}
                    {goal.metric === "question_count" && `${goal.target_value} questions`}
                    {goal.deadline ? ` · ${formatDate(goal.deadline)}` : ""}
                  </p>
                </div>
                <span className="font-mono text-xs text-smoke">{formatPercent(goal.progress_percentage)}</span>
              </div>
              <p className="mt-3 text-sm text-graphite">{goal.solved_questions ?? 0} solved of {goal.total_questions ?? 0}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone">
                <div className="h-full bg-ink" style={{ width: `${Math.min(100, Number(goal.progress_percentage) || 0)}%` }} />
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => {
                  setEditingId(goal.id);
                  setDraft({
                    metric: goal.metric,
                    target_value: goal.target_value || "",
                    target_tag: goal.target_tag || "",
                    target_company: goal.target_company || "",
                    deadline: goal.deadline || "",
                  });
                }}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => setPendingDelete(goal.id)}>Delete</Button>
              </div>
            </article>
          ))}
        </div>
      </div>
      <ConfirmDialog
        open={pendingDelete != null}
        title="Delete this goal?"
        body="The goal is removed from your preparation list."
        confirmLabel="Delete goal"
        onConfirm={remove}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
