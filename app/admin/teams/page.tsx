import dbConnect from "@/lib/dbConnect";
import { Team } from "@/models/Team";
import { User } from "@/models/User";
import { approveTeam, rejectTeam } from "./actions";
import { CheckCircle, XCircle, Search, User as UserIcon } from "lucide-react";
import ActionButton from "@/components/ActionButton";

export const metadata = {
  title: "Manage Teams | Empressario",
};

export default async function TeamsPage() {
  await dbConnect();
  
  // Fetch all teams and populate the owner's info
  const teams = await Team.find({}).populate("ownerUserId", "firstName lastName email").sort({ createdAt: -1 });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Manage Teams</h2>
        <p className="text-zinc-400 mt-2">
          Review participant applications, approve valid teams, and manage their portal access.
        </p>
      </div>

      {/* Table Container */}
      <div className="backdrop-blur-xl bg-[#0d0d18]/60 border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.2)]">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search teams..." 
              className="bg-black/20 border border-white/[0.05] rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-black/40 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Team Name</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Track</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Owner / Contact</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {teams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No teams have registered yet.
                  </td>
                </tr>
              ) : (
                teams.map((team) => (
                  <tr key={team._id.toString()} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                      {team.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {team.track}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                          <UserIcon className="w-3 h-3 text-zinc-400" />
                        </div>
                        <div>
                          <div className="text-white text-xs">{(team.ownerUserId as any)?.firstName} {(team.ownerUserId as any)?.lastName}</div>
                          <div className="text-zinc-500 text-[10px]">{(team.ownerUserId as any)?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {team.status === "pending" && (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>
                      )}
                      {team.status === "approved" && (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">Approved</span>
                      )}
                      {team.status === "rejected" && (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">Rejected</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {team.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <ActionButton actionFn={approveTeam.bind(null, team._id.toString())} className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors border border-transparent hover:border-green-500/30" title="Approve">
                            <CheckCircle className="w-5 h-5" />
                          </ActionButton>
                          <ActionButton actionFn={rejectTeam.bind(null, team._id.toString())} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/30" title="Reject">
                            <XCircle className="w-5 h-5" />
                          </ActionButton>
                        </div>
                      ) : (
                        <span className="text-zinc-600 text-xs italic">Reviewed</span>
                      )}
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
