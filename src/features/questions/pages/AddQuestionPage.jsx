import PageHeader from "../../../components/ui/PageHeader";
import QuestionForm from "../../../components/questions/QuestionForm";

export default function AddQuestionPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Archive"
        title="Add a question"
        description="Write the prompt, then search companies, a role, and topics. A name that is not already listed can be added from the field."
      />
      <QuestionForm />
    </div>
  );
}
