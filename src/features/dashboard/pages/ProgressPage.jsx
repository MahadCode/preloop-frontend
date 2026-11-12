import { useState } from "react";
import { Link } from "react-router-dom";
import { listQuestionStatuses, listQuestions } from "../../../api/questions";
import { listCompanies, listJobRoles, listTags } from "../../../api/taxonomy";
import { useAsync } from "../../../lib/useAsync";
import { defaultQuestionFilters, filterQuestions, sortQuestions } from "../../../lib/questions";
import { companyNames, difficultyLabel } from "../../../lib/format";
import PageHeader from "../../../components/ui/PageHeader";
import QuestionFilters from "../../../components/questions/QuestionFilters";
import StatusControl from "../../../components/questions/StatusControl";
import ErrorState from "../../../components/ui/ErrorState";
import EmptyState from "../../../components/ui/EmptyState";
import { PageSkeleton } from "../../../components/ui/Skeleton";
import Badge from "../../../components/ui/Badge";

function statusMap(feed) {
  const map = {};
  (feed || []).forEach((row) => {
    const id = row.question_id ?? row.question?.id;
    if (id) map[id] = row.status || "unsolved";
  });
  return map;
}

export default function ProgressPage() {
  const [filters, setFilters] = useState({ ...defaultQuestionFilters, sort: "title" });
  const state = useAsync(async () => {
    const [questions, feed, companies, roles, tags] = await Promise.all([
      listQuestions(),
      listQuestionStatuses(),
      listCompanies(),
      listJobRoles(),
      listTags(),
    ]);
    return { questions, statusByQuestion: statusMap(feed), companies, roles, tags };
  }, []);

  if (state.loading) return <PageSkeleton />;
  if (state.error) return <ErrorState error={state.error} onRetry={state.reload} />;

  const { questions, statusByQuestion, companies, roles, tags } = state.data;
  const visible = sortQuestions(
    filterQuestions(questions, { ...filters, statusByQuestion }),
    filters.sort,
  );

  return (
    <div>
      <PageHeader
        eyebrow="Preparation"
        title="Progress"
        description="Every published question has a status from the server, including ones you have not opened."
      />
      <div className="mt-6">
        <QuestionFilters
          filters={filters}
          onChange={setFilters}
          companies={companies}
          roles={roles}
          tags={tags}
          showStatus
        />
      </div>
      {visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Nothing matches" body="Change the filters or mark a question from its page." />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {visible.map((question) => {
            const status = statusByQuestion[question.id] || "unsolved";
            return (
              <article key={question.id} className="grid gap-4 rounded-2xl bg-canvas p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_240px] md:items-center">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={question.difficulty_level}>{difficultyLabel(question.difficulty_level)}</Badge>
                    {companyNames(question).slice(0, 2).map((name) => <Badge key={name}>{name}</Badge>)}
                  </div>
                  <Link to={`/questions/${question.id}`} className="mt-2 block text-lg text-ink">{question.title}</Link>
                </div>
                <StatusControl
                  questionId={question.id}
                  status={status}
                  onChanged={(next) => {
                    state.setData((current) => {
                      const nextMap = { ...current.statusByQuestion };
                      nextMap[question.id] = next;
                      return { ...current, statusByQuestion: nextMap };
                    });
                  }}
                />
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
