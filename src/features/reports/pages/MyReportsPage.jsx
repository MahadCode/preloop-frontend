import { useState } from "react";
import { deleteMyReport, listMyReports } from "../../../api/reports";
import { useAsync } from "../../../lib/useAsync";
import { formatDate, statusLabel } from "../../../lib/format";
import { getErrorMessage } from "../../../lib/errors";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import { PageSkeleton } from "../../../components/ui/Skeleton";
import Button from "../../../components/ui/Button";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import Badge from "../../../components/ui/Badge";
import { useToast } from "../../../components/ui/Toast";

export default function MyReportsPage() {
  const toast = useToast();
  const state = useAsync(() => listMyReports(), []);
  const [pendingId, setPendingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    try {
      await deleteMyReport(pendingId);
      state.setData((current) => (current || []).filter((item) => item.id !== pendingId));
      setPendingId(null);
      toast({ title: "Report withdrawn" });
    } catch (error) {
      toast({ tone: "danger", message: getErrorMessage(error) });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Reports" title="My reports" description="Reports you submitted. Status comes from the server." />
      <div className="mt-8 space-y-3">
        {state.loading && <PageSkeleton />}
        {state.error && <ErrorState error={state.error} onRetry={state.reload} />}
        {state.data && state.data.length === 0 && (
          <EmptyState title="No reports" body="You have not submitted a report." />
        )}
        {(state.data || []).map((report) => (
          <article key={report.id} className="rounded-2xl border border-stone bg-paper p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge>{statusLabel(report.status)}</Badge>
                <span className="font-mono text-[11px] text-ash">
                  {report.question ? `Question ${report.question}` : report.solution ? `Solution ${report.solution}` : report.comment ? `Comment ${report.comment}` : "Report"}
                </span>
                {formatDate(report.created_at) && (
                  <span className="font-mono text-[11px] text-ash">{formatDate(report.created_at)}</span>
                )}
              </div>
              {report.status === "pending" && (
                <Button size="sm" variant="ghost" onClick={() => setPendingId(report.id)}>Withdraw</Button>
              )}
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-graphite">{report.reason || "No reason was stored."}</p>
          </article>
        ))}
      </div>
      <ConfirmDialog
        open={pendingId != null}
        title="Withdraw this report?"
        body="The report is deleted from your account."
        confirmLabel="Withdraw"
        loading={deleting}
        onConfirm={remove}
        onClose={() => setPendingId(null)}
      />
    </div>
  );
}
