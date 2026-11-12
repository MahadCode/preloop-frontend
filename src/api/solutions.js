import api, { emptyOn404 } from "./client";

export function listSolutions(questionId) {
  return emptyOn404(() => api.get(`questions/${questionId}/solutions/`));
}

export async function getSolution(id) {
  const response = await api.get(`solutions/${id}/`);
  return response.data;
}

export function createSolution(questionId, data) {
  return api.post(`questions/${questionId}/solutions/`, data);
}

export function updateSolution(id, data) {
  return api.patch(`solutions/${id}/`, data);
}

export function deleteSolution(id) {
  return api.delete(`solutions/${id}/`);
}
