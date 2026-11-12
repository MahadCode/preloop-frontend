import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { listPendingQuestions, moderateQuestion } from "../../../api/moderation";
import { useAsync } from "../../../lib/useAsync";
import { difficultyLabel } from "../../../lib/format";
import { getErrorMessage } from "../../../lib/errors";
import PageHeader from "../../../components/ui/PageHeader";
import Prose from "../../../components/ui/Prose";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import ErrorState from "../../../components/ui/ErrorState";
import EmptyState from "../../../components/ui/EmptyState";
import { PageSkeleton } from "../../../components/ui/Skeleton";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { useToast } from "../../../components/ui/Toast";

export default function PendingQuestionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const state = useAsync(() => listPendingQuestions(), []);
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  if (state.loading) return <PageSkeleton />;
  if (state.error) return <ErrorState error={state.error} onRetry={state.reload} />;

  const question = (state.data || []).find((item) => String(item.id) === String(id));
  if (!question) {
    return <EmptyState title="Not in the pending queue" body="This question is not waiting for review." />;
  }

  const act = async (action) => {
    setPending(true);
    setError("");
    try {
      await moderateQuestion(id, action);
      toast({ title: action === "publish" ? "Question published" : "Question removed" });
      navigate("/moderation");
    } catch (err) {
      setError(getErrorMessage(err, "The question could not be updated."));
      setPending(false);
      setConfirming(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Pending question" title={question.title} description={question.author?.username || "Unknown author"} />
      <div className="mt-4"><Badge tone={question.difficulty_level}>{difficultyLabel(question.difficulty_level)}</Badge></div>
      {error && <p className="mt-4 text-sm text-danger">{error}</p>}
      <div className="mt-6 rounded-card border border-stone bg-paper p-5">
        <Prose html={question.description} />
      </div>
      <div className="mt-6 flex gap-2">
        <Button onClick={() => act("publish")} loading={pending}>Publish</Button>
        <Button variant="danger" onClick={() => setConfirming(true)}>Remove</Button>
      </div>
      <ConfirmDialog
        open={confirming}
        title="Remove this question?"
        body="The question is marked removed and stays out of the archive."
        confirmLabel="Remove"
        loading={pending}
        onConfirm={() => act("remove")}
        onClose={() => setConfirming(false)}
      />
    </div>
  );
}
