import api, { emptyOn404 } from "./client";

export function listMyReports() {
  return emptyOn404(() => api.get("reports/"));
}

export function createReport(data) {
  return api.post("reports/", data);
}

export async function getMyReport(id) {
  const response = await api.get(`reports/${id}/`);
  return response.data;
}

export function updateMyReport(id, data) {
  return api.patch(`reports/${id}/`, data);
}

export function deleteMyReport(id) {
  return api.delete(`reports/${id}/`);
}
