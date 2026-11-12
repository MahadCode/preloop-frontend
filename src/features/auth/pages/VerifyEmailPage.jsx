import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser, verifyEmail } from "../../../api/auth";
import { login } from "../authSlice";
import { getErrorMessage } from "../../../lib/errors";
import { AuthCard } from "./LoginPage";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const authenticated = useSelector((state) => state.auth.status);
  const [message, setMessage] = useState("Checking the verification link...");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    verifyEmail(token)
      .then(async (response) => {
        if (!active) return;
        setMessage(response.data?.message || "Email verification finished.");
        if (authenticated) {
          try {
            const userData = await getCurrentUser();
            dispatch(login({ userData }));
          } catch {
            // The link can succeed before a session exists.
          }
        }
      })
      .catch((error) => {
        if (!active) return;
        setFailed(true);
        setMessage(getErrorMessage(error, "This verification link could not be used."));
      });
    return () => {
      active = false;
    };
  }, [token, authenticated, dispatch]);

  return (
    <AuthCard title="Email verification" subtitle={message}>
      <p className="text-sm">
        {failed ? (
          <Link to="/verification-email-sent" state={{ from: "verify-email" }} className="text-ink underline">
            Request another email
          </Link>
        ) : (
          <Link to={authenticated ? "/dashboard" : "/login"} className="text-ink underline">
            Continue
          </Link>
        )}
      </p>
    </AuthCard>
  );
}
