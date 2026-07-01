import dbConnect from "@/lib/dbConnect";
import { Round } from "@/models/Round";
import { Download, Users, ShieldCheck, Trophy, TableProperties } from "lucide-react";
import { Suspense } from "react";
import { ExportsRoundsSkeleton } from "@/components/Skeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Exports | Empresario",
};

const cards = [
  {
    name: "Teams",
    description: "All registered teams with owner, track, status, and pitch link.",
    href: "/admin/exports/teams",
    icon: Users,
  },
  {
    name: "Judges",
    description: "Judge accounts with panel, status, and last-login timestamp.",
    href: "/admin/exports/judges",
    icon: ShieldCheck,
  },
  {
    name: "Full Scoring Details",
    description:
      "Every individual score — all rounds, all judges, all criteria. One row per score entry. Best for detailed analysis in Excel.",
    href: "/admin/exports/scores",
    icon: TableProperties,
    highlight: true,
  },
];

async function ExportsRoundsSection() {
  await dbConnect();
  const rounds = await Round.find({}).sort({ order: 1 });

  if (rounds.length === 0) {
    return (
      <div className="p-6 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-500">
        No rounds configured yet. Create a round before exporting a leaderboard.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rounds.map((r) => (
        <div key={r._id.toString()} className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Round {r.order}</div>
            <div className="font-semibold text-slate-900 text-sm mt-0.5">{r.name}</div>
            <div className="text-[10px] mt-1 uppercase tracking-wider">
              <span
                className={`px-1.5 py-0.5 rounded-sm font-semibold ${
                  r.status === "open"
                    ? "bg-green-100 text-green-700"
                    : r.status === "published"
                    ? "bg-purple-100 text-purple-700"
                    : r.status === "closed"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {r.status}
              </span>
            </div>
          </div>

          <div className="p-3 flex flex-col gap-2">
            <a
              href={`/admin/exports/leaderboard?round=${r._id.toString()}`}
              className="group flex items-center justify-between px-3 py-2 rounded-sm bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-xs font-medium text-slate-700 hover:text-blue-800"
            >
              <span>📊 Leaderboard Summary CSV</span>
              <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
            </a>
            <a
              href={`/admin/exports/scores?round=${r._id.toString()}`}
              className="group flex items-center justify-between px-3 py-2 rounded-sm bg-blue-50 border border-blue-200 hover:border-blue-400 hover:bg-blue-100 transition-all text-xs font-medium text-blue-800"
            >
              <span>🔍 Detailed Scores CSV (per judge)</span>
              <Download className="w-3.5 h-3.5 text-blue-500 group-hover:text-blue-700" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ExportsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Download className="w-7 h-7 text-slate-400" /> Exports
        </h2>
        <p className="text-slate-500 mt-2">
          Download CSV snapshots for offline analysis or reporting.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">
          General Data
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <a
                key={card.name}
                href={card.href}
                className={`group block p-6 rounded-md border shadow-sm hover:shadow transition-all ${
                  card.highlight
                    ? "bg-blue-50 border-blue-200 hover:border-blue-400"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-md border flex items-center justify-center ${
                      card.highlight
                        ? "bg-blue-100 border-blue-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        card.highlight
                          ? "text-blue-700"
                          : "text-slate-500 group-hover:text-blue-800"
                      }`}
                    />
                  </div>
                  <Download
                    className={`w-4 h-4 transition-colors ${
                      card.highlight
                        ? "text-blue-500"
                        : "text-slate-400 group-hover:text-blue-800"
                    }`}
                  />
                </div>
                <h3
                  className={`font-bold ${
                    card.highlight ? "text-blue-900" : "text-slate-900"
                  }`}
                >
                  {card.name}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    card.highlight ? "text-blue-700" : "text-slate-500"
                  }`}
                >
                  {card.description}
                </p>
              </a>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" /> Leaderboard by Round
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Summary ranking for a specific round — final weighted score per team.
          For per-judge breakdown, use <strong>Full Scoring Details</strong> above.
        </p>

        <Suspense fallback={<ExportsRoundsSkeleton />}>
          <ExportsRoundsSection />
        </Suspense>
      </div>
    </div>
  );
}
