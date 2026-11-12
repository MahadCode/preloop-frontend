import axios from "axios";

function apiBaseUrl() {
  const raw = (import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/").trim();
  return raw.endsWith("/") ? raw : `${raw}/`;
}

const api = axios.create({
  baseURL: apiBaseUrl(),
  withCredentials: true,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 60000,
});

let csrfToken = "";
let onUnauthorized = () => {};

export function setCsrfToken(token) {
  csrfToken = token || "";
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

function rememberCsrf(source) {
  const headerToken = source?.headers?.["x-csrftoken"];
  const bodyToken = source?.data?.csrfToken;
  if (headerToken) csrfToken = headerToken;
  else if (bodyToken) csrfToken = bodyToken;
}

api.interceptors.request.use((config) => {
  const fromCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];
  const token = fromCookie ? decodeURIComponent(fromCookie) : csrfToken;

  if (token) {
    config.headers["X-CSRFToken"] = token;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    rememberCsrf(response);
    return response;
  },
  (error) => {
    rememberCsrf(error?.response);
    const status = error?.response?.status;
    if (status === 401 && !error?.config?.skipAuthRedirect) {
      onUnauthorized(error);
    }
    return Promise.reject(error);
  },
);

export function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

export async function emptyOn404(request) {
  try {
    const response = await request();
    return normalizeList(response.data);
  } catch (error) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
}

export default api;
