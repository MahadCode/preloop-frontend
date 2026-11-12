import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Menu, X } from "lucide-react";
import { logout as logoutRequest } from "../api/auth";
import { logout } from "../features/auth/authSlice";
import { displayName } from "../lib/format";
import { useToast } from "../components/ui/Toast";
import { getErrorMessage } from "../lib/errors";
import Avatar from "../components/ui/Avatar";

const nav = [
  ["/all-questions", "Questions"],
  ["/dashboard/progress", "Progress"],
  ["/dashboard/goals", "Goals"],
  ["/dashboard/statistics", "Statistics"],
  ["/practice", "Practice"],
  ["/taxonomy", "Taxonomy"],
];

export default function AppLayout() {
  const user = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const verified = user?.account_status === "active";
  const moderator = user?.role === "moderator" || user?.role === "admin";

  useEffect(() => {
    const onPointer = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  const signOut = async () => {
    try {
      await logoutRequest();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      toast({ tone: "danger", message: getErrorMessage(error, "Could not log out.") });
    }
  };

  const itemClass = ({ isActive }) =>
    `flex h-16 items-center border-b-2 pt-0.5 text-sm transition ${
      isActive ? "border-ink font-medium text-ink" : "border-transparent text-graphite hover:text-ink"
    }`;

  return (
    <div className="min-h-screen bg-[#faf9f9]">
      <header className="sticky top-0 z-30 border-b border-stone bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex h-16 items-center gap-8">
            <Link to={verified ? "/dashboard" : "/all-questions"} className="text-sm font-medium tracking-tight text-ink">
              PrepLoop
            </Link>
            <nav className="hidden h-16 items-center gap-6 lg:flex">
              {nav.map(([to, label]) => (
                <NavLink key={to} to={to} className={itemClass}>
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/add-question"
              className="hidden h-9 items-center rounded-full bg-ink px-4 text-sm font-medium text-white sm:inline-flex"
            >
              Add question
            </Link>
            <span className="hidden h-4 w-px bg-stone sm:block" />
            <Link
              to="/notifications"
              className="hidden rounded-full px-3 py-2 text-sm text-graphite hover:bg-taupe sm:inline"
            >
              Inbox
            </Link>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-stone bg-paper py-1 pl-1 pr-3"
                onClick={() => setMenuOpen((value) => !value)}
                aria-expanded={menuOpen}
                aria-label="Account menu"
              >
                <Avatar user={user} size="sm" />
                <span className="hidden text-left md:block">
                  <span className="block text-xs font-medium leading-4 text-ink">{displayName(user)}</span>
                  <span className="block font-mono text-[10px] uppercase tracking-wide text-smoke">
                    {verified ? "Verified" : user?.account_status === "suspended" ? "Suspended" : "Unverified"}
                  </span>
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-stone bg-paper p-2 shadow-lg">
                  <p className="px-3 py-2 text-xs text-smoke">{user?.email}</p>
                  <MenuLink to="/dashboard" onClick={() => setMenuOpen(false)}>Overview</MenuLink>
                  <MenuLink to="/my-questions" onClick={() => setMenuOpen(false)}>My questions</MenuLink>
                  <MenuLink to="/reports" onClick={() => setMenuOpen(false)}>My reports</MenuLink>
                  <MenuLink to="/settings" onClick={() => setMenuOpen(false)}>Settings</MenuLink>
                  {moderator && (
                    <MenuLink to="/moderation" onClick={() => setMenuOpen(false)}>Moderation</MenuLink>
                  )}
                  <button
                    type="button"
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-danger hover:bg-danger-soft"
                    onClick={signOut}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-taupe lg:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label="Open navigation"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="space-y-1 border-t border-stone px-4 py-3 lg:hidden">
            {nav.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm text-graphite hover:bg-taupe"
              >
                {label}
              </NavLink>
            ))}
            <Link to="/add-question" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm">
              Add question
            </Link>
            <Link to="/notifications" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm">
              Inbox
            </Link>
          </nav>
        )}
      </header>
      {!verified && user?.account_status !== "suspended" && (
        <div className="border-b border-stone bg-taupe px-4 py-3 text-sm text-graphite">
          Your email is not verified. Verified study tools stay locked until you confirm it.{" "}
          <Link to="/verification-email-sent" state={{ from: "verify-email" }} className="font-medium text-ink underline">
            Resend verification
          </Link>
        </div>
      )}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}

function MenuLink({ to, children, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="block rounded-xl px-3 py-2 text-sm text-graphite hover:bg-taupe">
      {children}
    </Link>
  );
}
