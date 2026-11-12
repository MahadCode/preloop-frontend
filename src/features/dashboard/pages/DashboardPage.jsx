import { Link } from "react-router-dom";
import { listGoals, getStatistics } from "../../../api/progress";
import { getProgressFeed } from "../../../api/questions";
import { useAsync } from "../../../lib/useAsync";
import { displayName, formatPercent, metricLabel, statusLabel } from "../../../lib/format";
import { useSelector } from "react-redux";
import PageHeader from "../../../components/ui/PageHeader";
import ErrorState from "../../../components/ui/ErrorState";
import EmptyState from "../../../components/ui/EmptyState";
import { PageSkeleton } from "../../../components/ui/Skeleton";
import Badge from "../../../components/ui/Badge";

export default function DashboardPage() {
  const user = useSelector((state) => state.auth.userData);
  const state = useAsync(
    () => Promise.all([getStatistics(), listGoals(), getProgressFeed()]).then(([statistics, goals, feed]) => ({ statistics, goals, feed })),
    [],
  );

  if (state.loading) return <PageSkeleton />;
  if (state.error) return <ErrorState error={state.error} onRetry={state.reload} />;

  const { statistics, goals, feed } = state.data;
  const total = Number(statistics.total_question) || 0;
  const solved = Number(statistics.total_solved) || 0;
  const attempted = Number(statistics.total_attempted) || 0;
  const unsolved = Number(statistics.total_unsolved) || 0;

  return (
    <div>
      <PageHeader
        eyebrow="Preparation"
        title="Overview"
        description={`${displayName(user)} · ${user?.email || "Signed in"}`}
        actions={
          <>
            <Link to="/dashboard/statistics" className="inline-flex h-10 items-center rounded-full border border-stone px-4 text-sm">Statistics</Link>
            <Link to="/dashboard/goals" className="inline-flex h-10 items-center rounded-full bg-ink px-4 text-sm text-white">Goals</Link>
          </>
        }
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Questions" value={total} hint="Published" />
        <Stat label="Solved" value={solved} hint={formatPercent(total ? (solved / total) * 100 : 0)} />
        <Stat label="Attempted" value={attempted} hint={formatPercent(total ? (attempted / total) * 100 : 0)} />
        <Stat label="Unsolved" value={unsolved} hint={formatPercent(total ? (unsolved / total) * 100 : 0)} />
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-[28px] font-light tracking-tight text-ink">Goals</h2>
          {goals.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No goals yet"
                body="Create a question count, topic, or company goal."
                action={<Link to="/dashboard/goals" className="text-sm text-ink underline">Create a goal</Link>}
              />
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {goals.slice(0, 4).map((goal) => (
                <li key={goal.id} className="rounded-2xl bg-canvas p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-ink">{metricLabel(goal.metric)}</p>
                    <span className="font-mono text-xs text-smoke">{formatPercent(goal.progress_percentage)}</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone">
                    <div className="h-full bg-ink" style={{ width: `${Math.min(100, Number(goal.progress_percentage) || 0)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          <h2 className="text-[28px] font-light tracking-tight text-ink">Recent status</h2>
          {feed.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No attempted or solved questions" body="Status updates appear here after you mark a question." />
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {feed.slice(0, 6).map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 rounded-2xl bg-canvas px-4 py-3 shadow-sm">
                  <Link to={row.question?.id ? `/questions/${row.question.id}` : "/dashboard/progress"} className="text-sm text-ink">
                    {row.question?.title || "Question"}
                  </Link>
                  <Badge tone={row.status === "solved" ? "violet" : "neutral"}>{statusLabel(row.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="flex h-36 flex-col justify-between rounded-2xl bg-taupe p-5 shadow-sm">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-smoke">{label}</p>
      <div>
        <p className="text-4xl font-light tracking-tight text-ink">{value}</p>
        <p className="mt-1 text-xs text-smoke">{hint}</p>
      </div>
    </div>
  );
}
