import { useParams } from "react-router-dom";
import { getQuestion } from "../../../api/questions";
import { useAsync } from "../../../lib/useAsync";
import PageHeader from "../../../components/ui/PageHeader";
import QuestionForm from "../../../components/questions/QuestionForm";
import ErrorState from "../../../components/ui/ErrorState";
import { PageSkeleton } from "../../../components/ui/Skeleton";

export default function EditQuestionPage() {
  const { id } = useParams();
  const state = useAsync(() => getQuestion(id), [id]);

  if (state.loading) return <PageSkeleton />;
  if (state.error) return <ErrorState error={state.error} onRetry={state.reload} />;

  return (
    <div>
      <PageHeader eyebrow="Archive" title="Edit question" description={state.data.title} />
      <QuestionForm initial={state.data} questionId={id} />
    </div>
  );
}
