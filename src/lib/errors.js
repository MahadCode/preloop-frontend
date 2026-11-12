function isServerDebugPage(value) {
  if (typeof value !== "string") return false;
  if (/^\s*(<!doctype html|<html[\s>])/i.test(value)) return true;
  return /Django Version:/.test(value) && /Request Method:/.test(value);
}

function stringify(value) {
  if (value == null) return "";
  if (typeof value === "string") return isServerDebugPage(value) ? "" : value;
  if (Array.isArray(value)) return value.map(stringify).filter(Boolean).join(" ");
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => `${key}: ${stringify(item)}`)
      .join(" ");
  }
  return String(value);
}

export function getErrorMessage(error, fallback = "Something went wrong. Try again.") {
  const data = error?.response?.data;
  const status = error?.response?.status;
  if (!data) {
    if (error?.message === "Network Error") {
      return "The server could not be reached.";
    }
    return fallback;
  }
  if (typeof data === "string") {
    if (isServerDebugPage(data)) {
      if (status === 404) return "This request is not available on the server yet.";
      if (status >= 500) return "The server failed while handling this request.";
      return fallback;
    }
    return data;
  }
  if (data.detail) return stringify(data.detail);
  if (data.message) return stringify(data.message);
  if (data.error) return stringify(data.error);
  const fieldMessage = stringify(data);
  return fieldMessage || fallback;
}

export function getFieldErrors(error) {
  const data = error?.response?.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const fields = {};
  for (const [key, value] of Object.entries(data)) {
    if (["detail", "message", "error"].includes(key)) continue;
    fields[key] = stringify(value);
  }
  return fields;
}
