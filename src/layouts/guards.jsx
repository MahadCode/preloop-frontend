import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export function RequireAuth({ children }) {
  const status = useSelector((state) => state.auth.status);
  const location = useLocation();
  if (!status) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }
  return children;
}

export function RequireGuest({ children }) {
  const status = useSelector((state) => state.auth.status);
  if (status) return <Navigate to="/dashboard" replace />;
  return children;
}

export function RequireVerified({ children }) {
  const user = useSelector((state) => state.auth.userData);
  const location = useLocation();
  if (user?.account_status === "suspended") {
    return <Navigate to="/account-suspended" replace />;
  }
  if (user?.account_status !== "active") {
    return (
      <Navigate
        to="/verification-email-sent"
        replace
        state={{ from: "verify-email", redirectTo: location.pathname }}
      />
    );
  }
  return children;
}

export function RequireModerator({ children }) {
  const user = useSelector((state) => state.auth.userData);
  if (user?.role !== "moderator" && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
