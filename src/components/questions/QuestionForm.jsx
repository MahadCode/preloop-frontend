import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createQuestion, updateQuestion } from "../../api/questions";
import { createCompany, createJobRole, createTag, listCompanies, listJobRoles, listTags } from "../../api/taxonomy";
import { getErrorMessage, getFieldErrors } from "../../lib/errors";
import { questionIds } from "../../lib/questions";
import RichText from "../ui/RichText";
import Button from "../ui/Button";
import ErrorState from "../ui/ErrorState";
import { PageSkeleton } from "../ui/Skeleton";
import TaxonomyPicker from "./TaxonomyPicker";

const difficulties = [
  ["easy", "Easy"],
  ["medium", "Medium"],
  ["hard", "Hard"],
];

export default function QuestionForm({ initial, questionId }) {
  const navigate = useNavigate();
  const [taxonomy, setTaxonomy] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty_level || "easy");
  const [companies, setCompanies] = useState(questionIds(initial?.company).length ? questionIds(initial.company) : questionIds(initial?.company_full));
  const [role, setRole] = useState(initial?.job_role || initial?.job_role_full?.id || "");
  const [tags, setTags] = useState(questionIds(initial?.tag).length ? questionIds(initial.tag) : questionIds(initial?.tag_full));

  useEffect(() => {
    let active = true;
    Promise.all([listCompanies(), listJobRoles(), listTags()])
      .then(([companyOptions, roleOptions, tagOptions]) => {
        if (active) setTaxonomy({ companies: companyOptions, roles: roleOptions, tags: tagOptions });
      })
      .catch((error) => {
        if (active) setLoadError(error);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loadError) return <ErrorState error={loadError} onRetry={() => window.location.reload()} />;
  if (!taxonomy) return <PageSkeleton />;

  const remember = (key, item) => {
    setTaxonomy((current) => {
      const list = current[key];
      const exists = list.some((option) => Number(option.id) === Number(item.id));
      return {
        ...current,
        [key]: exists ? list : [...list, item],
      };
    });
    return item;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setFieldErrors({});
    if (!title.trim()) {
      setFieldErrors({ title: "Title is required." });
      return;
    }
    setSubmitting(true);
    const payload = {
      title: title.trim(),
      description,
      difficulty_level: difficulty,
      company: companies,
      job_role: role ? Number(role) : null,
      tag: tags,
    };
    try {
      const response = questionId
        ? await updateQuestion(questionId, payload)
        : await createQuestion(payload);
      navigate(`/questions/${response.data.id}`);
    } catch (error) {
      setFieldErrors(getFieldErrors(error));
      setFormError(getErrorMessage(error, "The question could not be saved."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        {formError && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{formError}</p>}
        <label className="block">
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-smoke">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What should the candidate design?"
            className="w-full border-b border-stone bg-transparent pb-3 text-[28px] font-light tracking-tight text-ink outline-none placeholder:text-ash focus:border-ink"
          />
          {fieldErrors.title && <span className="mt-1 block text-xs text-danger">{fieldErrors.title}</span>}
        </label>
        <div className="rounded-2xl bg-canvas p-4 shadow-sm">
          <RichText label="Description" value={description} onChange={setDescription} />
          {fieldErrors.description && <p className="mt-1 text-xs text-danger">{fieldErrors.description}</p>}
        </div>
      </div>
      <aside className="space-y-5 rounded-2xl bg-canvas p-5 shadow-sm lg:sticky lg:top-24">
        <div>
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-smoke">Difficulty</span>
          <div className="grid grid-cols-3 gap-1 rounded-full bg-taupe p-1">
            {difficulties.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setDifficulty(value)}
                className={`h-9 rounded-full text-xs font-medium ${
                  difficulty === value ? "bg-ink text-white" : "text-graphite hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {fieldErrors.difficulty_level && <p className="mt-1 text-xs text-danger">{fieldErrors.difficulty_level}</p>}
        </div>
        <TaxonomyPicker
          label="Companies"
          placeholder="Search or add a company"
          options={taxonomy.companies}
          value={companies}
          onChange={setCompanies}
          onCreate={async (name) => remember("companies", (await createCompany(name)).data)}
          error={fieldErrors.company}
        />
        <TaxonomyPicker
          label="Role"
          placeholder="Search or add a role"
          options={taxonomy.roles}
          value={role ? [Number(role)] : []}
          onChange={(ids) => setRole(ids[0] || "")}
          onCreate={async (name) => remember("roles", (await createJobRole(name)).data)}
          multiple={false}
          error={fieldErrors.job_role}
        />
        <TaxonomyPicker
          label="Topics"
          placeholder="Search or add a topic"
          options={taxonomy.tags}
          value={tags}
          onChange={setTags}
          onCreate={async (name) => remember("tags", (await createTag(name)).data)}
          error={fieldErrors.tag}
        />
        <Button type="submit" className="w-full" loading={submitting}>
          {questionId ? "Save question" : "Publish question"}
        </Button>
      </aside>
    </form>
  );
}
