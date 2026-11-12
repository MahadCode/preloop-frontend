import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { deleteSolution, listSolutions } from "../../../api/solutions";
import { listSolutionComments } from "../../../api/comments";
import CommentSection from "../../../components/discussion/CommentSection";
import { useAsync } from "../../../lib/useAsync";
import { formatDate } from "../../../lib/format";
import { getErrorMessage } from "../../../lib/errors";
import PageHeader from "../../../components/ui/PageHeader";
import Prose from "../../../components/ui/Prose";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import { PageSkeleton } from "../../../components/ui/Skeleton";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import Avatar from "../../../components/ui/Avatar";
import { useToast } from "../../../components/ui/Toast";
import ReportDialog from "../../../components/discussion/ReportDialog";

export default function AllSolutionsPage() {
  const { questionId } = useParams();
  const user = useSelector((state) => state.auth.userData);
  const toast = useToast();
  const state = useAsync(() => listSolutions(questionId), [questionId]);
  const [pendingId, setPendingId] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    try {
      await deleteSolution(pendingId);
      state.setData((current) => (current || []).filter((item) => item.id !== pendingId));
      toast({ title: "Solution deleted" });
      setPendingId(null);
    } catch (error) {
      toast({ tone: "danger", message: getErrorMessage(error) });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Solutions"
        title="All solutions"
        description="Every solution returned for this question."
        actions={
          <Link to={`/questions/${questionId}/submit-solution`} className="inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm text-white">
            Submit a solution
          </Link>
        }
      />
      <div className="mt-8 space-y-4">
        {state.loading && <PageSkeleton />}
        {state.error && <ErrorState error={state.error} onRetry={state.reload} />}
        {state.data && state.data.length === 0 && (
          <EmptyState title="No solutions yet" body="Be the first to write one for this question." />
        )}
        {(state.data || []).map((solution) => {
          const mine = user?.id === solution.author?.id;
          const when = formatDate(solution.created_at);
          return (
            <article id={`solution-${solution.id}`} key={solution.id} className="rounded-card border border-stone bg-paper p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Avatar user={solution.author} size="sm" />
                  <div>
                    <p className="text-sm text-ink">{solution.author?.username || "Unknown"}</p>
                    {when && <p className="font-mono text-[11px] text-ash">{when}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mine && (
                    <Link to={`/questions/${questionId}/solutions/${solution.id}/edit`} className="inline-flex h-9 items-center rounded-full border border-stone px-3 text-xs">
                      Edit
                    </Link>
                  )}
                  {mine && <Button size="sm" variant="danger" onClick={() => setPendingId(solution.id)}>Delete</Button>}
                  <Button size="sm" variant="ghost" onClick={() => setReportId(solution.id)}>Report</Button>
                </div>
              </div>
              <div className="mt-4"><Prose html={solution.content} /></div>
              <SolutionDiscussion solution={solution} />
            </article>
          );
        })}
      </div>
      <ConfirmDialog
        open={pendingId != null}
        title="Delete this solution?"
        body="The solution is removed from the question."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={remove}
        onClose={() => setPendingId(null)}
      />
      <ReportDialog open={reportId != null} onClose={() => setReportId(null)} target={{ solution: reportId }} />
    </div>
  );
}

function SolutionDiscussion({ solution }) {
  const comments = useAsync(() => listSolutionComments(solution.id), [solution.id]);
  if (comments.loading) return <p className="mt-6 text-sm text-smoke">Loading comments...</p>;
  if (comments.error) return <div className="mt-6"><ErrorState error={comments.error} onRetry={comments.reload} /></div>;
  return (
    <div className="mt-6">
      <CommentSection
        solutionId={solution.id}
        questionAuthorId={solution.author?.id}
        comments={comments.data}
        onChange={comments.setData}
      />
    </div>
  );
}
