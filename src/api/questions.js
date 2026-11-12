import api, { normalizeList } from "./client";

export async function listQuestions() {
  const response = await api.get("questions/");
  return normalizeList(response.data);
}

export async function listMyQuestions() {
  const response = await api.get("questions/mine/");
  return normalizeList(response.data);
}

export async function listQuestionStatuses() {
  const response = await api.get("questions/statuses/");
  return normalizeList(response.data);
}

export async function listCompanyQuestions(companyId) {
  const response = await api.get(`questions/company/${companyId}/`);
  return normalizeList(response.data);
}

export async function getQuestion(id) {
  const response = await api.get(`questions/${id}/`);
  return response.data;
}

export function createQuestion(data) {
  return api.post("questions/", data);
}

export function updateQuestion(id, data) {
  return api.patch(`questions/${id}/`, data);
}

export function deleteQuestion(id) {
  return api.delete(`questions/${id}/`);
}

export async function getVotes(questionId) {
  const response = await api.get(`questions/${questionId}/votes/`);
  return response.data;
}

export function castVote(questionId, voteType) {
  return api.post(`questions/${questionId}/vote/`, { vote_type: voteType });
}

export async function getQuestionStatus(questionId) {
  try {
    const response = await api.get(`questions/${questionId}/status/`);
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
}

export function createQuestionStatus(questionId, status) {
  return api.post(`questions/${questionId}/status/`, { status });
}

export function updateQuestionStatus(questionId, status) {
  return api.patch(`questions/${questionId}/status/`, { status });
}

export function deleteQuestionStatus(questionId) {
  return api.delete(`questions/${questionId}/status/`);
}

export async function getProgressFeed() {
  const response = await api.get("questions/progress/");
  return normalizeList(response.data);
}
