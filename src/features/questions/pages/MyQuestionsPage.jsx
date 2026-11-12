import { useCallback } from "react";
import { useSelector } from "react-redux";
import { listMyQuestions } from "../../../api/questions";
import QuestionArchive from "../../../components/questions/QuestionArchive";

export default function MyQuestionsPage() {
  const userId = useSelector((state) => state.auth.userData?.id);
  const loader = useCallback(() => listMyQuestions(), []);
  return (
    <QuestionArchive
      eyebrow="Archive"
      title="My questions"
      description="Questions you wrote, including pending and removed rows. The publication status is on each card."
      loader={loader}
      authorId={userId}
    />
  );
}
