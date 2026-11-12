import api, { normalizeList } from "./client";

export async function listModerationReports() {
  const response = await api.get("moderation/reports/");
  return normalizeList(response.data);
}

export async function getModerationReport(id) {
  const response = await api.get(`moderation/reports/${id}/`);
  return response.data;
}

export function moderateReport(id, data) {
  return api.patch(`moderation/reports/${id}/`, data);
}

export async function listPendingQuestions() {
  const response = await api.get("moderation/questions/");
  return normalizeList(response.data);
}

export function moderateQuestion(id, action) {
  return api.patch(`moderation/questions/${id}/`, { action });
}
