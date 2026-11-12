import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { listCompanies, listJobRoles, listTags } from "../../api/taxonomy";
import { useAsync } from "../../lib/useAsync";
import { defaultQuestionFilters, filterQuestions, sortQuestions } from "../../lib/questions";
import PageHeader from "../ui/PageHeader";
import ErrorState from "../ui/ErrorState";
import EmptyState from "../ui/EmptyState";
import { PageSkeleton } from "../ui/Skeleton";
import QuestionCard from "./QuestionCard";
import QuestionFilters from "./QuestionFilters";

export default function QuestionArchive({
  title,
  eyebrow,
  description,
  loader,
  authorId,
  statusByQuestion,
  showStatus = false,
}) {
  const user = useSelector((state) => state.auth.userData);
  const verified = user?.account_status === "active";
  const suspended = user?.account_status === "suspended";
  const [filters, setFilters] = useState({ ...defaultQuestionFilters, status: "all" });
  const questionsState = useAsync(loader, [loader]);
  const taxonomy = useAsync(
    () => Promise.all([listCompanies(), listJobRoles(), listTags()]).then(([companies, roles, tags]) => ({ companies, roles, tags })),
    [],
  );

  const visible = useMemo(() => {
    const filtered = filterQuestions(questionsState.data || [], {
      ...filters,
      authorId,
      statusByQuestion,
    });
    return sortQuestions(filtered, filters.sort);
  }, [questionsState.data, filters, authorId, statusByQuestion]);

  return (
    <div>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-6">
        <QuestionFilters
          filters={filters}
          onChange={setFilters}
          companies={taxonomy.data?.companies || []}
          roles={taxonomy.data?.roles || []}
          tags={taxonomy.data?.tags || []}
          showStatus={showStatus}
        />
      </div>
      <div className="mt-6">
        {questionsState.loading && <PageSkeleton />}
        {questionsState.error && (
          <ErrorState error={questionsState.error} onRetry={questionsState.reload} />
        )}
        {questionsState.data && visible.length === 0 && (
          <EmptyState
            title="No questions match"
            body="Nothing in the current response matches these filters."
          />
        )}
        {visible.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                locked={!verified}
                lockedMessage={suspended ? "This account is suspended, so questions stay closed." : ""}
                status={statusByQuestion?.[question.id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
