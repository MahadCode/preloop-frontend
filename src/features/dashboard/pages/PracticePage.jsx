import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listQuestionStatuses, listQuestions } from "../../../api/questions";
import { useAsync } from "../../../lib/useAsync";
import { difficultyLabel } from "../../../lib/format";
import PageHeader from "../../../components/ui/PageHeader";
import ErrorState from "../../../components/ui/ErrorState";
import EmptyState from "../../../components/ui/EmptyState";
import { PageSkeleton } from "../../../components/ui/Skeleton";
import Badge from "../../../components/ui/Badge";
import StatusControl from "../../../components/questions/StatusControl";

export default function PracticePage() {
  const [index, setIndex] = useState(0);
  const state = useAsync(async () => {
    const [questions, feed] = await Promise.all([listQuestions(), listQuestionStatuses()]);
    const statusByQuestion = {};
    feed.forEach((row) => {
      const id = row.question_id ?? row.question?.id;
      if (id) statusByQuestion[id] = row.status;
    });
    return { questions, statusByQuestion };
  }, []);

  const queue = useMemo(() => {
    if (!state.data) return [];
    return state.data.questions.filter((question) => (state.data.statusByQuestion[question.id] || "unsolved") !== "solved");
  }, [state.data]);

  if (state.loading) return <PageSkeleton />;
  if (state.error) return <ErrorState error={state.error} onRetry={state.reload} />;

  const current = queue[Math.min(index, Math.max(queue.length - 1, 0))];

  return (
    <div>
      <PageHeader
        eyebrow="Practice"
        title="Practice queue"
        description="Published questions that are not marked solved. Status changes use the same preparation endpoint as the progress page."
      />
      {queue.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="The queue is clear" body="Every published question in the archive is marked solved, or the archive is empty." />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="max-h-[70vh] space-y-2 overflow-auto">
            {queue.map((question, itemIndex) => (
              <button
                key={question.id}
                type="button"
                onClick={() => setIndex(itemIndex)}
                className={`block w-full rounded-2xl border px-3 py-3 text-left text-sm ${itemIndex === index ? "border-ink bg-ink text-white" : "border-stone bg-paper text-ink"}`}
              >
                {question.title}
              </button>
            ))}
          </aside>
          {current && (
            <section className="rounded-2xl bg-canvas p-6 shadow-sm">
              <Badge tone={current.difficulty_level}>{difficultyLabel(current.difficulty_level)}</Badge>
              <h2 className="mt-4 text-3xl font-light tracking-tight text-ink">{current.title}</h2>
              <p className="mt-2 font-mono text-xs text-smoke">{index + 1} of {queue.length}</p>
              <div className="mt-6 max-w-xs">
                <StatusControl
                  questionId={current.id}
                  status={state.data.statusByQuestion[current.id] || "unsolved"}
                  onChanged={(next) => {
                    state.setData((data) => {
                      const statusByQuestion = { ...data.statusByQuestion };
                      statusByQuestion[current.id] = next;
                      return { ...data, statusByQuestion };
                    });
                    if (next === "solved") setIndex((value) => value);
                  }}
                />
              </div>
              <Link to={`/questions/${current.id}`} className="mt-6 inline-flex text-sm text-ink underline">Open the full question</Link>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
