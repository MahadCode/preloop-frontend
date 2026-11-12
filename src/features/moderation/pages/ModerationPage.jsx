import { Link } from "react-router-dom";
import { listModerationReports, listPendingQuestions } from "../../../api/moderation";
import { useAsync } from "../../../lib/useAsync";
import { formatDate, statusLabel } from "../../../lib/format";
import PageHeader from "../../../components/ui/PageHeader";
import ErrorState from "../../../components/ui/ErrorState";
import EmptyState from "../../../components/ui/EmptyState";
import { PageSkeleton } from "../../../components/ui/Skeleton";
import Badge from "../../../components/ui/Badge";

export default function ModerationPage() {
  const reports = useAsync(() => listModerationReports(), []);
  const questions = useAsync(() => listPendingQuestions(), []);

  return (
    <div>
      <PageHeader
        eyebrow="Moderation"
        title="Review queue"
        description="Pending reports and questions waiting for publish or removal."
      />
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-2xl font-light text-ink">Reports</h2>
          <Queue
            state={reports}
            empty="No pending reports."
            render={(item) => (
              <Link to={`/moderation/reports/${item.id}`} className="block rounded-2xl border border-stone bg-paper p-4 hover:bg-taupe">
                <div className="flex items-center gap-2">
                  <Badge>{statusLabel(item.report?.status || "pending")}</Badge>
                  <span className="text-sm text-smoke">{item.reporter?.username || "Reporter"}</span>
                  {formatDate(item.report?.created_at) && (
                    <span className="font-mono text-[11px] text-ash">{formatDate(item.report.created_at)}</span>
                  )}
                </div>
                <p className="mt-2 text-ink">{item.question?.title || item.report?.reason || `Report ${item.id}`}</p>
              </Link>
            )}
          />
        </section>
        <section>
          <h2 className="text-2xl font-light text-ink">Pending questions</h2>
          <Queue
            state={questions}
            empty="No questions are waiting for review."
            render={(question) => (
              <Link to={`/moderation/questions/${question.id}`} className="block rounded-2xl border border-stone bg-paper p-4 hover:bg-taupe">
                <Badge>{statusLabel(question.status)}</Badge>
                <p className="mt-2 text-ink">{question.title}</p>
              </Link>
            )}
          />
        </section>
      </div>
    </div>
  );
}

function Queue({ state, empty, render }) {
  if (state.loading) return <div className="mt-4"><PageSkeleton /></div>;
  if (state.error) return <div className="mt-4"><ErrorState error={state.error} onRetry={state.reload} /></div>;
  if (!state.data?.length) return <div className="mt-4"><EmptyState title="Queue is clear" body={empty} /></div>;
  return <div className="mt-4 space-y-3">{state.data.map((item) => <div key={item.id}>{render(item)}</div>)}</div>;
}
