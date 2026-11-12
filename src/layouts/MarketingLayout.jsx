import { Link, NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition ${isActive ? "text-ink" : "text-smoke hover:text-ink"}`;

export default function MarketingLayout() {
  const authenticated = useSelector((state) => state.auth.status);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-stone bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="text-lg font-medium tracking-tight text-ink">
            PrepLoop
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <NavLink to="/about" className={linkClass}>
              About
            </NavLink>
            {authenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-sm font-medium text-white"
              >
                Workspace
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-graphite hover:text-ink">
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-sm font-medium text-white"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-stone">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-4">
          <div>
            <p className="text-lg font-medium text-ink">PrepLoop</p>
            <p className="mt-2 text-sm leading-6 text-smoke">
              A workspace for collecting interview questions, writing solutions, and tracking what you have solved.
            </p>
          </div>
          <FooterColumn
            title="Study"
            links={[
              ["/all-questions", "Question archive"],
              ["/dashboard", "Preparation overview"],
              ["/practice", "Practice queue"],
            ]}
          />
          <FooterColumn
            title="Account"
            links={[
              ["/login", "Log in"],
              ["/signup", "Create account"],
              ["/forgot-password", "Reset password"],
            ]}
          />
          <FooterColumn
            title="About"
            links={[
              ["/about", "About PrepLoop"],
              ["/privacy", "Privacy"],
              ["/terms", "Terms"],
            ]}
          />
        </div>
        <div className="border-t border-stone px-5 py-4 text-center font-mono text-[11px] uppercase tracking-wider text-ash">
          PrepLoop
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ash">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="text-sm text-graphite hover:text-ink">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
