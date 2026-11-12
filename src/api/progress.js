import api, { normalizeList } from "./client";

export async function listGoals() {
  const response = await api.get("progress/goals/");
  return normalizeList(response.data);
}

export async function getGoal(id) {
  const response = await api.get(`progress/goals/${id}/`);
  return response.data;
}

export function createGoal(data) {
  return api.post("progress/goals/", data);
}

export function updateGoal(id, data) {
  return api.patch(`progress/goals/${id}/`, data);
}

export function deleteGoal(id) {
  return api.delete(`progress/goals/${id}/`);
}

export async function getStatistics() {
  const response = await api.get("progress/statistics/");
  return response.data;
}
