import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUnauthorizedHandler } from "./api/client";
import { ensureCsrf, getCurrentUser } from "./api/auth";
import { login, logout } from "./features/auth/authSlice";
import store from "./store/store";
import { ToastProvider } from "./components/ui/Toast";

export default function App() {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      const wasAuthenticated = store.getState().auth.status;
      store.dispatch(logout());
      if (wasAuthenticated && !window.location.pathname.startsWith("/login")) {
        const next = `${window.location.pathname}${window.location.search}`;
        window.location.assign(`/login?next=${encodeURIComponent(next)}`);
      }
    });

    const boot = async () => {
      try {
        await ensureCsrf();
        const userData = await getCurrentUser({ skipAuthRedirect: true });
        dispatch(login({ userData }));
      } catch {
        dispatch(logout());
      } finally {
        setReady(true);
      }
    };

    boot();
  }, [dispatch]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-smoke">Opening PrepLoop</p>
      </div>
    );
  }

  return (
    <ToastProvider>
      <Outlet />
    </ToastProvider>
  );
}
