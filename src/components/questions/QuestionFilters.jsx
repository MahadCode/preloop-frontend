import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const RESULT_LIMIT = 6;

export default function QuestionFilters({
  filters,
  onChange,
  companies = [],
  roles = [],
  tags = [],
  showStatus = false,
}) {
  const set = (key, value) => onChange({ ...filters, [key]: value });
  const filtering =
    Boolean(filters.search || filters.difficulty || filters.company || filters.role || filters.tag) ||
    (showStatus && filters.status && filters.status !== "all");

  const clear = () =>
    onChange({
      ...filters,
      search: "",
      difficulty: "",
      company: "",
      role: "",
      tag: "",
      status: "all",
    });

  return (
    <div className="rounded-2xl bg-canvas p-4 shadow-sm">
      <input
        value={filters.search}
        onChange={(event) => set("search", event.target.value)}
        placeholder="Search by title"
        aria-label="Search by title"
        className="h-11 w-full rounded-full bg-taupe px-5 text-sm text-ink outline-none placeholder:text-ash focus:ring-2 focus:ring-ink/10"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Choice
          label="Difficulty"
          value={filters.difficulty}
          onChange={(value) => set("difficulty", value)}
          options={[
            ["", "Any"],
            ["easy", "Easy"],
            ["medium", "Medium"],
            ["hard", "Hard"],
          ]}
        />
        <SearchChoice
          label="Company"
          value={filters.company}
          onChange={(value) => set("company", value)}
          options={companies}
        />
        <SearchChoice
          label="Role"
          value={filters.role}
          onChange={(value) => set("role", value)}
          options={roles}
        />
        <SearchChoice
          label="Topic"
          value={filters.tag}
          onChange={(value) => set("tag", value)}
          options={tags}
        />
        {showStatus && (
          <Choice
            label="Status"
            value={filters.status === "all" ? "" : filters.status}
            onChange={(value) => set("status", value || "all")}
            options={[
              ["", "Any"],
              ["unsolved", "Unsolved"],
              ["attempted", "Attempted"],
              ["solved", "Solved"],
            ]}
          />
        )}
        <Choice
          label="Sort"
          value={filters.sort || "listed"}
          onChange={(value) => set("sort", value)}
          options={[
            ["listed", "As listed"],
            ["title", "Title"],
            ["difficulty", "Difficulty"],
            ["newest", "Newest"],
          ]}
        />
        {filtering && (
          <button type="button" onClick={clear} className="h-9 px-2 text-xs font-medium text-smoke hover:text-ink">
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

function Choice({ label, value, onChange, options }) {
  return (
    <label className="inline-flex h-9 items-center gap-2 rounded-full bg-taupe pl-3 pr-2 text-xs font-medium text-graphite">
      <span className="text-ash">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent pr-1 text-ink outline-none"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue || "any"} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function SearchChoice({ label, value, onChange, options }) {
  const listId = useId();
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const selected = options.find((option) => String(option.id) === String(value));

  const sorted = useMemo(
    () => [...options].sort((a, b) => String(a.name).localeCompare(String(b.name))),
    [options],
  );
  const needle = query.trim().toLowerCase();
  const matches = needle
    ? sorted.filter((option) => option.name.toLowerCase().includes(needle))
    : sorted;
  const shown = matches.slice(0, RESULT_LIMIT);
  const remaining = matches.length - shown.length;

  useEffect(() => {
    setActiveIndex(0);
  }, [needle, open]);

  useEffect(() => {
    if (!open) return undefined;
    const frame = requestAnimationFrame(() => searchRef.current?.focus());
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const choose = (id) => {
    onChange(id ? String(id) : "");
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(shown.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Enter" && shown[activeIndex]) {
      event.preventDefault();
      choose(shown[activeIndex].id);
    }
  };

  return (
    <div ref={rootRef} className={open ? "relative z-20" : "relative"}>
      <div className={`inline-flex h-9 items-center rounded-full text-xs font-medium ${selected ? "bg-ink text-white" : "bg-taupe text-graphite"}`}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((current) => !current)}
          className="inline-flex h-9 items-center gap-2 rounded-full px-3"
        >
          <span className={selected ? "text-white/60" : "text-ash"}>{label}</span>
          <span>{selected ? selected.name : "Any"}</span>
          {!selected && <ChevronDown size={14} />}
        </button>
        {selected && (
          <button
            type="button"
            aria-label={`Clear ${label}`}
            onClick={() => choose("")}
            className="mr-2 flex h-4 w-4 items-center justify-center rounded-full hover:bg-white/20"
          >
            ×
          </button>
        )}
      </div>
      {open && (
        <div className="absolute left-0 z-20 mt-2 w-64 rounded-2xl bg-canvas p-2 shadow-lg">
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Search ${label.toLowerCase()}`}
            aria-label={`Search ${label.toLowerCase()}`}
            className="h-9 w-full rounded-full bg-taupe px-3 text-sm text-ink outline-none placeholder:text-ash"
          />
          <ul id={listId} role="listbox" className="mt-1">
            <li>
              <MenuButton active={false} onClick={() => choose("")}>
                Any {label.toLowerCase()}
              </MenuButton>
            </li>
            {shown.map((option, index) => (
              <li key={option.id} role="option" aria-selected={index === activeIndex}>
                <MenuButton active={index === activeIndex} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(option.id)}>
                  {option.name}
                </MenuButton>
              </li>
            ))}
            {shown.length === 0 && (
              <li className="px-3 py-2 text-sm text-smoke">No matches.</li>
            )}
          </ul>
          {remaining > 0 && (
            <p className="px-3 py-1.5 text-[11px] text-ash">
              {remaining} more. Keep typing to narrow the list.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function MenuButton({ active, children, ...props }) {
  return (
    <button
      type="button"
      className={`flex w-full rounded-xl px-3 py-2 text-left text-sm ${active ? "bg-taupe text-ink" : "text-graphite"}`}
      {...props}
    >
      {children}
    </button>
  );
}
