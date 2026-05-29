import dbConnect from "@/lib/dbConnect";
import { Round } from "@/models/Round";
import { calculateLeaderboard } from "@/lib/scoring";
import { Trophy } from "lucide-react";
import FilterBar from "./FilterBar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Live Leaderboard | Empresario",
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ round?: string; track?: string }>;
}) {
  await dbConnect();

  const { round: roundParam, track: trackParam } = await searchParams;

  const rounds = await Round.find({}).sort({ order: 1 });
  const openRound = rounds.find((r) => r.status === "open");
  const selectedRoundId =
    roundParam || (openRound ? openRound._id.toString() : rounds[0]?._id.toString());

  const selectedTrack = trackParam || "All";

  let leaderboard = selectedRoundId ? await calculateLeaderboard(selectedRoundId) : [];

  if (selectedTrack !== "All") {
    leaderboard = leaderboard.filter((entry) => entry.track === selectedTrack);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-600" /> Live Leaderboard
          </h2>
          <p className="text-slate-500 mt-2">
            Real-time algorithmically weighted scores.
          </p>
        </div>

        <FilterBar
          rounds={rounds.map((r) => ({
            id: r._id.toString(),
            name: r.name,
            status: r.status,
          }))}
          selectedRoundId={selectedRoundId}
          selectedTrack={selectedTrack}
        />
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-5 font-semibold w-24 border-b border-slate-200">Rank</th>
                <th className="px-6 py-5 font-semibold border-b border-slate-200">Project Name</th>
                <th className="px-6 py-5 font-semibold border-b border-slate-200">Track</th>
                <th className="px-6 py-5 font-semibold text-center border-b border-slate-200">Judges Scored</th>
                <th className="px-6 py-5 font-semibold text-right border-b border-slate-200">Weighted Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                    No scores recorded for this round yet.
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry, index) => (
                  <tr key={entry.teamId} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5">
                      {index === 0 && <div className="w-8 h-8 rounded-full bg-yellow-50 text-yellow-700 flex items-center justify-center font-bold border border-yellow-200 shadow-sm">1</div>}
                      {index === 1 && <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold border border-slate-200">2</div>}
                      {index === 2 && <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-700 flex items-center justify-center font-bold border border-orange-200">3</div>}
                      {index > 2 && <div className="w-8 h-8 text-slate-500 flex items-center justify-center font-bold">{index + 1}</div>}
                    </td>
                    <td className="px-6 py-5 text-slate-900 font-bold text-base">
                      {entry.teamName}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-sm bg-slate-100 text-slate-600 border border-slate-200">
                        {entry.track}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex items-center justify-center">
                        <span className={`font-medium ${entry.judgesScored === entry.totalJudgesAssigned ? 'text-green-700' : 'text-amber-700'}`}>
                          {entry.judgesScored}
                        </span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-slate-500">{entry.totalJudgesAssigned}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent group-hover:from-blue-800 group-hover:to-blue-600 transition-all">
                        {entry.finalScore.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
