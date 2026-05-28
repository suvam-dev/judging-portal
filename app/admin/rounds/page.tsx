import dbConnect from "@/lib/dbConnect";
import { Round } from "@/models/Round";
import { createRound, updateRoundStatus } from "./actions";
import { Clock, Plus, PlayCircle, StopCircle, Eye } from "lucide-react";
import ActionForm from "@/components/ActionForm";
import ActionButton from "@/components/ActionButton";

export const metadata = {
  title: "Configure Rounds | Empresario",
};

export default async function RoundsPage() {
  await dbConnect();
  
  const rounds = await Round.find({}).sort({ order: 1 });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Configure Rounds</h2>
        <p className="text-slate-500 mt-2">
          Create scoring rounds (e.g. Semi-Finals, Finals) and control when they open and close.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Round Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100">
                <Plus className="w-5 h-5 text-blue-800" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Create Round</h3>
            </div>

            <ActionForm actionFn={createRound}>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Round Name</label>
                <input name="name" type="text" placeholder="e.g., Semi-Finals" required className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors placeholder:text-slate-400" />
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">Chronological Order</label>
                <input name="order" type="number" min="1" placeholder="1" required className="w-full bg-white border border-slate-300 text-slate-900 rounded-md px-3 py-2 text-sm focus:border-blue-600 outline-none transition-colors placeholder:text-slate-400" />
                <p className="text-[10px] text-slate-500 mt-1">Controls the sequence of the competition.</p>
              </div>

              <button type="submit" className="w-full mt-6 py-3 rounded-md bg-blue-800 hover:bg-blue-900 text-white font-bold text-sm transition-colors">
                Add Round
              </button>
            </ActionForm>
          </div>
        </div>

        {/* Existing Rounds List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900">Timeline</h3>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-4">
              {rounds.length === 0 ? (
                <div className="text-center text-slate-500 py-12">
                  No rounds have been configured.
                </div>
              ) : (
                rounds.map((round) => (
                  <div key={round._id.toString()} className={`p-5 rounded-md border ${round.status === 'open' ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'} flex items-center justify-between transition-all`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${round.status === 'open' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-600 border border-slate-300'}`}>
                        {round.order}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">{round.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {round.status === "draft" && <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm bg-slate-200 text-slate-700">Draft</span>}
                          {round.status === "open" && <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm bg-green-100 border border-green-200 text-green-800 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>Live Now</span>}
                          {round.status === "closed" && <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm bg-amber-100 border border-amber-200 text-amber-800">Closed</span>}
                          {round.status === "published" && <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm bg-purple-100 border border-purple-200 text-purple-800">Results Published</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {round.status === "draft" && (
                        <ActionButton actionFn={updateRoundStatus.bind(null, round._id.toString(), "open")} className="flex items-center gap-2 px-4 py-2 rounded-sm bg-green-100 border border-green-200 text-green-800 hover:bg-green-200 font-medium text-xs transition-colors">
                          <PlayCircle className="w-4 h-4" /> Start Round
                        </ActionButton>
                      )}
                      
                      {round.status === "open" && (
                        <ActionButton actionFn={updateRoundStatus.bind(null, round._id.toString(), "closed")} className="flex items-center gap-2 px-4 py-2 rounded-sm bg-red-100 border border-red-200 text-red-800 hover:bg-red-200 font-medium text-xs transition-colors">
                          <StopCircle className="w-4 h-4" /> Close Round
                        </ActionButton>
                      )}

                      {round.status === "closed" && (
                        <ActionButton actionFn={updateRoundStatus.bind(null, round._id.toString(), "published")} className="flex items-center gap-2 px-4 py-2 rounded-sm bg-purple-100 border border-purple-200 text-purple-800 hover:bg-purple-200 font-medium text-xs transition-colors">
                          <Eye className="w-4 h-4" /> Publish Results
                        </ActionButton>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
