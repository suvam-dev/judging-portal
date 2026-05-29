import dbConnect from "@/lib/dbConnect";
import { Team } from "@/models/Team";
import { User } from "@/models/User";
import { approveTeam, rejectTeam } from "./actions";
import { CheckCircle, XCircle, Search, User as UserIcon } from "lucide-react";
import ActionButton from "@/components/ActionButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage Teams | Empresario",
};

export default async function TeamsPage() {
  await dbConnect();
  
  // Fetch all teams and populate the owner's info
  const teams = await Team.find({}).populate("ownerUserId", "firstName lastName email").sort({ createdAt: -1 });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Manage Teams</h2>
        <p className="text-slate-500 mt-2">
          Review participant applications, approve valid teams, and manage their portal access.
        </p>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search teams..." 
              className="bg-white border border-slate-300 rounded-md pl-9 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors w-64 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Team Name</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Track</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Owner / Contact</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {teams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No teams have registered yet.
                  </td>
                </tr>
              ) : (
                teams.map((team) => (
                  <tr key={team._id.toString()} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                      {team.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-sm bg-blue-50 text-blue-800 border border-blue-200">
                        {team.track}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                          <UserIcon className="w-3 h-3 text-slate-500" />
                        </div>
                        <div>
                          <div className="text-slate-900 font-medium text-xs">{(team.ownerUserId as any)?.firstName} {(team.ownerUserId as any)?.lastName}</div>
                          <div className="text-slate-500 text-[10px]">{(team.ownerUserId as any)?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {team.status === "pending" && (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-sm bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
                      )}
                      {team.status === "approved" && (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-sm bg-green-50 text-green-700 border border-green-200">Approved</span>
                      )}
                      {team.status === "rejected" && (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-sm bg-red-50 text-red-700 border border-red-200">Rejected</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {team.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <ActionButton actionFn={approveTeam.bind(null, team._id.toString())} className="p-1.5 text-green-600 hover:bg-green-50 rounded-sm transition-colors border border-transparent hover:border-green-200" title="Approve">
                            <CheckCircle className="w-5 h-5" />
                          </ActionButton>
                          <ActionButton actionFn={rejectTeam.bind(null, team._id.toString())} className="p-1.5 text-red-600 hover:bg-red-50 rounded-sm transition-colors border border-transparent hover:border-red-200" title="Reject">
                            <XCircle className="w-5 h-5" />
                          </ActionButton>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Reviewed</span>
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
