export function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0%";
  return `${Math.max(0, Math.min(100, Math.round(number)))}%`;
}

export function displayName(user) {
  if (!user) return "Account";
  const full = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return full || user.username || "Account";
}

export function initials(user) {
  if (!user) return "?";
  const first = (user.first_name || user.username || "?").trim();
  const last = (user.last_name || "").trim();
  const letters = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  return letters || "?";
}

export function jobRoleLabel(question) {
  const role = question?.job_role_full ?? question?.job_role;
  if (!role) return null;
  if (Array.isArray(role)) {
    const names = role.map((item) => item?.name || item).filter(Boolean);
    return names.length ? names.join(", ") : null;
  }
  if (typeof role === "object") return role.name || null;
  return null;
}

export function companyNames(question) {
  if (Array.isArray(question?.company_full) && question.company_full.length) {
    return question.company_full.map((company) => company.name).filter(Boolean);
  }
  return [];
}

export function tagNames(question) {
  if (Array.isArray(question?.tag_full) && question.tag_full.length) {
    return question.tag_full.map((tag) => tag.name).filter(Boolean);
  }
  return [];
}

export function difficultyLabel(level) {
  if (!level) return "Unset";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function statusLabel(status) {
  if (!status) return "Unsolved";
  return status.charAt(0).toUpperCase() + status.slice(1).replaceAll("_", " ");
}

export function metricLabel(metric) {
  if (metric === "question_count") return "Question count";
  if (metric === "topic_mastery") return "Topic mastery";
  if (metric === "company_target") return "Company target";
  return metric || "Goal";
}

export function notificationLabel(type) {
  if (type === "new_reply") return "New reply";
  if (type === "new_solution") return "New solution";
  if (type === "content_moderated") return "Content moderated";
  if (type === "goal_progress") return "Goal progress";
  return type || "Notification";
}
