import { getDashboardStats } from "./actions";
import { Users, ShieldCheck, Clock, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Admin Dashboard | Empresario",
};

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h2>
        <p className="text-slate-600 mt-2">
          Monitor the competition's progress, pending approvals, and active rounds.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Participants Card */}
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Teams</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.totalTeams}</h3>
            </div>
            <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100">
              <Users className="w-5 h-5 text-blue-800" />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Registered participant accounts: <span className="text-slate-700 font-medium">{stats.totalParticipants}</span>
          </p>
        </div>

        {/* Judges Card */}
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Judges</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.activeJudges}</h3>
            </div>
            <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100">
              <ShieldCheck className="w-5 h-5 text-blue-800" />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Total judge accounts: <span className="text-slate-700 font-medium">{stats.totalJudges}</span>
          </p>
        </div>

        {/* Active Round Card */}
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-600">Current Round</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1 leading-tight">{stats.openRoundName}</h3>
            </div>
            <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
              <Clock className="w-5 h-5 text-blue-800" />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Scores are actively being recorded
          </p>
        </div>

        {/* Pending Approvals Card (Alert) */}
        <div className={`bg-white border ${stats.pendingParticipants > 0 ? "border-amber-300 bg-amber-50" : "border-slate-200"} rounded-md p-6 shadow-sm`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className={`text-sm font-medium ${stats.pendingParticipants > 0 ? "text-amber-800" : "text-slate-600"}`}>Pending Approvals</p>
              <h3 className={`text-3xl font-bold mt-1 ${stats.pendingParticipants > 0 ? "text-amber-900" : "text-slate-900"}`}>
                {stats.pendingParticipants}
              </h3>
            </div>
            <div className={`w-10 h-10 rounded-md flex items-center justify-center border ${stats.pendingParticipants > 0 ? "bg-amber-100 border-amber-200" : "bg-slate-50 border-slate-200"}`}>
              <AlertCircle className={`w-5 h-5 ${stats.pendingParticipants > 0 ? "text-amber-600" : "text-slate-400"}`} />
            </div>
          </div>
          <p className={`text-xs ${stats.pendingParticipants > 0 ? "text-amber-700" : "text-slate-500"}`}>
            Participants waiting for access
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/teams" className="group flex items-center justify-between p-5 rounded-md bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                <Users className="w-4 h-4 text-blue-800" />
              </div>
              <span className="font-medium text-sm text-slate-700 group-hover:text-slate-900 transition-colors">Manage Teams</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-800 transition-colors" />
          </Link>
          
          <Link href="/admin/judges" className="group flex items-center justify-between p-5 rounded-md bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                <ShieldCheck className="w-4 h-4 text-blue-800" />
              </div>
              <span className="font-medium text-sm text-slate-700 group-hover:text-slate-900 transition-colors">Provision Judges</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-800 transition-colors" />
          </Link>

          <Link href="/admin/rounds" className="group flex items-center justify-between p-5 rounded-md bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                <Clock className="w-4 h-4 text-blue-800" />
              </div>
              <span className="font-medium text-sm text-slate-700 group-hover:text-slate-900 transition-colors">Configure Rounds</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-800 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
