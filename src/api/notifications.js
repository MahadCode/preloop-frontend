import api, { normalizeList } from "./client";

export async function listNotifications() {
  const response = await api.get("notifications/");
  return normalizeList(response.data);
}

export function updateNotification(id, data) {
  return api.patch(`notifications/${id}/`, data);
}

export function markAllNotificationsRead() {
  return api.post("notifications/read-all/");
}
