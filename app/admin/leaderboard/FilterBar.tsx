"use client";

import { useRouter, useSearchParams } from "next/navigation";

type RoundOption = { id: string; name: string; status: string };

export default function FilterBar({
  rounds,
  selectedRoundId,
  selectedTrack,
}: {
  rounds: RoundOption[];
  selectedRoundId: string | undefined;
  selectedTrack: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: "round" | "track", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/admin/leaderboard?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3 bg-white p-2 rounded-md border border-slate-200 shadow-sm">
      <select
        name="round"
        defaultValue={selectedRoundId}
        onChange={(e) => update("round", e.currentTarget.value)}
        className="bg-white border border-slate-300 text-slate-900 rounded-md px-4 py-2 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none appearance-none cursor-pointer"
      >
        {rounds.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name} {r.status === "open" ? "(Live)" : ""}
          </option>
        ))}
      </select>

      <select
        name="track"
        defaultValue={selectedTrack}
        onChange={(e) => update("track", e.currentTarget.value)}
        className="bg-white border border-slate-300 text-slate-900 rounded-md px-4 py-2 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none appearance-none cursor-pointer"
      >
        <option value="All">All Tracks</option>
        <option value="PnS">Product &amp; Services</option>
        <option value="Social">Social</option>
        <option value="KGP">IIT KGP</option>
        <option value="DeeptechAI">Deeptech &amp; AI</option>
        <option value="BlockchainWeb3">Blockchain &amp; Web3</option>
      </select>
    </div>
  );
}
