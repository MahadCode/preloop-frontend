import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, ChevronDown, ChevronUp, Flag, Pencil, SquarePen, Trash2 } from "lucide-react";
import {
  castVote,
  deleteQuestion,
  getQuestion,
  getQuestionStatus,
  getVotes,
  listQuestions,
} from "../../../api/questions";
import { listSolutions } from "../../../api/solutions";
import { listQuestionComments } from "../../../api/comments";
import { useAsync } from "../../../lib/useAsync";
import { companyNames, difficultyLabel, displayName, formatDate, jobRoleLabel, statusLabel, tagNames } from "../../../lib/format";
import { questionIds } from "../../../lib/questions";
import { getErrorMessage } from "../../../lib/errors";
import Prose from "../../../components/ui/Prose";
import ErrorState from "../../../components/ui/ErrorState";
import { PageSkeleton } from "../../../components/ui/Skeleton";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import Avatar from "../../../components/ui/Avatar";
import { useToast } from "../../../components/ui/Toast";
import StatusControl from "../../../components/questions/StatusControl";
import CommentSection from "../../../components/discussion/CommentSection";
import ReportDialog from "../../../components/discussion/ReportDialog";

function plainText(html) {
  if (!html) return "";
  const document = new DOMParser().parseFromString(html, "text/html");
  return (document.body.textContent || "").replace(/\s+/g, " ").trim();
}

function sharesTaxonomy(question, other) {
  const tags = new Set([...questionIds(question.tag), ...questionIds(question.tag_full)]);
  const companies = new Set([...questionIds(question.company), ...questionIds(question.company_full)]);
  const otherTags = [...questionIds(other.tag), ...questionIds(other.tag_full)];
  const otherCompanies = [...questionIds(other.company), ...questionIds(other.company_full)];
  return otherTags.some((id) => tags.has(id)) || otherCompanies.some((id) => companies.has(id));
}

