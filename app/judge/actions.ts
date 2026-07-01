"use server";

import dbConnect from "@/lib/dbConnect";
import { Round } from "@/models/Round";
import { Score } from "@/models/Score";
import { Assignment } from "@/models/Assignment";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitScores(prevState: any, formData: FormData) {
  try {
    const session = await getSession();
    if (!session || session.role !== "judge") {
      return { error: "Unauthorized. Only judges can submit scores." };
    }

    await dbConnect();

    const teamId = formData.get("teamId") as string;
    const roundId = formData.get("roundId") as string;

    if (!teamId || !roundId) {
      return { error: "Missing team or round identification." };
    }

    const round = await Round.findById(roundId);
    if (!round || round.status !== "open") {
      return { error: "Scoring is currently closed for this round." };
    }

    const assignment = await Assignment.findOne({
      judgeId: session.userId,
      teamId,
      roundId,
    });

    if (!assignment) {
      return { error: "You are not assigned to score this team for this round." };
    }

    const scoresToUpsert = [];
    
    for (const [key, value] of Array.from(formData.entries())) {
      if (key.startsWith("score_") && value) {
        const criterionId = key.replace("score_", "");
        const numValue = parseFloat(value as string);
        const comment = formData.get(`comment_${criterionId}`) as string || null;

        if (isNaN(numValue)) {
          return { error: "Invalid numeric score provided." };
        }

        scoresToUpsert.push({
          criterionId,
          value: numValue,
          comment,
        });
      }
    }

    if (scoresToUpsert.length === 0) {
      return { error: "No scores provided." };
    }

    for (const score of scoresToUpsert) {
      await Score.findOneAndUpdate(
        {
          roundId,
          judgeId: session.userId,
          teamId,
          criterionId: score.criterionId,
        },
        {
          $set: {
            value: score.value,
            comment: score.comment,
          },
        },
        { upsert: true, new: true }
      );
    }

    revalidatePath(`/judge/scoring/${teamId}`);
    return { error: null, success: true };
  } catch (error: any) {
    console.error("Scoring Error:", error);
    return { error: error.message || "An unexpected error occurred while saving scores." };
  }
}
