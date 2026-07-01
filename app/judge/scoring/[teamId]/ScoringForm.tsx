"use client";

import { useActionState, useEffect, useState } from "react";
import { submitScores } from "../../actions";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type CriterionType = {
  _id: string;
  name: string;
  description: string;
  max: number;
  weight: number;
  order: number;
};

type ScoreType = {
  criterionId: string;
  value: number;
  comment: string | null;
};

export default function ScoringForm({
  teamId,
  roundId,
  criteria,
  existingScores,
}: {
  teamId: string;
  roundId: string;
  criteria: CriterionType[];
  existingScores: ScoreType[];
}) {
  const [state, action, isPending] = useActionState(submitScores, { error: null });
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const [filledScores, setFilledScores] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const crit of criteria) {
      const existing = existingScores.find((s) => s.criterionId === crit._id);
      initial[crit._id] = existing !== undefined && existing.value !== null && existing.value !== undefined && String(existing.value).trim() !== "";
    }
    return initial;
  });

  const filledCount = Object.values(filledScores).filter(Boolean).length;
  const totalCount = criteria.length;
  const allFilled = filledCount === totalCount;
  const progressPercent = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

  useEffect(() => {
    if (state.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        router.push("/judge");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-200">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Scores Saved Successfully</h3>
        <p className="text-slate-600">Redirecting you to the dashboard...</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-8">
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-md">
          {state.error}
        </div>
      )}

      <input type="hidden" name="teamId" value={teamId} />
      <input type="hidden" name="roundId" value={roundId} />

      <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">Scoring Progress</span>
          <span className={`text-sm font-bold ${allFilled ? "text-green-700" : "text-amber-700"}`}>
            {filledCount} / {totalCount} criteria filled
          </span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${allFilled ? "bg-green-500" : "bg-amber-500"}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {!allFilled && (
          <p className="text-xs text-amber-700 mt-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Fill in all {totalCount} criteria to enable submission. Partial scores are not accepted.
          </p>
        )}
      </div>

      <div className="space-y-6">
        {criteria.map((crit) => {
          const existing = existingScores.find((s) => s.criterionId === crit._id);
          const isFilled = filledScores[crit._id];

          return (
            <div
              key={crit._id}
              className={`p-5 rounded-md border bg-white transition-colors relative group ${
                isFilled
                  ? "border-slate-200 hover:bg-slate-50"
                  : "border-amber-300 bg-amber-50/30"
              }`}
            >
              <div
                className={`absolute top-0 left-0 w-1 h-full rounded-l-md transition-colors ${
                  isFilled ? "bg-green-500" : "bg-amber-400"
                }`}
              />

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-800">#{crit.order}</span>
                    <h4 className="text-lg font-bold text-slate-900">{crit.name}</h4>
                    {isFilled && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                  </div>
                  <p className="text-sm text-slate-600">{crit.description}</p>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Score (0-{crit.max})</div>
                  <input
                    type="number"
                    name={`score_${crit._id}`}
                    min="0"
                    max={crit.max}
                    step="0.1"
                    defaultValue={existing?.value}
                    required
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setFilledScores((prev) => ({
                        ...prev,
                        [crit._id]: val !== "" && !isNaN(Number(val)),
                      }));
                    }}
                    className={`w-full sm:w-24 bg-white border text-slate-900 rounded-md px-3 py-2 text-center text-lg font-bold focus:ring-1 outline-none transition-all placeholder:text-slate-400 ${
                      isFilled
                        ? "border-slate-300 focus:border-blue-600 focus:ring-blue-600"
                        : "border-amber-400 focus:border-amber-500 focus:ring-amber-400"
                    }`}
                    placeholder={`/${crit.max}`}
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  name={`comment_${crit._id}`}
                  defaultValue={existing?.comment || ""}
                  placeholder="Optional comment for this criterion..."
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-200 space-y-3">
        {!allFilled && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 font-medium">
              You must score all {totalCount} criteria before submitting.{" "}
              <span className="font-bold">{totalCount - filledCount} remaining.</span>
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || !allFilled}
          title={!allFilled ? `Fill in all ${totalCount} criteria to submit` : ""}
          className="w-full py-4 rounded-md bg-blue-800 hover:bg-blue-900 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg shadow-sm transition-colors"
        >
          {isPending
            ? "Saving Scores..."
            : !allFilled
            ? `Complete All Criteria to Submit (${filledCount}/${totalCount})`
            : existingScores.length > 0
            ? "Update Scores"
            : "Submit Scores"}
        </button>
      </div>
    </form>
  );
}
