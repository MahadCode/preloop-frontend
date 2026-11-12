import { getStatistics } from "../../../api/progress";
import { useAsync } from "../../../lib/useAsync";
import { difficultyLabel, formatPercent } from "../../../lib/format";
import PageHeader from "../../../components/ui/PageHeader";
import ErrorState from "../../../components/ui/ErrorState";
import EmptyState from "../../../components/ui/EmptyState";
import { PageSkeleton } from "../../../components/ui/Skeleton";

export default function StatisticsPage() {
  const state = useAsync(() => getStatistics(), []);
  if (state.loading) return <PageSkeleton />;
  if (state.error) return <ErrorState error={state.error} onRetry={state.reload} />;
  const stats = state.data;
  const total = Number(stats.total_question) || 0;

  return (
    <div>
      <PageHeader
        eyebrow="Preparation"
        title="Statistics"
        description="Published questions grouped by difficulty, topic, and company."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="Published" value={total} />
        <Summary label="Solved" value={stats.total_solved ?? 0} />
        <Summary label="Attempted" value={stats.total_attempted ?? 0} />
        <Summary label="Unsolved" value={stats.total_unsolved ?? 0} />
      </div>
      <div className="mt-10 grid gap-10">
        <Breakdown
          title="Difficulty"
          rows={(stats.difficulty_breakdown || []).map((row) => ({
            key: row.difficulty,
            label: difficultyLabel(row.difficulty),
            solved: row.solved,
            total: row.total,
          }))}
        />
        <Breakdown
          title="Topics"
          rows={(stats.topic_breakdown || []).filter((row) => row.tag_id).map((row) => ({
            key: row.tag_id,
            label: row.tag_name || "Untitled topic",
            solved: row.solved,
            total: row.total,
          }))}
        />
        <Breakdown
          title="Companies"
          rows={(stats.company_breakdown || []).filter((row) => row.company_id).map((row) => ({
            key: row.company_id,
            label: row.company_name || "Untitled company",
            solved: row.solved,
            total: row.total,
          }))}
        />
      </div>
    </div>
  );
}

function Breakdown({ title, rows }) {
  return (
    <section>
      <h2 className="text-[28px] font-light tracking-tight text-ink">{title}</h2>
      {rows.length === 0 ? (
        <div className="mt-4"><EmptyState title="No breakdown yet" body="This group is empty in the statistics response." /></div>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => {
            const width = row.total ? Math.min(100, Math.round((row.solved / row.total) * 100)) : 0;
            return (
              <li key={row.key} className="rounded-2xl bg-canvas px-5 py-4 shadow-sm">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-ink">{row.label}</span>
                  <span className="font-mono text-xs text-smoke">{row.solved}/{row.total} · {formatPercent(width)}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone">
                  <div className="h-full bg-ink" style={{ width: `${width}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Summary({ label, value }) {
  return (
    <div className="rounded-2xl bg-taupe p-5 shadow-sm">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-smoke">{label}</p>
      <p className="mt-3 text-4xl font-light tracking-tight text-ink">{value}</p>
    </div>
  );
}
