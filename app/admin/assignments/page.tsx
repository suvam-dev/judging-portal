import dbConnect from "@/lib/dbConnect";
import { Round } from "@/models/Round";
import { User } from "@/models/User";
import { Team } from "@/models/Team";
import { Assignment } from "@/models/Assignment";
import { assignJudgeToTeams, removeAssignment } from "./actions";
import { Link2, Trash2, Users } from "lucide-react";
import ActionForm from "@/components/ActionForm";
import ActionButton from "@/components/ActionButton";
import { Suspense } from "react";
import { AssignmentsContentSkeleton } from "@/components/Skeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Assignments | Empresario",
};

async function AssignmentsContent() {
  await dbConnect();

  const rounds = await Round.find({}).sort({ order: 1 });
  const judges = await User.find({ role: "judge" }).sort({ panelId: 1 });
  const teams = await Team.find({ status: "approved" }).sort({ name: 1 });

  const assignments = await Assignment.find({})
    .populate("roundId", "name")
    .populate("judgeId", "firstName lastName panelId")
    .populate("teamId", "name track")
    .sort({ createdAt: -1 });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-1">
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100">
              <Link2 className="w-5 h-5 text-blue-800" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Assign Teams</h3>
          </div>

          <ActionForm actionFn={assignJudgeToTeams}>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Target Round</label>
              <select name="roundId" required className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2.5 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors appearance-none">
                {rounds.map(r => (
                  <option key={r._id.toString()} value={r._id.toString()}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Select Judge</label>
              <select name="judgeId" required className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2.5 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors appearance-none">
                {judges.map(j => (
                  <option key={j._id.toString()} value={j._id.toString()}>
                    Panel {j.panelId} - {j.firstName} {j.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">Select Teams to Assign</label>
              <div className="h-64 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-2 bg-slate-50">
                {teams.length === 0 ? (
                  <div className="text-xs text-slate-500 p-2 text-center">No approved teams available.</div>
                ) : (
                  teams.map(t => (
                    <label key={t._id.toString()} className="flex items-center gap-3 p-3 rounded-sm border border-slate-200 bg-white cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors">
                      <input type="checkbox" name="teamIds" value={t._id.toString()} className="w-4 h-4 rounded border-slate-300 text-blue-800 focus:ring-blue-600" />
                      <div>
                        <div className="font-bold text-sm text-slate-900">{t.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{t.track}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <button type="submit" className="w-full mt-6 py-3 rounded-md bg-blue-800 hover:bg-blue-900 text-white font-bold text-sm transition-colors">
              Save Assignments
            </button>
          </ActionForm>
        </div>
      </div>

      <div className="xl:col-span-2">
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm h-full flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Active Assignments Map</h3>
            <div className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-sm border border-slate-200 font-medium">
              Total: {assignments.length}
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold border-b border-slate-200">Round</th>
                  <th className="px-6 py-4 font-semibold border-b border-slate-200">Judge</th>
                  <th className="px-6 py-4 font-semibold border-b border-slate-200">Assigned Team</th>
                  <th className="px-6 py-4 font-semibold text-right border-b border-slate-200">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      No assignments have been created.
                    </td>
                  </tr>
                ) : (
                  assignments.map((assignment: any) => (
                    <tr key={assignment._id.toString()} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-900 font-medium">
                        {assignment.roundId?.name || "Deleted Round"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-sm flex items-center justify-center bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-100">
                            {assignment.judgeId?.panelId || "?"}
                          </span>
                          <span className="text-slate-700">
                            {assignment.judgeId ? `${assignment.judgeId.firstName} ${assignment.judgeId.lastName}` : "Deleted Judge"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-900 font-semibold">
                            {assignment.teamId?.name || "Deleted Team"}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-500 border border-slate-200">
                            {assignment.teamId?.track || ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ActionButton actionFn={removeAssignment.bind(null, assignment._id.toString())} className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm p-1.5 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </ActionButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssignmentsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Judge Assignments</h2>
        <p className="text-slate-500 mt-2">
          Map judges to teams for specific scoring rounds.
        </p>
      </div>

      <Suspense fallback={<AssignmentsContentSkeleton />}>
        <AssignmentsContent />
      </Suspense>
    </div>
  );
}
