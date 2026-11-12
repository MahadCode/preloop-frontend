export function AboutPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-smoke">About</p>
      <h1 className="mt-3 text-4xl font-light tracking-tight text-ink">What PrepLoop is for</h1>
      <div className="mt-6 space-y-4 text-base leading-7 text-graphite">
        <p>
          PrepLoop is a study workspace for technical interviews. You keep the prompts you are working through, write solutions in your own words, and record whether each question is solved, attempted, or still open.
        </p>
        <p>
          Questions can be tied to companies, a job role, topics, and a difficulty. Other verified members can comment, reply, and submit their own solutions. Reports go to moderators, who can dismiss them, edit the content, or remove it.
        </p>
        <p>
          Preparation goals track a question count, a topic, or a company. Statistics summarize how your solved questions sit across difficulty, topic, and company. None of those figures are invented on this page. They appear only after your account loads them from the server.
        </p>
      </div>
    </article>
  );
}

export function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-smoke">Privacy</p>
      <h1 className="mt-3 text-4xl font-light tracking-tight text-ink">Privacy</h1>
      <div className="mt-6 space-y-4 text-base leading-7 text-graphite">
        <p>
          PrepLoop stores the account details you submit: username, name, email, phone, bio, and password. The password is sent only to create the account or to confirm a sensitive change. It is not kept in the browser after you leave the form.
        </p>
        <p>
          Your session is a cookie on the API host. The app also reads the CSRF cookie so it can submit changes. Questions, solutions, comments, goals, and preparation status are stored with your account.
        </p>
        <p>
          Email is used for verification and password recovery. You can delete the account from Settings by confirming your username and password. That request is sent to the account deletion endpoint.
        </p>
      </div>
    </article>
  );
}

export function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-smoke">Terms</p>
      <h1 className="mt-3 text-4xl font-light tracking-tight text-ink">Terms of use</h1>
      <div className="mt-6 space-y-4 text-base leading-7 text-graphite">
        <p>
          Use PrepLoop to prepare for interviews. Write questions and solutions that you have the right to share. Do not post someone else's private interview material, or content you are not prepared to have reviewed.
        </p>
        <p>
          Moderators can dismiss a report, edit a reported question, solution, or comment, or remove it. A removed question leaves the published archive. You can delete questions, solutions, and comments you authored.
        </p>
        <p>
          An unverified account can sign in and see the question list, but opening a question, adding content, and using the preparation tools requires a verified email. A suspended account cannot use those tools.
        </p>
      </div>
    </article>
  );
}

export function NotFoundPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-5 py-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-smoke">404</p>
      <h1 className="mt-3 text-4xl font-light tracking-tight text-ink">This page is not in PrepLoop.</h1>
      <p className="mt-3 text-sm text-smoke">The address does not match a screen in the app.</p>
    </div>
  );
}

export function SuspendedPage() {
  return (
    <article className="mx-auto w-full max-w-xl px-5 py-20">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ember">Account</p>
      <h1 className="mt-3 text-4xl font-light tracking-tight text-ink">This account is suspended.</h1>
      <p className="mt-4 text-sm leading-6 text-smoke">
        Signed-in study tools are unavailable while the account status is suspended. You can still review public pages. If this is unexpected, contact the person who administers this PrepLoop server.
      </p>
    </article>
  );
}
