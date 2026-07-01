import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/User";
import { createJudge, disableJudge, approveJudge, rejectJudge } from "./actions";
import { ShieldCheck, UserPlus, Ban, Lock, CheckCircle2, XCircle } from "lucide-react";
import ActionForm from "@/components/ActionForm";
import ActionButton from "@/components/ActionButton";
import { Suspense } from "react";
import { JudgeTableSkeleton } from "@/components/Skeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Provision Judges | Empresario",
};

async function JudgeTables() {
  await dbConnect();

  const activeJudges = await User.find({ role: "judge", status: { $ne: "pending" } }).sort({ createdAt: -1 });
  const pendingJudges = await User.find({ role: "judge", status: "pending" }).sort({ createdAt: 1 });

  return (
    <div className="lg:col-span-2 space-y-8">
      {pendingJudges.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md overflow-hidden shadow-sm">
          <div className="p-4 border-b border-amber-200 bg-amber-100">
            <h3 className="font-semibold text-amber-900">Pending Judge Registrations</h3>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-amber-50 text-amber-700">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Judge Name</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Contact</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 bg-white">
                {pendingJudges.map((judge) => (
                  <tr key={judge._id.toString()} className="hover:bg-amber-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200">
                          <ShieldCheck className="w-4 h-4 text-amber-700" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{judge.firstName} {judge.lastName}</div>
                          <div className="text-xs text-slate-500">@{judge.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {judge.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ActionButton actionFn={approveJudge.bind(null, judge._id.toString())} className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-green-50 text-green-700 hover:bg-green-100 font-medium text-xs transition-colors border border-green-200" title="Approve">
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </ActionButton>
                        <ActionButton actionFn={rejectJudge.bind(null, judge._id.toString())} className="p-1.5 text-red-600 hover:bg-red-50 rounded-sm transition-colors border border-red-200" title="Reject">
                          <XCircle className="w-4 h-4" />
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm h-full flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="font-semibold text-slate-900">Active Panel</h3>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Judge Name</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Contact</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {activeJudges.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No active judges on the panel.
                  </td>
                </tr>
              ) : (
                activeJudges.map((judge) => (
                  <tr key={judge._id.toString()} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                          <ShieldCheck className="w-4 h-4 text-blue-800" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{judge.firstName} {judge.lastName}</div>
                          <div className="text-xs text-slate-500">@{judge.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {judge.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {judge.status === "active" ? (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-sm bg-green-50 text-green-700 border border-green-200">Active</span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-sm bg-red-50 text-red-700 border border-red-200">Disabled</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {judge.status === "active" && (
                        <ActionButton actionFn={disableJudge.bind(null, judge._id.toString())} className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors border border-transparent hover:border-red-200" title="Revoke Access">
                          <Ban className="w-4 h-4" />
                        </ActionButton>
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

export default function JudgesPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Provision Judges</h2>
        <p className="text-slate-500 mt-2">
          Create and manage accounts for competition judges. Only admins can create judge accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100">
                <UserPlus className="w-5 h-5 text-blue-800" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">New Judge Account</h3>
            </div>

            <ActionForm actionFn={createJudge}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">First Name</label>
                  <input name="firstName" type="text" required className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Last Name</label>
                  <input name="lastName" type="text" required className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors" />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Username</label>
                <input name="username" type="text" required className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors" />
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Email Address</label>
                <input name="email" type="email" required className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors" />
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Panel Number</label>
                <input name="panelId" type="number" min="1" required placeholder="e.g. 1" className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors placeholder:text-slate-400" />
                <p className="text-[10px] text-slate-500 mt-1">Used to group judges for assignment.</p>
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Temporary Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input name="password" type="text" required className="w-full bg-white border border-slate-300 text-slate-900 rounded-md pl-9 pr-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors" />
                </div>
              </div>

              <button type="submit" className="w-full mt-6 py-3 rounded-md bg-blue-800 hover:bg-blue-900 text-white font-bold text-sm transition-colors">
                Provision Account
              </button>
            </ActionForm>
          </div>
        </div>

        <Suspense fallback={<JudgeTableSkeleton />}>
          <JudgeTables />
        </Suspense>
      </div>
    </div>
  );
}
