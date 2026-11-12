import { Link } from "react-router-dom";
import { companyNames, difficultyLabel, displayName, jobRoleLabel, statusLabel, tagNames } from "../../lib/format";
import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";

function excerpt(html) {
  if (!html) return "";
  const text = new DOMParser().parseFromString(html, "text/html").body.textContent || "";
  return text.replace(/\s+/g, " ").trim();
}

export default function QuestionCard({ question, locked = false, lockedMessage, status }) {
  const companies = companyNames(question);
  const summary = excerpt(question.description);
  const body = (
    <article className="flex h-full flex-col rounded-2xl bg-canvas p-5 shadow-sm transition hover:bg-taupe/50">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wide text-smoke">
          {companies[0] || "Question"}
          {jobRoleLabel(question) ? ` · ${jobRoleLabel(question)}` : ""}
        </span>
        <span className="flex flex-wrap gap-1.5">
          <Badge tone={question.difficulty_level || "neutral"}>{difficultyLabel(question.difficulty_level)}</Badge>
          {question.status && question.status !== "published" && <Badge>{statusLabel(question.status)}</Badge>}
          {status && <Badge tone={status === "solved" ? "violet" : "neutral"}>{statusLabel(status)}</Badge>}
        </span>
      </div>
      <h2 className="mt-4 text-[22px] font-light leading-7 tracking-tight text-ink">{question.title}</h2>
      {summary && <p className="mt-2 line-clamp-2 text-sm leading-6 text-graphite">{summary}</p>}
      {tagNames(question).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tagNames(question).map((name) => (
            <span key={name} className="rounded-full bg-[#f4f3f3] px-2.5 py-1 text-xs text-graphite">{name}</span>
          ))}
        </div>
      )}
      <div className="mt-auto flex items-center gap-2 pt-5">
        <Avatar user={question.author} size="xs" />
        <span className="text-sm text-smoke">{question.author ? displayName(question.author) : "Unknown author"}</span>
      </div>
    </article>
  );

  if (locked) {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none blur-[2px]">{body}</div>
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#faf9f9]/70 p-4 text-center">
          <p className="text-sm text-ink">
            {lockedMessage || "Verify your email to open this question."}{" "}
            {lockedMessage ? null : (
              <Link to="/verification-email-sent" state={{ from: "verify-email", redirectTo: `/questions/${question.id}` }} className="underline">
                Resend the email
              </Link>
            )}
          </p>
        </div>
      </div>
    );
  }

  return <Link to={`/questions/${question.id}`} className="block h-full">{body}</Link>;
}
