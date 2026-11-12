import { useState } from "react";
import { useSelector } from "react-redux";
import { createComment, deleteComment, updateComment } from "../../api/comments";
import { displayName, formatDate } from "../../lib/format";
import { getErrorMessage } from "../../lib/errors";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { TextArea } from "../ui/Field";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useToast } from "../ui/Toast";
import ReportDialog from "./ReportDialog";

export default function CommentSection({ questionId, solutionId, questionAuthorId, comments, onChange }) {
  return (
    <section className="flex flex-col gap-6 pt-2">
      <h2 className="text-[28px] font-light tracking-[-0.015em] text-ink">Discussion</h2>
      <CommentForm
        onSubmit={async (content) => {
          const payload = solutionId
            ? { solution: Number(solutionId), content }
            : { question: Number(questionId), content };
          const response = await createComment(payload);
          onChange([...(comments || []), { ...response.data, replies: [] }]);
        }}
      />
      <div className="flex flex-col gap-4">
        {(comments || []).map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            comments={comments}
            questionAuthorId={questionAuthorId}
            onChange={onChange}
          />
        ))}
      </div>
    </section>
  );
}

function updateTree(comments, id, updater) {
  return (comments || []).map((comment) => {
    if (comment.id === id) return updater(comment);
    return { ...comment, replies: updateTree(comment.replies, id, updater) };
  });
}

function removeFromTree(comments, id) {
  return (comments || [])
    .filter((comment) => comment.id !== id)
    .map((comment) => ({ ...comment, replies: removeFromTree(comment.replies, id) }));
}

function CommentItem({ comment, comments, questionAuthorId, onChange, nested = false }) {
  const user = useSelector((state) => state.auth.userData);
  const toast = useToast();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content || "");
  const [confirming, setConfirming] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [pending, setPending] = useState(false);
  const mine = user?.id === comment.author?.id;
  const isQuestionAuthor = questionAuthorId && comment.author?.id === questionAuthorId;
  const when = formatDate(comment.created_at);

  const saveEdit = async () => {
    setPending(true);
    try {
      const response = await updateComment(comment.id, { content: draft });
      onChange(updateTree(comments, comment.id, (current) => ({ ...current, ...response.data })));
      setEditing(false);
      toast({ title: "Comment updated" });
    } catch (error) {
      toast({ tone: "danger", message: getErrorMessage(error) });
    } finally {
      setPending(false);
    }
  };

  const remove = async () => {
    setPending(true);
    try {
      await deleteComment(comment.id);
      onChange(removeFromTree(comments, comment.id));
      setConfirming(false);
      toast({ title: "Comment deleted" });
    } catch (error) {
      toast({ tone: "danger", message: getErrorMessage(error) });
    } finally {
      setPending(false);
    }
  };

  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar user={comment.author} size="xs" />
          <span className="truncate text-sm font-medium text-ink">{displayName(comment.author)}</span>
          {isQuestionAuthor && (
            <span className="rounded bg-[#eeeeee] px-1.5 font-mono text-[11px] font-medium text-violet">Author</span>
          )}
          {when && (
            <>
              <span className="text-ash">·</span>
              <span className="shrink-0 font-mono text-[11px] text-smoke">{when}</span>
            </>
          )}
        </div>
        <button
          type="button"
          className="shrink-0 text-xs text-smoke hover:text-ink"
          onClick={() => setReplying((value) => !value)}
        >
          Reply
        </button>
      </div>
      {editing ? (
        <div className="space-y-2 sm:pl-10">
          <TextArea value={draft} onChange={(event) => setDraft(event.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" onClick={saveEdit} loading={pending}>Save</Button>
            <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-[15px] leading-6 text-graphite sm:pl-10">{comment.content}</p>
      )}
      <div className="flex flex-wrap gap-4 font-mono text-[11px] text-smoke sm:pl-10">
        {mine && (
          <button type="button" className="hover:text-ink" onClick={() => setEditing(true)}>Edit</button>
        )}
        {mine && (
          <button type="button" className="hover:text-danger" onClick={() => setConfirming(true)}>Delete</button>
        )}
        <button type="button" className="hover:text-ink" onClick={() => setReporting(true)}>Report</button>
      </div>
      {replying && (
        <div className="sm:pl-10">
          <CommentForm
            compact
            placeholder="Write a reply"
            onSubmit={async (value) => {
              const response = await createComment({ reply_to: comment.id, content: value });
              const reply = { ...response.data, replies: [] };
              onChange(updateTree(comments, comment.id, (current) => ({
                ...current,
                replies: [...(current.replies || []), reply],
              })));
              setReplying(false);
            }}
          />
        </div>
      )}
      {comment.replies?.length > 0 && (
        <div className="mt-1 flex flex-col gap-4 border-l-2 border-stone pl-4 sm:ml-10">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              nested
              comment={reply}
              comments={comments}
              questionAuthorId={questionAuthorId}
              onChange={onChange}
            />
          ))}
        </div>
      )}
      <ConfirmDialog
        open={confirming}
        title="Delete this comment?"
        body="The comment is removed for everyone who can see this question."
        confirmLabel="Delete"
        loading={pending}
        onConfirm={remove}
        onClose={() => setConfirming(false)}
      />
      <ReportDialog open={reporting} onClose={() => setReporting(false)} target={{ comment: comment.id }} />
    </>
  );

  if (nested) {
    return <div className="flex flex-col gap-3">{content}</div>;
  }

  return <article className="flex flex-col gap-3 rounded-xl bg-canvas p-5 shadow-sm">{content}</article>;
}

function CommentForm({ onSubmit, placeholder, compact = false }) {
  const toast = useToast();
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!value.trim()) return;
    setPending(true);
    try {
      await onSubmit(value.trim());
      setValue("");
    } catch (error) {
      toast({ tone: "danger", message: getErrorMessage(error, "The comment could not be posted.") });
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className={compact ? "mt-2 flex flex-col gap-2" : "flex flex-col gap-3 rounded-2xl bg-canvas p-4 shadow-sm sm:p-5"}
    >
      <textarea
        value={value}
        rows={compact ? 2 : 3}
        placeholder={placeholder || "Add to this discussion. Mention an edge case, a constraint, or a trade-off."}
        onChange={(event) => setValue(event.target.value)}
        className="w-full resize-none bg-transparent text-[15px] leading-6 text-ink outline-none placeholder:text-ash"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center rounded-full bg-ink px-5 text-xs font-medium text-white transition hover:bg-[#1b1b1b] disabled:opacity-60"
        >
          {pending ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}
