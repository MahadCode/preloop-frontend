import { useEffect, useId, useMemo, useRef, useState } from "react";
import { getErrorMessage } from "../../lib/errors";

const SUGGESTION_LIMIT = 5;
const SEARCH_LIMIT = 6;

export default function TaxonomyPicker({
  label,
  placeholder,
  options = [],
  value = [],
  onChange,
  onCreate,
  multiple = true,
  error,
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [creating, setCreating] = useState(false);
  const [localError, setLocalError] = useState("");

  const selected = value.map(Number).filter((id) => Number.isFinite(id));
  const selectedOptions = selected
    .map((id) => options.find((option) => Number(option.id) === id) || { id, name: "Saved" })
    .filter(Boolean);

  const trimmed = query.trim();
  const needle = trimmed.toLowerCase();
  const exact = options.some((option) => option.name.toLowerCase() === needle);

  const matches = useMemo(() => {
    const available = options.filter((option) => !selected.includes(Number(option.id)));
    const filtered = needle
      ? available.filter((option) => option.name.toLowerCase().includes(needle))
      : available;
    return filtered.slice(0, needle ? SEARCH_LIMIT : SUGGESTION_LIMIT);
  }, [needle, options, selected]);

  const canCreate = trimmed.length > 0 && !exact;
  const items = canCreate ? [...matches, { create: true, name: trimmed }] : matches;

  useEffect(() => {
    setActiveIndex(0);
  }, [trimmed, open]);

  useEffect(() => {
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, []);

  const commit = (ids) => {
    onChange(multiple ? ids : ids.slice(-1));
    setQuery("");
    setLocalError("");
    if (!multiple) setOpen(false);
  };

  const choose = (option) => {
    const id = Number(option.id);
    if (selected.includes(id)) return;
    commit(multiple ? [...selected, id] : [id]);
  };

  const remove = (id) => {
    onChange(selected.filter((item) => item !== Number(id)));
  };

  const create = async (name) => {
    const found = options.find((option) => option.name.toLowerCase() === name.toLowerCase());
    if (found) {
      choose(found);
      return;
    }
    setCreating(true);
    setLocalError("");
    try {
      const created = await onCreate(name);
      choose(created);
    } catch (cause) {
      setLocalError(getErrorMessage(cause, "That name could not be added."));
    } finally {
      setCreating(false);
    }
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, Math.max(items.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Backspace" && !query && selected.length) {
      remove(selected[selected.length - 1]);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = items[activeIndex];
      if (!item) return;
      if (item.create) create(item.name);
      else choose(item);
    }
  };

  return (
    <div ref={rootRef} className={open ? "relative z-20" : "relative"}>
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-smoke">{label}</span>
      <div className="rounded-2xl bg-taupe p-2">
        {selectedOptions.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {selectedOptions.map((option) => (
              <span key={option.id} className="inline-flex items-center gap-1 rounded-full bg-ink py-1 pl-3 pr-1 text-xs text-white">
                {option.name}
                <button
                  type="button"
                  aria-label={`Remove ${option.name}`}
                  onClick={() => remove(option.id)}
                  className="flex h-4 w-4 items-center justify-center rounded-full text-white/80 hover:bg-white/20"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          value={query}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-9 w-full bg-transparent px-2 text-sm text-ink outline-none placeholder:text-ash"
        />
      </div>
      {open && (
        <ul id={listId} role="listbox" className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-2xl bg-canvas py-1 shadow-lg">
          {items.length === 0 && (
            <li className="px-3 py-2 text-sm text-smoke">
              {exact ? "Already added." : "Type a name to add it."}
            </li>
          )}
          {items.map((item, index) => (
            <li key={item.create ? `create-${item.name}` : item.id} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                disabled={creating}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => (item.create ? create(item.name) : choose(item))}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                  index === activeIndex ? "bg-taupe text-ink" : "text-graphite"
                }`}
              >
                {item.create ? (
                  <span>Add “{item.name}”</span>
                ) : (
                  <span>{item.name}</span>
                )}
                {item.create && <span className="font-mono text-[10px] uppercase tracking-wide text-smoke">{creating ? "Adding" : "New"}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {(localError || error) && <p className="mt-1 text-xs text-danger">{localError || error}</p>}
    </div>
  );
}
