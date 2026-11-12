import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import store from "./store/store.js";
import App from "./App.jsx";
import "./index.css";
import MarketingLayout from "./layouts/MarketingLayout.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import ShellChooser from "./layouts/ShellChooser.jsx";
import { RequireAuth, RequireGuest, RequireModerator, RequireVerified } from "./layouts/guards.jsx";
import HomePage from "./pages/HomePage.jsx";
import { AboutPage, NotFoundPage, PrivacyPage, SuspendedPage, TermsPage } from "./pages/StaticPages.jsx";
import LoginPage from "./features/auth/pages/LoginPage.jsx";
import SignupPage from "./features/auth/pages/SignupPage.jsx";
import VerificationEmailSentPage from "./features/auth/pages/VerificationEmailSentPage.jsx";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage.jsx";
import VerifyEmailPage from "./features/auth/pages/VerifyEmailPage.jsx";
import ProfilePage from "./features/auth/pages/ProfilePage.jsx";
import ChangePasswordPage from "./features/auth/pages/ChangePasswordPage.jsx";
import DeleteAccountPage from "./features/auth/pages/DeleteAccountPage.jsx";
import SettingsPage from "./features/auth/pages/SettingsPage.jsx";
import AllQuestionsPage from "./features/questions/pages/AllQuestionsPage.jsx";
import MyQuestionsPage from "./features/questions/pages/MyQuestionsPage.jsx";
import CompanyQuestionsPage from "./features/questions/pages/CompanyQuestionsPage.jsx";
import AddQuestionPage from "./features/questions/pages/AddQuestionPage.jsx";
import EditQuestionPage from "./features/questions/pages/EditQuestionPage.jsx";
import QuestionPage from "./features/questions/pages/QuestionPage.jsx";
import { AddSolutionPage, EditSolutionPage } from "./features/discussion/pages/SolutionPages.jsx";
import AllSolutionsPage from "./features/discussion/pages/AllSolutionsPage.jsx";
import ReportQuestionPage from "./features/reports/pages/ReportQuestionPage.jsx";
import MyReportsPage from "./features/reports/pages/MyReportsPage.jsx";
import DashboardPage from "./features/dashboard/pages/DashboardPage.jsx";
import GoalsPage from "./features/dashboard/pages/GoalsPage.jsx";
import ProgressPage from "./features/dashboard/pages/ProgressPage.jsx";
import StatisticsPage from "./features/dashboard/pages/StatisticsPage.jsx";
import PracticePage from "./features/dashboard/pages/PracticePage.jsx";
import TaxonomyPage from "./features/taxonomy/pages/TaxonomyPage.jsx";
import ModerationPage from "./features/moderation/pages/ModerationPage.jsx";
import ModerationReportPage from "./features/moderation/pages/ModerationReportPage.jsx";
import PendingQuestionPage from "./features/moderation/pages/PendingQuestionPage.jsx";
import NotificationsPage from "./features/notifications/pages/NotificationsPage.jsx";

function guest(element) {
  return <RequireGuest>{element}</RequireGuest>;
}

function account(element) {
  return <RequireAuth>{element}</RequireAuth>;
}

function verified(element) {
  return (
    <RequireAuth>
      <RequireVerified>{element}</RequireVerified>
    </RequireAuth>
  );
}

function moderator(element) {
  return (
    <RequireAuth>
      <RequireVerified>
        <RequireModerator>{element}</RequireModerator>
      </RequireVerified>
    </RequireAuth>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <MarketingLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "about", element: <AboutPage /> },
          { path: "privacy", element: <PrivacyPage /> },
          { path: "terms", element: <TermsPage /> },
          { path: "login", element: guest(<LoginPage />) },
          { path: "signup", element: guest(<SignupPage />) },
          { path: "forgot-password", element: <ForgotPasswordPage /> },
          { path: "reset-password/:token", element: <ResetPasswordPage /> },
          { path: "verification-email-sent", element: <VerificationEmailSentPage /> },
          { path: "verify-email/:token", element: <VerifyEmailPage /> },
        ],
      },
      {
        element: <AppLayout />,
        children: [
          { path: "all-questions", element: account(<AllQuestionsPage />) },
          { path: "my-questions", element: account(<MyQuestionsPage />) },
          { path: "questions/company/:companyId", element: verified(<CompanyQuestionsPage />) },
          { path: "add-question", element: verified(<AddQuestionPage />) },
          { path: "questions/:questionId", element: verified(<QuestionPage />) },
          { path: "questions/:id/edit", element: verified(<EditQuestionPage />) },
          { path: "questions/:questionId/submit-solution", element: verified(<AddSolutionPage />) },
          { path: "questions/:questionId/solutions", element: verified(<AllSolutionsPage />) },
          { path: "questions/:questionId/solutions/:solutionId/edit", element: verified(<EditSolutionPage />) },
          { path: "questions/:questionId/report", element: verified(<ReportQuestionPage />) },
          { path: "profile", element: account(<ProfilePage />) },
          { path: "settings", element: account(<SettingsPage />) },
          { path: "change-password", element: account(<ChangePasswordPage />) },
          { path: "delete-account", element: account(<DeleteAccountPage />) },
          { path: "account-suspended", element: account(<SuspendedPage />) },
          { path: "dashboard", element: verified(<DashboardPage />) },
          { path: "dashboard/goals", element: verified(<GoalsPage />) },
          { path: "dashboard/progress", element: verified(<ProgressPage />) },
          { path: "dashboard/statistics", element: verified(<StatisticsPage />) },
          { path: "practice", element: verified(<PracticePage />) },
          { path: "taxonomy", element: verified(<TaxonomyPage />) },
          { path: "reports", element: verified(<MyReportsPage />) },
          { path: "notifications", element: account(<NotificationsPage />) },
          { path: "moderation", element: moderator(<ModerationPage />) },
          { path: "moderation/reports/:id", element: moderator(<ModerationReportPage />) },
          { path: "moderation/questions/:id", element: moderator(<PendingQuestionPage />) },
        ],
      },
      {
        element: <ShellChooser />,
        children: [{ path: "*", element: <NotFoundPage /> }],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
