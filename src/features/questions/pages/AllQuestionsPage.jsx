import { useCallback } from "react";
import { listQuestions } from "../../../api/questions";
import QuestionArchive from "../../../components/questions/QuestionArchive";

export default function AllQuestionsPage() {
  const loader = useCallback(() => listQuestions(), []);
  return (
    <QuestionArchive
      eyebrow="Archive"
      title="All questions"
      description="Published questions from the server. Search and filters run in the browser on that list."
      loader={loader}
    />
  );
}
