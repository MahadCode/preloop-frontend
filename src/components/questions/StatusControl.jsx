import { useState } from "react";
import { createQuestionStatus, deleteQuestionStatus, updateQuestionStatus } from "../../api/questions";
import { getErrorMessage } from "../../lib/errors";
import { useToast } from "../ui/Toast";

const options = [
  ["solved", "Solved"],
  ["attempted", "Attempted"],
  ["unsolved", "Unsolved"],
];

export default function StatusControl({ questionId, status = "unsolved", onChanged, variant = "select" }) {
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const current = status || "unsolved";

  const change = async (next) => {
    if (next === current) return;
    setPending(true);
    try {
      if (next === "unsolved") {
        try {
          await deleteQuestionStatus(questionId);
        } catch (error) {
          if (error?.response?.status !== 404) throw error;
        }
      } else if (current === "unsolved") {
        try {
          await createQuestionStatus(questionId, next);
        } catch (error) {
          if (error?.response?.status === 400 || error?.response?.status === 409) {
            await updateQuestionStatus(questionId, next);
          } else {
            throw error;
          }
        }
      } else {
        await updateQuestionStatus(questionId, next);
      }
      onChanged?.(next);
      toast({ title: "Status saved" });
    } catch (error) {
      toast({ tone: "danger", message: getErrorMessage(error, "Status could not be saved.") });
    } finally {
      setPending(false);
    }
  };

  if (variant === "segmented") {
    return (
      <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-taupe p-1" role="group" aria-label="Your status">
        {options.map(([value, label]) => {
          const active = current === value;
          return (
            <button
              key={value}
              type="button"
              disabled={pending}
              aria-pressed={active}
              onClick={() => change(value)}
              className={`rounded-lg py-1.5 text-xs font-medium transition ${
                active ? "bg-ink text-white" : "text-graphite hover:text-ink"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <label className="block text-sm font-medium text-ink">
      Your status
      <select
        className="mt-1.5 w-full rounded-md border border-stone bg-paper px-3 py-2.5"
        value={current}
        disabled={pending}
        onChange={(event) => change(event.target.value)}
      >
        <option value="unsolved">Unsolved</option>
        <option value="attempted">Attempted</option>
        <option value="solved">Solved</option>
      </select>
    </label>
  );
}
