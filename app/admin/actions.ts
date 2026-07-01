"use server";

import { destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/User";
import { Round } from "@/models/Round";
import { Team } from "@/models/Team";

export async function logoutAdmin() {
  await destroySession();
  redirect("/login");
}

export async function getDashboardStats() {
  await dbConnect();

  try {
    const totalParticipants = await User.countDocuments({ role: "participant" });
    const pendingParticipants = await User.countDocuments({ role: "participant", status: "pending" });
    const totalJudges = await User.countDocuments({ role: "judge" });
    const activeJudges = await User.countDocuments({ role: "judge", status: "active" });
    
    const openRounds = await Round.find({ status: "open" }).sort({ order: 1 });
    const totalTeams = await Team.countDocuments();

    return {
      totalParticipants,
      pendingParticipants,
      totalJudges,
      activeJudges,
      totalTeams,
      openRoundNames: openRounds.map((r) => r.name),
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      totalParticipants: 0,
      pendingParticipants: 0,
      totalJudges: 0,
      activeJudges: 0,
      totalTeams: 0,
      openRoundNames: [],
    };
  }
}
