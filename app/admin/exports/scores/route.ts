import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Round } from "@/models/Round";
import { Score } from "@/models/Score";
import { Team } from "@/models/Team";
import { User } from "@/models/User";
import { Criterion } from "@/models/Criterion";
import { requireAdmin, AuthError } from "@/lib/adminAuth";
import { toCsv, csvResponse } from "@/lib/csv";

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AuthError) {
      return new Response(err.message, { status: err.status });
    }
    throw err;
  }

  await dbConnect();

  const url = new URL(req.url);
  const roundParam = url.searchParams.get("round"); // optional: filter to one round

  // 1. Load all rounds (or just the requested one)
  const roundsQuery = roundParam ? { _id: roundParam } : {};
  const rounds = await Round.find(roundsQuery).sort({ order: 1 });

  if (rounds.length === 0) {
    return new Response("No rounds found", { status: 404 });
  }

  // 2. Build lookup maps for fast access
  const roundIds = rounds.map((r) => r._id);
  const roundMap = new Map(rounds.map((r) => [r._id.toString(), r]));

  const criteria = await Criterion.find({ roundId: { $in: roundIds } }).sort({ order: 1 });
  const criterionMap = new Map(criteria.map((c) => [c._id.toString(), c]));

  const teams = await Team.find({}).sort({ name: 1 });
  const teamMap = new Map(teams.map((t) => [t._id.toString(), t]));

  const judges = await User.find({ role: "judge" }).sort({ panelId: 1, lastName: 1 });
  const judgeMap = new Map(judges.map((j) => [j._id.toString(), j]));

  // 3. Fetch all scores for the target round(s)
  const scores = await Score.find({ roundId: { $in: roundIds } }).sort({ createdAt: 1 });

  if (scores.length === 0) {
    return new Response("No scores recorded yet", { status: 404 });
  }

  // 4. Build rows — one row per individual score entry
  const headers = [
    "round_order",
    "round_name",
    "round_status",
    "team_name",
    "track",
    "judge_name",
    "judge_username",
    "panel_id",
    "criterion_name",
    "criterion_order",
    "score_given",
    "max_score",
    "weight",
    "score_pct",
    "weighted_contribution",
    "comment",
    "scored_at",
  ];

  const rows = scores.map((s) => {
    const round = roundMap.get(s.roundId.toString());
    const team = teamMap.get(s.teamId.toString());
    const judge = judgeMap.get(s.judgeId.toString());
    const crit = criterionMap.get(s.criterionId.toString());

    // Total weight for the round — needed to compute weighted contribution
    const roundCriteria = criteria.filter(
      (c) => c.roundId.toString() === s.roundId.toString()
    );
    const totalWeight = roundCriteria.reduce((acc, c) => acc + c.weight, 0);

    const scorePct = crit ? (s.value / crit.max) * 100 : 0;
    const weightedContrib =
      crit && totalWeight > 0 ? scorePct * (crit.weight / totalWeight) : 0;

    return [
      round?.order ?? "",
      round?.name ?? "Unknown Round",
      round?.status ?? "",
      team?.name ?? "Unknown Team",
      team?.track ?? "",
      judge ? `${judge.firstName} ${judge.lastName}` : "Unknown Judge",
      judge?.username ?? "",
      judge?.panelId ?? "",
      crit?.name ?? "Unknown Criterion",
      crit?.order ?? "",
      s.value,
      crit?.max ?? "",
      crit?.weight ?? "",
      scorePct.toFixed(2),
      weightedContrib.toFixed(4),
      s.comment ?? "",
      s.createdAt ? new Date(s.createdAt as any).toISOString() : "",
    ];
  });

  const csv = toCsv(headers, rows);

  const suffix = roundParam
    ? (rounds[0]?.name ?? "round").toLowerCase().replace(/[^a-z0-9]+/g, "-")
    : "all-rounds";

  return csvResponse(
    `empresario-detailed-scores-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`,
    csv
  );
}
