import { useState } from "react";
import { createReport } from "../../api/reports";
import { getErrorMessage } from "../../lib/errors";
import Modal from "../ui/Modal";
import { TextArea } from "../ui/Field";
import Button from "../ui/Button";
import { useToast } from "../ui/Toast";

export default function ReportDialog({ open, onClose, target }) {
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
    setError("");
    try {
      await createReport({ reason: reason.trim(), ...target });
      toast({ title: "Report submitted" });
      setReason("");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "The report could not be submitted."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Report this" onClose={submitting ? undefined : onClose}>
      <form onSubmit={submit} className="space-y-4">
        {error && <p className="text-sm text-danger">{error}</p>}
        <TextArea label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" loading={submitting}>Submit report</Button>
        </div>
      </form>
    </Modal>
  );
}
