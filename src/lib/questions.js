export function questionIds(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "object" && item !== null ? item.id : item))
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));
}

export function matchesCompany(question, companyId) {
  if (!companyId) return true;
  const target = Number(companyId);
  if (questionIds(question.company).includes(target)) return true;
  return questionIds(question.company_full).includes(target);
}

export function matchesRole(question, roleId) {
  if (!roleId) return true;
  const target = Number(roleId);
  if (Number(question.job_role) === target) return true;
  const role = question.job_role_full;
  if (Array.isArray(role)) return questionIds(role).includes(target);
  if (role && Number(role.id) === target) return true;
  return false;
}

export function matchesTag(question, tagId) {
  if (!tagId) return true;
  const target = Number(tagId);
  if (questionIds(question.tag).includes(target)) return true;
  return questionIds(question.tag_full).includes(target);
}

export const defaultQuestionFilters = {
  search: "",
  difficulty: "",
  company: "",
  role: "",
  tag: "",
  status: "all",
  sort: "listed",
};

const difficultyRank = { easy: 0, medium: 1, hard: 2 };

export function filterQuestions(questions, filters) {
  const search = (filters.search || "").trim().toLowerCase();
  return questions.filter((question) => {
    if (search && !String(question.title || "").toLowerCase().includes(search)) {
      return false;
    }
    if (filters.difficulty && question.difficulty_level !== filters.difficulty) {
      return false;
    }
    if (!matchesCompany(question, filters.company)) return false;
    if (!matchesRole(question, filters.role)) return false;
    if (!matchesTag(question, filters.tag)) return false;
    if (filters.authorId && Number(question.author?.id) !== Number(filters.authorId)) {
      return false;
    }
    if (filters.status && filters.status !== "all") {
      const current = filters.statusByQuestion?.[question.id] || "unsolved";
      if (current !== filters.status) return false;
    }
    return true;
  });
}

export function sortQuestions(questions, sort) {
  const copy = [...questions];
  if (sort === "title") {
    copy.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
  } else if (sort === "difficulty") {
    copy.sort(
      (a, b) =>
        (difficultyRank[a.difficulty_level] ?? 9) -
        (difficultyRank[b.difficulty_level] ?? 9),
    );
  } else if (sort === "newest") {
    copy.sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
  }
  return copy;
}
