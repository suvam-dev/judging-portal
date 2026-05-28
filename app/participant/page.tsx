import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/User";
import { Team } from "@/models/Team";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldAlert, CheckCircle, Clock, Link as LinkIcon, Users, Rocket } from "lucide-react";

export const metadata = {
  title: "Participant Portal | Empresario",
};

export default async function ParticipantPage() {
  const session = await getSession();
  if (!session || session.role !== "participant") {
    redirect("/login");
  }

  await dbConnect();

  const user = await User.findById(session.userId);
  const team = await Team.findOne({ ownerUserId: session.userId });

  if (!user || !team) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900 p-6">
        <div className="max-w-md text-center bg-white border border-slate-200 shadow-sm p-8 rounded-md">
          <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Account Error</h1>
          <p className="text-slate-600">We could not find your team registration data. Please contact an administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 font-sans overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Welcome, {user.firstName}
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Startup Pitch Portal
            </p>
          </div>
          
          <div className="bg-white border border-slate-200 px-5 py-3 rounded-md flex items-center gap-3 shadow-sm">
            <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Status:</span>
            {team.status === "pending" && (
              <span className="flex items-center gap-2 text-amber-700 font-bold bg-amber-50 px-3 py-1.5 rounded-sm border border-amber-200">
                <Clock className="w-4 h-4" /> Under Review
              </span>
            )}
            {team.status === "approved" && (
              <span className="flex items-center gap-2 text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded-sm border border-green-200">
                <CheckCircle className="w-4 h-4" /> Approved
              </span>
            )}
            {team.status === "rejected" && (
              <span className="flex items-center gap-2 text-red-700 font-bold bg-red-50 px-3 py-1.5 rounded-sm border border-red-200">
                <ShieldAlert className="w-4 h-4" /> Rejected
              </span>
            )}
          </div>
        </div>

        {/* Status Banner */}
        {team.status === "pending" && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-6 flex gap-4 shadow-sm">
            <div className="mt-1">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900">Your registration is being reviewed</h3>
              <p className="text-amber-800 mt-1 text-sm">
                The organizing committee is currently reviewing your pitch submission. You will be fully admitted into the portal once an admin approves your team. Sit tight!
              </p>
            </div>
          </div>
        )}

        {/* Team Details Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md p-8">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-200">
            <div className="w-12 h-12 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100">
              <Rocket className="w-6 h-6 text-blue-800" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{team.name}</h2>
              <div className="text-sm text-blue-800 font-semibold tracking-wider uppercase mt-1">
                {team.track} Track
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Registered Members
                </h4>
                <div className="space-y-3">
                  {team.members.map((member: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-md bg-slate-50 border border-slate-200">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs border border-blue-200">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{member.name}</div>
                        <div className="text-xs text-slate-600">{member.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" /> Pitch Materials
                </h4>
                {team.pitchLink ? (
                  <a 
                    href={team.pitchLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block p-4 rounded-md bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors group"
                  >
                    <div className="text-blue-800 font-bold mb-1 flex items-center justify-between">
                      View Pitch Deck
                      <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <div className="text-xs text-blue-700 truncate">{team.pitchLink}</div>
                  </a>
                ) : (
                  <div className="p-4 rounded-md bg-slate-50 border border-slate-200 text-sm text-slate-500 italic">
                    No pitch deck link provided during registration.
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Project Summary
                </h4>
                <div className="p-4 rounded-md bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
                  {team.summary}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
