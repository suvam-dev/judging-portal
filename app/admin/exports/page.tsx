import dbConnect from "@/lib/dbConnect";
import { Round } from "@/models/Round";
import { Download, Users, ShieldCheck, Trophy } from "lucide-react";

export const metadata = {
  title: "Exports | Empresario",
};

export default async function ExportsPage() {
  await dbConnect();
  const rounds = await Round.find({}).sort({ order: 1 });

  const cards = [
    {
      name: "Teams",
      description: "All registered teams with owner, track, status, and pitch link.",
      href: "/admin/exports/teams",
      icon: Users,
      accent: "indigo",
    },
    {
      name: "Judges",
      description: "Judge accounts with panel, status, and last-login timestamp.",
      href: "/admin/exports/judges",
      icon: ShieldCheck,
      accent: "purple",
    },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <a
              key={card.name}
              href={card.href}
              className="group block p-6 rounded-md bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-slate-500 group-hover:text-blue-800 transition-colors" />
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-800 transition-colors" />
              </div>
              <h3 className="font-bold text-slate-900">{card.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{card.description}</p>
            </a>
          );
        })}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" /> Leaderboards by Round
        </h3>
        {rounds.length === 0 ? (
          <div className="p-6 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-500">
            No rounds configured yet. Create a round before exporting a leaderboard.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rounds.map((r) => (
              <a
                key={r._id.toString()}
                href={`/admin/exports/leaderboard?round=${r._id.toString()}`}
                className="group flex items-center justify-between p-4 rounded-md bg-white border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow transition-all"
              >
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Round {r.order}</div>
                  <div className="font-semibold text-slate-900 text-sm mt-0.5">{r.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{r.status}</div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-800 transition-colors" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
