import api, { setCsrfToken } from "./client";

export async function ensureCsrf() {
  const response = await api.get("auth/csrf/", { skipAuthRedirect: true });
  setCsrfToken(response.data?.csrfToken);
  return response;
}

export async function getCurrentUser({ skipAuthRedirect = false } = {}) {
  const response = await api.get("auth/current-user/", { skipAuthRedirect });
  return response.data;
}

export function register(data) {
  return api.post("auth/register/", data);
}

export function login(username, password) {
  return api.post("auth/login/", { username, password });
}

export function logout() {
  return api.post("auth/logout/");
}

export function resendEmailVerification() {
  return api.post("auth/resend-verification/");
}

export function requestPasswordRecovery(data) {
  return api.post("auth/recover-password/", data);
}

export function resetPassword(token, data) {
  return api.post(`auth/reset-password/${token}/`, data);
}

export function changePassword(data) {
  return api.post("auth/change-password/", data);
}

export function updateProfile(data) {
  return api.patch("auth/edit-profile/", data);
}

export function deleteAccount(data) {
  return api.delete("auth/delete-account/", { data });
}

export function verifyEmail(token) {
  return api.get(`auth/verify-email/${token}/`, { skipAuthRedirect: true });
}
