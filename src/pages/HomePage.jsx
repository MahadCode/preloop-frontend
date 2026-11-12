import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function HomePage() {
  const authenticated = useSelector((state) => state.auth.status);

  return (
    <div>
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
            Technical interview workspace
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-light leading-tight tracking-tight text-ink sm:text-6xl">
            Prepare with the questions you actually intend to master.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-smoke">
            PrepLoop is where candidates collect interview questions, write solutions, discuss approaches, and keep a private record of what is solved, attempted, or still open.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={authenticated ? "/all-questions" : "/signup"}
              className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 text-sm font-medium text-white"
            >
              {authenticated ? "Open the archive" : "Create an account"}
            </Link>
            <Link
              to={authenticated ? "/dashboard" : "/login"}
              className="inline-flex h-12 items-center justify-center rounded-full border border-stone px-6 text-sm font-medium text-graphite"
            >
              {authenticated ? "Preparation overview" : "Log in"}
            </Link>
          </div>
        </div>
        <div className="rounded-card border border-stone bg-taupe p-6 lg:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ash">How a session works</p>
          <ol className="mt-5 space-y-5">
            {[
              ["01", "Read a question", "Browse the archive by company, role, topic, and difficulty."],
              ["02", "Write the solution", "Keep your own write-up next to the prompt and the discussion."],
              ["03", "Mark the status", "Record solved, attempted, or unsolved, then check it against your goals."],
            ].map(([index, title, body]) => (
              <li key={index} className="flex gap-4">
                <span className="font-mono text-xs text-ash">{index}</span>
                <div>
                  <p className="text-ink">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-smoke">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="border-t border-stone">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-14 sm:px-8 md:grid-cols-3">
          {[
            ["Archive", "Questions carry a title, a written prompt, companies, a role, topics, and a difficulty."],
            ["Discussion", "Verified members can publish solutions, comment, reply, and report a problem."],
            ["Ledger", "Goals, progress, and statistics stay attached to your account."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-card border border-stone bg-paper p-6">
              <h2 className="text-2xl font-light tracking-tight text-ink">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-smoke">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
