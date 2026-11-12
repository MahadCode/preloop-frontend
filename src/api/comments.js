import api, { normalizeList } from "./client";

export async function listQuestionComments(questionId) {
  const response = await api.get(`questions/${questionId}/comments/`);
  return normalizeList(response.data);
}

export async function listSolutionComments(solutionId) {
  const response = await api.get(`solutions/${solutionId}/comments/`);
  return normalizeList(response.data);
}

export function createComment(data) {
  return api.post("comments/", data);
}

export function updateComment(id, data) {
  return api.patch(`comments/${id}/`, data);
}

export function deleteComment(id) {
  return api.delete(`comments/${id}/`);
}
