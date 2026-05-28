"use client";

import { useActionState } from "react";
import { createCriterion } from "./actions";

export default function RubricForm({ rounds }: { rounds: any[] }) {
  const [state, action, isPending] = useActionState(createCriterion, { error: null });

  if (rounds.length === 0) {
    return (
      <div className="text-sm text-amber-400 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
        You must create a Round first before adding criteria.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md mb-4">
          {state.error}
        </div>
      )}

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Target Round</label>
        <select name="roundId" required className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2.5 text-sm focus:border-blue-600 outline-none transition-colors appearance-none">
          {rounds.map(r => (
            <option key={r._id.toString()} value={r._id.toString()}>{r.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Criterion Name</label>
        <input name="name" type="text" placeholder="e.g. Innovation" required className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors placeholder:text-slate-400" />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Description</label>
        <textarea name="description" placeholder="Brief explanation for judges..." className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors resize-none h-20 placeholder:text-slate-400" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Max Score</label>
          <input name="max" type="number" min="1" defaultValue="10" required className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors placeholder:text-slate-400" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Weight</label>
          <input name="weight" type="number" step="0.1" min="0" defaultValue="1.0" required className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors placeholder:text-slate-400" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Display Order</label>
        <input name="order" type="number" min="1" defaultValue="1" required className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors placeholder:text-slate-400" />
      </div>

      <button type="submit" disabled={isPending} className="w-full mt-2 py-3 rounded-md bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white font-bold text-sm transition-colors">
        {isPending ? "Saving..." : "Save Criterion"}
      </button>
    </form>
  );
}
