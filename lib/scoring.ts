import dbConnect from "@/lib/dbConnect";
import { Criterion } from "@/models/Criterion";
import { Score } from "@/models/Score";
import { Team } from "@/models/Team";
import { Assignment } from "@/models/Assignment";

export interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  track: string;
  finalScore: number;
  judgesScored: number;
  totalJudgesAssigned: number;
}

export async function calculateLeaderboard(roundId: string): Promise<LeaderboardEntry[]> {
  await dbConnect();

  const criteria = await Criterion.find({ roundId });
  const totalWeight = criteria.reduce((acc, c) => acc + c.weight, 0);

  if (criteria.length === 0 || totalWeight === 0) {
    return [];
  }

  const scores = await Score.find({ roundId });
  const assignments = await Assignment.find({ roundId });
  const teams = await Team.find({ status: "approved" });

  const results: LeaderboardEntry[] = [];

  for (const team of teams) {
    const teamIdStr = team._id.toString();
    const teamAssignments = assignments.filter(a => a.teamId.toString() === teamIdStr);
    
    if (teamAssignments.length === 0) continue; // Skip teams not assigned to this round

    const teamScores = scores.filter(s => s.teamId.toString() === teamIdStr);
    const scoresByJudge: Record<string, typeof scores> = {};
    
    for (const score of teamScores) {
      const jId = score.judgeId.toString();
      if (!scoresByJudge[jId]) scoresByJudge[jId] = [];
      scoresByJudge[jId].push(score);
    }

    let totalTeamScore = 0;
    let judgesCompleted = 0;

    for (const judgeId of Object.keys(scoresByJudge)) {
      const judgeScores = scoresByJudge[judgeId];
      
      let judgeTotal = 0;
      for (const crit of criteria) {
        const critScore = judgeScores.find(s => s.criterionId.toString() === crit._id.toString());
        if (critScore) {
          const normalized = (critScore.value / crit.max) * 100;
          judgeTotal += normalized * (crit.weight / totalWeight);
        }
      }
      
      totalTeamScore += judgeTotal;
      judgesCompleted++;
    }

    const finalScore = judgesCompleted > 0 ? (totalTeamScore / judgesCompleted) : 0;

    results.push({
      teamId: team._id.toString(),
      teamName: team.name,
      track: team.track,
      finalScore: Number(finalScore.toFixed(2)),
      judgesScored: judgesCompleted,
      totalJudgesAssigned: teamAssignments.length
    });
  }

  return results.sort((a, b) => b.finalScore - a.finalScore);
}
