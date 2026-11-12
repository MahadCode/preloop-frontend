import api, { normalizeList } from "./client";

async function list(path) {
  const response = await api.get(path);
  return normalizeList(response.data);
}

export const listCompanies = () => list("taxonomy/companies/");
export const listJobRoles = () => list("taxonomy/job-roles/");
export const listTags = () => list("taxonomy/tags/");

export const createCompany = (name) => api.post("taxonomy/companies/", { name });
export const createJobRole = (name) => api.post("taxonomy/job-roles/", { name });
export const createTag = (name) => api.post("taxonomy/tags/", { name });

export const updateCompany = (id, data) => api.patch(`taxonomy/companies/${id}/`, data);
export const updateJobRole = (id, data) => api.patch(`taxonomy/job-roles/${id}/`, data);
export const updateTag = (id, data) => api.patch(`taxonomy/tags/${id}/`, data);

export const deleteCompany = (id) => api.delete(`taxonomy/companies/${id}/`);
export const deleteJobRole = (id) => api.delete(`taxonomy/job-roles/${id}/`);
export const deleteTag = (id) => api.delete(`taxonomy/tags/${id}/`);
