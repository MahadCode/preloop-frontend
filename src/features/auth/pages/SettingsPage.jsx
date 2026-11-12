import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import PageHeader from "../../../components/ui/PageHeader";

const links = [
  ["/profile", "Profile", "Name, phone, username, and bio."],
  ["/change-password", "Password", "Replace the password on this account."],
  ["/verification-email-sent", "Email verification", "Request the verification message again."],
  ["/delete-account", "Delete account", "Remove the account with your username and password."],
];

export default function SettingsPage() {
  const user = useSelector((state) => state.auth.userData);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description={`${user?.email || "This account"} · ${user?.account_status || "unknown status"}`}
      />
      <div className="mt-8 divide-y divide-stone overflow-hidden rounded-card border border-stone bg-paper">
        {links.map(([to, title, body]) => (
          <Link key={to} to={to} state={to.includes("verification") ? { from: "verify-email" } : undefined} className="block px-5 py-4 hover:bg-taupe">
            <p className="text-ink">{title}</p>
            <p className="mt-1 text-sm text-smoke">{body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
