import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createReport } from "../../../api/reports";
import { getErrorMessage } from "../../../lib/errors";
import PageHeader from "../../../components/ui/PageHeader";
import { TextArea } from "../../../components/ui/Field";
import Button from "../../../components/ui/Button";
import { useToast } from "../../../components/ui/Toast";

export default function ReportQuestionPage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!reason.trim()) {
      setError("Describe the problem.");
      return;
    }
    setSubmitting(true);
    try {
      await createReport({ reason: reason.trim(), question: Number(questionId) });
      toast({ title: "Report submitted" });
      navigate(`/questions/${questionId}`);
    } catch (err) {
      setError(getErrorMessage(err, "The report could not be submitted."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow="Report" title="Report this question" description="Moderators see the reason with the question." />
      <form onSubmit={submit} className="mt-8 space-y-4">
        {error && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <TextArea label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />
        <Button type="submit" loading={submitting}>Submit report</Button>
      </form>
    </div>
  );
}
