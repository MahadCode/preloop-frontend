import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getModerationReport, moderateReport } from "../../../api/moderation";
import { getSolution } from "../../../api/solutions";
import { useAsync } from "../../../lib/useAsync";
import { formatDate } from "../../../lib/format";
import { getErrorMessage } from "../../../lib/errors";
import PageHeader from "../../../components/ui/PageHeader";
import Prose from "../../../components/ui/Prose";
import { Field, TextArea } from "../../../components/ui/Field";
import Button from "../../../components/ui/Button";
import ErrorState from "../../../components/ui/ErrorState";
import { PageSkeleton } from "../../../components/ui/Skeleton";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { useToast } from "../../../components/ui/Toast";

export default function ModerationReportPage() {
  const { id } = useParams();
  const state = useAsync(() => getModerationReport(id), [id]);
  if (state.loading) return <PageSkeleton />;
  if (state.error) return <ErrorState error={state.error} onRetry={state.reload} />;
  return <ReportWorkspace key={state.data.id} report={state.data} id={id} />;
}

function ReportWorkspace({ report, id }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [solution, setSolution] = useState(null);
  const [title, setTitle] = useState(report.question?.title || "");
  const [description, setDescription] = useState(report.question?.description || "");
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const solutionId = report.report?.solution;
    if (!solutionId) return undefined;
    let active = true;
    getSolution(solutionId)
      .then((item) => {
        if (!active) return;
        setSolution(item);
        setContent(item.content || "");
      })
      .catch(() => {
        if (active) setSolution(null);
      });
    return () => {
      active = false;
    };
  }, [report]);
  const act = async (payload) => {
    setPending(true);
    setError("");
    try {
      await moderateReport(id, payload);
      toast({ title: "Moderation saved" });
      navigate("/moderation");
    } catch (err) {
      setError(getErrorMessage(err, "The moderation action failed."));
      setPending(false);
      setConfirming(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Moderation"
        title={report.question?.title || "Reported content"}
        description={`${report.reporter?.username || "A member"} · ${report.report?.reason || "No reason"} · ${formatDate(report.report?.created_at) || ""}`}
      />
      {error && <p className="mt-4 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
      {report.question && (
        <div className="mt-6 rounded-card border border-stone bg-paper p-5">
          <Prose html={report.question.description} />
        </div>
      )}
      {solution && (
        <div className="mt-6 rounded-card border border-stone bg-paper p-5">
          <p className="text-sm text-smoke">Reported solution by {solution.author?.username || "unknown"}</p>
          <div className="mt-3"><Prose html={solution.content} /></div>
        </div>
      )}
      {!report.question && !solution && report.report?.comment && (
        <p className="mt-6 text-sm text-smoke">
          This report targets comment {report.report.comment}. The report payload does not include the comment text.
        </p>
      )}
      <div className="mt-8 space-y-4">
        {report.question && (
          <>
            <Field label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
            <TextArea label="Description" rows={8} value={description} onChange={(event) => setDescription(event.target.value)} />
            <Button onClick={() => act({ action: "edit", title, description })} loading={pending}>Save edit</Button>
          </>
        )}
        {!report.question && (
          <>
            <TextArea label="Replacement content" rows={6} value={content} onChange={(event) => setContent(event.target.value)} />
            <Button onClick={() => act({ action: "edit", content })} loading={pending}>Save edit</Button>
          </>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => act({ action: "dismiss" })} loading={pending}>Dismiss</Button>
          <Button variant="danger" onClick={() => setConfirming(true)}>Remove</Button>
        </div>
      </div>
      <ConfirmDialog
        open={confirming}
        title="Remove the reported content?"
        body="A question is marked removed. A solution or comment is deleted."
        confirmLabel="Remove"
        loading={pending}
        onConfirm={() => act({ action: "remove" })}
        onClose={() => setConfirming(false)}
      />
    </div>
  );
}
