import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/User";
import { Round } from "@/models/Round";
import { Assignment } from "@/models/Assignment";
import { Team } from "@/models/Team";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldCheck, ShieldAlert, Clock, ArrowRight, ClipboardCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Judge Dashboard | Empresario",
};

export default async function JudgeDashboard() {
  const session = await getSession();
  if (!session || session.role !== "judge") {
    redirect("/login");
  }

  await dbConnect();

  const user = await User.findById(session.userId);
  if (!user) {
    redirect("/login");
  }

  if (user.status === "pending") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900 p-6">
        <div className="max-w-md text-center bg-white border border-slate-200 p-8 rounded-md shadow-sm">
          <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Pending Approval</h1>
          <p className="text-slate-600">Your judge account is currently under review by the administrators. You will be able to access the judging portal once approved.</p>
        </div>
      </div>
    );
  }

  if (user.status === "disabled") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900 p-6">
        <div className="max-w-md text-center bg-white border border-slate-200 p-8 rounded-md shadow-sm">
          <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Revoked</h1>
          <p className="text-slate-600">Your judge account has been disabled. Please contact the organizers.</p>
        </div>
      </div>
    );
  }

  const openRounds = await Round.find({ status: "open" }).sort({ order: 1 });

  type RoundWithTeams = {
    roundId: string;
    roundName: string;
    teams: any[];
  };

  const roundsWithTeams: RoundWithTeams[] = [];

  for (const round of openRounds) {
    const assignments = await Assignment.find({
      judgeId: session.userId,
      roundId: round._id,
    }).populate("teamId");

    const teams = assignments.map((a) => a.teamId).filter(Boolean);
    roundsWithTeams.push({
      roundId: round._id.toString(),
      roundName: round.name,
      teams,
    });
  }

  const hasAnyAssignment = roundsWithTeams.some((r) => r.teams.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 font-sans overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100">
                <ShieldCheck className="w-4 h-4 text-blue-800" />
              </div>
              <span className="text-blue-800 font-bold uppercase tracking-wider text-sm">Judge Panel</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Welcome, Judge {user.lastName}
            </h1>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm px-5 py-3 rounded-md">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Active Rounds</div>
            {openRounds.length > 0 ? (
              <div className="space-y-1">
                {openRounds.map((r) => (
                  <div key={r._id.toString()} className="flex items-center gap-2 text-green-600 font-bold text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {r.name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-600 font-bold">No Active Round</div>
            )}
          </div>
        </div>

        {openRounds.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-md p-12 text-center shadow-sm">
            <ClipboardCheck className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Competition Paused</h2>
            <p className="text-slate-600 max-w-md mx-auto">
              There is no active round right now. Please wait for the administrators to open the next round before scoring.
            </p>
          </div>
        ) : !hasAnyAssignment ? (
          <div className="bg-white border border-slate-200 rounded-md p-12 text-center shadow-sm">
            <ClipboardCheck className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Teams Assigned</h2>
            <p className="text-slate-600 max-w-md mx-auto">
              You have no teams assigned to you for the active round(s). Please wait for the administrators to assign teams.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {roundsWithTeams.map(({ roundId, roundName, teams }) =>
              teams.length === 0 ? null : (
                <div key={roundId}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <h3 className="text-xl font-bold text-slate-900">{roundName}</h3>
                    <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-green-100 border border-green-200 text-green-800">Live</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                      <div key={team._id.toString()} className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm hover:border-slate-300 transition-colors group flex flex-col">
                        <div className="p-6 flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-sm bg-slate-100 text-slate-600 border border-slate-200">
                              {team.track} Track
                            </span>
                          </div>
                          <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-800 transition-colors">{team.name}</h4>
                          <p className="text-sm text-slate-600 line-clamp-2">{team.summary}</p>
                        </div>

                        <Link
                          href={`/judge/scoring/${team._id.toString()}?roundId=${roundId}`}
                          className="p-4 bg-slate-50 hover:bg-slate-100 border-t border-slate-200 flex justify-between items-center text-blue-800 font-semibold text-sm transition-colors"
                        >
                          Score this Team
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}

      </div>
    </div>
  );
}
