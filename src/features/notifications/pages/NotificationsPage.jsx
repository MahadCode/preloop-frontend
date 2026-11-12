import { listNotifications, markAllNotificationsRead, updateNotification } from "../../../api/notifications";
import { useAsync } from "../../../lib/useAsync";
import { formatDate, notificationLabel } from "../../../lib/format";
import { getErrorMessage } from "../../../lib/errors";
import PageHeader from "../../../components/ui/PageHeader";
import ErrorState from "../../../components/ui/ErrorState";
import EmptyState from "../../../components/ui/EmptyState";
import { PageSkeleton } from "../../../components/ui/Skeleton";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { useToast } from "../../../components/ui/Toast";

export default function NotificationsPage() {
  const toast = useToast();
  const state = useAsync(() => listNotifications(), []);

  const markOne = async (item) => {
    try {
      const response = await updateNotification(item.id, { is_read: true });
      state.setData((current) => current.map((row) => (row.id === item.id ? { ...row, ...response.data } : row)));
    } catch (error) {
      toast({ tone: "danger", message: getErrorMessage(error) });
    }
  };

  const markAll = async () => {
    try {
      await markAllNotificationsRead();
      state.setData((current) => (current || []).map((row) => ({ ...row, is_read: true })));
      toast({ title: "All notifications marked read" });
    } catch (error) {
      toast({ tone: "danger", message: getErrorMessage(error, "Mark-all is not available from the server yet.") });
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Replies, solutions, moderation, and goal updates for this account."
        actions={<Button variant="secondary" onClick={markAll}>Mark all read</Button>}
      />
      <div className="mt-8">
        {state.loading && <PageSkeleton />}
        {state.error && (
          <ErrorState
            title="Notifications are not available"
            error={state.error}
            onRetry={state.reload}
          />
        )}
        {state.data && state.data.length === 0 && (
          <EmptyState title="Inbox is empty" body="The server returned no notifications." />
        )}
        <ul className="space-y-3">
          {(state.data || []).map((item) => (
            <li key={item.id} className="flex flex-col gap-3 rounded-2xl border border-stone bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone={item.is_read ? "neutral" : "violet"}>{item.is_read ? "Read" : "Unread"}</Badge>
                  <span className="text-sm text-ink">{notificationLabel(item.type)}</span>
                </div>
                <p className="mt-2 font-mono text-[11px] text-ash">
                  {item.reference_type} {item.reference_id}
                  {formatDate(item.created_at) ? ` · ${formatDate(item.created_at)}` : ""}
                </p>
              </div>
              {!item.is_read && (
                <Button size="sm" variant="secondary" onClick={() => markOne(item)}>Mark read</Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