export default function QuestionPage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useSelector((state) => state.auth.userData);
  const [confirming, setConfirming] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [votePending, setVotePending] = useState(false);
  const [localVote, setLocalVote] = useState(undefined);

  const questionState = useAsync(() => getQuestion(questionId), [questionId]);
  const voteState = useAsync(() => getVotes(questionId), [questionId]);
  const solutionState = useAsync(() => listSolutions(questionId), [questionId]);
  const commentState = useAsync(() => listQuestionComments(questionId), [questionId]);
  const statusState = useAsync(() => getQuestionStatus(questionId), [questionId]);
  const archiveState = useAsync(() => listQuestions(), [questionId]);

  if (questionState.loading) return <PageSkeleton />;
  if (questionState.error) return <ErrorState error={questionState.error} onRetry={questionState.reload} />;

  const question = questionState.data;
  const mine = user?.id && question.author?.id === user.id;
  const companies = companyNames(question);
  const tags = tagNames(question);
  const role = jobRoleLabel(question);
  const crumb = tags[0] || companies[0] || "General";
  const userVote = localVote !== undefined ? localVote : voteState.data?.user_vote;
  const solutions = solutionState.data || [];
  const featured = solutions.slice(0, 2);
  const related = (archiveState.data || [])
    .filter((item) => item.id !== question.id && sharesTaxonomy(question, item))
    .slice(0, 3);
  const marked = formatDate(statusState.data?.updated_at);
  const reference = `Q // ${String(question.id).padStart(4, "0")}`;

  const vote = async (voteType) => {
    setVotePending(true);
    try {
      const response = await castVote(questionId, voteType);
      const removed = /removed/i.test(response.data?.message || "");
      setLocalVote(removed ? null : response.data?.vote_type || voteType);
      await voteState.reload();
    } catch (error) {
      toast({ tone: "danger", message: getErrorMessage(error, "The vote could not be saved.") });
    } finally {
      setVotePending(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await deleteQuestion(questionId);
      toast({ title: "Question deleted" });
      navigate("/all-questions");
    } catch (error) {
      toast({ tone: "danger", message: getErrorMessage(error, "The question could not be deleted.") });
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div className="-mx-4 -my-8 bg-[#faf9f9] px-4 py-8 sm:-mx-6 sm:-my-10 sm:px-6 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <nav className="flex min-w-0 items-center gap-2 font-mono text-[13px] text-smoke">
          <Link to="/all-questions" className="hover:text-ink">Questions</Link>
          <span className="text-ash">/</span>
          <span className="truncate text-ink">{crumb}</span>
        </nav>
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em]">
          <span className="text-ash">{reference}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-violet" />
          <span className="text-smoke">{difficultyLabel(question.difficulty_level)} tier</span>
        </div>
      </div>

      <section className="flex flex-col gap-6 pb-8">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <h1 className="max-w-4xl text-[36px] font-light leading-none tracking-tight text-ink md:text-[56px] md:leading-[64px]">
              {question.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-[#e1dfdd] px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-graphite">
                {difficultyLabel(question.difficulty_level)} tier
              </span>
              {companies.map((name) => (
                <span key={name} className="rounded-full bg-taupe px-3 py-1 text-xs font-medium text-ink">{name}</span>
              ))}
              {role && (
                <span className="rounded-full bg-taupe px-3 py-1 text-xs text-graphite">Role: {role}</span>
              )}
              {tags.map((name) => (
                <span key={name} className="rounded-full bg-[#f4f3f3] px-3 py-1 font-mono text-[11px] text-smoke">#{name}</span>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3 pt-1">
            <div className="inline-flex items-center rounded-full bg-taupe p-1 shadow-sm">
              <button
                type="button"
                title="Upvote"
                disabled={votePending}
                aria-pressed={userVote === "upvote"}
                onClick={() => vote("upvote")}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#f4f3f3] disabled:opacity-50 ${
                  userVote === "upvote" ? "text-violet" : "text-graphite hover:text-violet"
                }`}
              >
                <ChevronUp size={18} />
              </button>
              <span className="px-2 font-mono text-[13px] font-medium text-ink">{voteState.data?.score ?? 0}</span>
              <button
                type="button"
                title="Downvote"
                disabled={votePending}
                aria-pressed={userVote === "downvote"}
                onClick={() => vote("downvote")}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#f4f3f3] disabled:opacity-50 ${
                  userVote === "downvote" ? "text-ember" : "text-graphite hover:text-ember"
                }`}
              >
                <ChevronDown size={18} />
              </button>
            </div>
            {mine && (
              <Link
                to={`/questions/${questionId}/edit`}
                title="Edit question"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-taupe text-graphite shadow-sm transition hover:bg-[#e1dfdd]"
              >
                <Pencil size={18} />
              </Link>
            )}
            {mine && (
              <button
                type="button"
                title="Delete question"
                onClick={() => setConfirming(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-taupe text-smoke shadow-sm transition hover:text-danger"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="button"
              title="Report question"
              onClick={() => setReporting(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-taupe text-smoke shadow-sm transition hover:text-danger"
            >
              <Flag size={16} />
            </button>
            <Link
              to={`/questions/${questionId}/submit-solution`}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white shadow-sm transition hover:bg-[#1b1b1b]"
            >
              <SquarePen size={16} />
              Submit solution
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-taupe px-4 py-3 text-[13px] text-smoke">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar user={question.author} size="xs" />
            <span className="font-medium text-graphite">{displayName(question.author)}</span>
            {question.author?.username && (
              <>
                <span className="text-ash">·</span>
                <span className="font-mono text-[11px]">@{question.author.username}</span>
              </>
            )}
            {question.author?.bio && (
              <>
                <span className="text-ash">·</span>
                <span className="truncate">{question.author.bio}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-5 font-mono text-[11px]">
            <span>{solutions.length} {solutions.length === 1 ? "solution" : "solutions"}</span>
            <span>{(commentState.data || []).length} {(commentState.data || []).length === 1 ? "comment" : "comments"}</span>
            <span>Score {voteState.data?.score ?? 0}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-10 lg:col-span-8">
          <article className="flex flex-col gap-6 rounded-2xl bg-canvas p-6 shadow-sm sm:p-10">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-violet">Question</span>
              <div className="h-px flex-1 bg-[#eeeeee]" />
            </div>
            <Prose html={question.description} className="text-[17px] leading-7" />
          </article>

          <section className="flex flex-col gap-6">
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <h2 className="text-[28px] font-light tracking-[-0.015em] text-ink">Solutions</h2>
                <span className="font-mono text-[13px] text-smoke">({solutions.length} submitted)</span>
              </div>
              <Link to={`/questions/${questionId}/solutions`} className="inline-flex items-center gap-1 text-sm font-medium text-violet hover:underline">
                View all solutions
                <ArrowRight size={16} />
              </Link>
            </div>
            {solutionState.loading && <p className="text-sm text-smoke">Loading solutions...</p>}
            {solutionState.error && <ErrorState error={solutionState.error} onRetry={solutionState.reload} />}
            {solutionState.data && featured.length === 0 && (
              <div className="rounded-2xl bg-taupe p-6 text-sm text-smoke shadow-sm">
                No solutions yet. Write the first one from Submit solution.
              </div>
            )}
            {featured.map((solution) => {
              const excerpt = plainText(solution.content);
              const when = formatDate(solution.created_at);
              return (
                <article key={solution.id} className="flex flex-col gap-4 rounded-2xl bg-taupe p-6 shadow-sm transition hover:bg-[#e1dfdd]/40 sm:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={solution.author} size="sm" />
                      <div>
                        <div className="text-sm font-medium text-ink">{displayName(solution.author)}</div>
                        {when && <div className="font-mono text-[11px] text-smoke">{when}</div>}
                      </div>
                    </div>
                  </div>
                  <p className="line-clamp-3 text-[15px] leading-6 text-graphite">
                    {excerpt || "This solution has no text yet."}
                  </p>
                  <div className="flex justify-end">
                    <Link
                      to={`/questions/${questionId}/solutions#solution-${solution.id}`}
                      className="text-xs font-medium text-ink hover:underline"
                    >
                      Read solution →
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>

          {commentState.loading && <p className="text-sm text-smoke">Loading discussion...</p>}
          {commentState.error && <ErrorState error={commentState.error} onRetry={commentState.reload} />}
          {commentState.data && (
            <CommentSection
              questionId={questionId}
              questionAuthorId={question.author?.id}
              comments={commentState.data}
              onChange={commentState.setData}
            />
          )}
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:col-span-4">
          <div className="flex flex-col gap-4 rounded-2xl bg-canvas p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-ash">Your status</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-violet">
                <span className="h-2 w-2 rounded-full bg-violet" />
                {statusLabel(statusState.data?.status || "unsolved")}
              </span>
            </div>
            <StatusControl
              variant="segmented"
              questionId={questionId}
              status={statusState.data?.status || "unsolved"}
              onChanged={() => statusState.reload()}
            />
            {marked && (
              <div className="flex items-center justify-between border-t border-stone pt-3 text-[13px] text-graphite">
                <span>Updated</span>
                <span className="font-mono text-[11px] font-medium text-ink">{marked}</span>
              </div>
            )}
          </div>

          {related.length > 0 && (
            <div className="flex flex-col gap-4 rounded-2xl bg-taupe p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-ash">Adjacent questions</span>
                <Link to="/all-questions" className="font-mono text-[11px] text-violet hover:underline">Archive</Link>
              </div>
              <div className="flex flex-col gap-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    to={`/questions/${item.id}`}
                    className="group flex flex-col gap-1 rounded-xl bg-canvas p-3 shadow-sm transition hover:bg-[#e1dfdd]/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-smoke">#{item.id}</span>
                      <span className="rounded-full bg-taupe px-2 py-0.5 font-mono text-[11px] text-graphite">
                        {difficultyLabel(item.difficulty_level)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-ink transition group-hover:text-violet">{item.title}</span>
                    {companyNames(item)[0] && (
                      <span className="font-mono text-[11px] text-smoke">{companyNames(item)[0]}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl bg-canvas px-6 py-4 font-mono text-[11px] text-smoke shadow-sm">
            <span>Question</span>
            <span className="font-medium text-graphite">#{question.id}</span>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Delete this question?"
        body="The question is removed from the archive."
        confirmLabel="Delete question"
        loading={deleting}
        onConfirm={remove}
        onClose={() => setConfirming(false)}
      />
      <ReportDialog open={reporting} onClose={() => setReporting(false)} target={{ question: Number(questionId) }} />
    </div>
  );
}
