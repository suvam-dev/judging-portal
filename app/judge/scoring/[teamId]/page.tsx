import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/User";
import { Round } from "@/models/Round";
import { Team } from "@/models/Team";
import { Criterion } from "@/models/Criterion";
import { Score } from "@/models/Score";
import { Assignment } from "@/models/Assignment";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChevronLeft, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import ScoringForm from "./ScoringForm";

export default async function ScoringPage({
  params,
  searchParams,
}: {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ roundId?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "judge") {
    redirect("/login");
  }

  await dbConnect();

  const user = await User.findById(session.userId);
  if (!user || user.status !== "active") {
    redirect("/judge");
  }

  const { teamId } = await params;
  const { roundId: roundIdParam } = await searchParams;

  if (roundIdParam && !mongoose.Types.ObjectId.isValid(roundIdParam)) {
    redirect("/judge");
  }

  const team = await Team.findById(teamId);
  if (!team) {
    return <div className="text-white text-center mt-20">Team not found</div>;
  }

  let openRound: Awaited<ReturnType<typeof Round.findOne>> | null = null;

  if (roundIdParam) {
    openRound = await Round.findOne({ _id: roundIdParam, status: "open" });
  } else {
    const assignment = await Assignment.findOne({
      judgeId: session.userId,
      teamId: team._id,
    }).populate({
      path: "roundId",
      match: { status: "open" },
    });
    if (assignment && assignment.roundId) {
      openRound = assignment.roundId as any;
    }
  }

  if (!openRound) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900 p-6">
        <div className="max-w-md text-center bg-white border border-slate-200 p-8 rounded-md shadow-sm">
          <p className="text-slate-600 font-medium">No active round. Scoring is closed.</p>
          <Link href="/judge" className="mt-4 inline-block text-blue-800 font-semibold text-sm hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const assignment = await Assignment.findOne({
    judgeId: session.userId,
    teamId: team._id,
    roundId: openRound._id,
  });

  if (!assignment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900 p-6">
        <div className="max-w-md text-center bg-white border border-slate-200 p-8 rounded-md shadow-sm">
          <p className="text-slate-600 font-medium">You are not assigned to this team for this round.</p>
          <Link href="/judge" className="mt-4 inline-block text-blue-800 font-semibold text-sm hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const criteria = await Criterion.find({ roundId: openRound._id }).sort({ order: 1 });

  const existingScores = await Score.find({
    judgeId: session.userId,
    teamId: team._id,
    roundId: openRound._id,
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 font-sans overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

        <div>
          <Link href="/judge" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 group">
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-sm bg-slate-100 text-slate-600 border border-slate-200">
                  {team.track} Track
                </span>
                <span className="text-green-700 font-bold text-sm bg-green-50 px-2.5 py-1 rounded-sm border border-green-200">
                  {openRound.name}
                </span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
                {team.name}
              </h1>
              <p className="text-slate-600 max-w-2xl">{team.summary}</p>
            </div>

            {team.pitchLink && (
              <a
                href={team.pitchLink.startsWith("http") ? team.pitchLink : `https://${team.pitchLink}`}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-6 rounded-md flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap"
              >
                View Pitch Deck
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-md shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Team Members</h3>
              <ul className="space-y-3">
                {team.members.map((m: any, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-slate-900 font-medium">{m.name}</div>
                      {m.email && <div className="text-slate-500 text-xs">{m.email}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-md shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-6 h-6 text-blue-800" />
                <h2 className="text-2xl font-bold text-slate-900">Scorecard</h2>
              </div>

              {criteria.length === 0 ? (
                <div className="text-center text-slate-500 py-12 border border-slate-200 rounded-md bg-slate-50">
                  The administrator has not configured a rubric for this round yet.
                </div>
              ) : (
                <ScoringForm
                  teamId={team._id.toString()}
                  roundId={openRound._id.toString()}
                  criteria={criteria.map((c) => ({
                    _id: c._id.toString(),
                    name: c.name,
                    description: c.description || "",
                    max: c.max,
                    weight: c.weight,
                    order: c.order,
                  }))}
                  existingScores={existingScores.map((s) => ({
                    criterionId: s.criterionId.toString(),
                    value: s.value,
                    comment: s.comment || null,
                  }))}
                />
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
