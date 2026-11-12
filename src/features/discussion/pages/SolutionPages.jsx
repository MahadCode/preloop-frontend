import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createSolution, getSolution, updateSolution } from "../../../api/solutions";
import { useAsync } from "../../../lib/useAsync";
import { getErrorMessage } from "../../../lib/errors";
import PageHeader from "../../../components/ui/PageHeader";
import RichText from "../../../components/ui/RichText";
import Button from "../../../components/ui/Button";
import ErrorState from "../../../components/ui/ErrorState";
import { PageSkeleton } from "../../../components/ui/Skeleton";

export function AddSolutionPage() {
  const { questionId } = useParams();
  return (
    <SolutionEditor
      title="Submit a solution"
      description="Write the approach you want attached to this question."
      onSave={(content) => createSolution(questionId, { content })}
      back={`/questions/${questionId}`}
    />
  );
}

export function EditSolutionPage() {
  const { questionId, solutionId } = useParams();
  const state = useAsync(() => getSolution(solutionId), [solutionId]);
  if (state.loading) return <PageSkeleton />;
  if (state.error) return <ErrorState error={state.error} onRetry={state.reload} />;
  return (
    <SolutionEditor
      title="Edit solution"
      description="Update the solution you wrote."
      initial={state.data.content}
      onSave={(content) => updateSolution(solutionId, { content })}
      back={`/questions/${questionId}/solutions`}
    />
  );
}

function SolutionEditor({ title, description, initial = "", onSave, back }) {
  const navigate = useNavigate();
  const [content, setContent] = useState(initial);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!content || content === "<p></p>") {
      setError("Write a solution before saving.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSave(content);
      navigate(back);
    } catch (err) {
      setError(getErrorMessage(err, "The solution could not be saved."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Solution" title={title} description={description} />
      <form onSubmit={submit} className="mt-8 space-y-4">
        {error && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <RichText value={content} onChange={setContent} />
        <Button type="submit" loading={submitting}>Save solution</Button>
      </form>
    </div>
  );
}
