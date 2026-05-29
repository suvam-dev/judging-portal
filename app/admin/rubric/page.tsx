import dbConnect from "@/lib/dbConnect";
import { Round } from "@/models/Round";
import { Criterion } from "@/models/Criterion";
import { deleteCriterion } from "./actions";
import { FileCheck2, Plus, Trash2 } from "lucide-react";
import RubricForm from "./RubricForm";
import ActionButton from "@/components/ActionButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Configure Rubric | Empresario",
};

export default async function RubricPage() {
  await dbConnect();
  
  const rounds = await Round.find({}).sort({ order: 1 });
  
  // Group criteria by roundId
  const criteriaList = await Criterion.find({}).sort({ order: 1 });
  const criteriaByRound = criteriaList.reduce((acc, criteria) => {
    const rId = criteria.roundId.toString();
    if (!acc[rId]) acc[rId] = [];
    acc[rId].push(criteria);
    return acc;
  }, {} as Record<string, typeof criteriaList>);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Scoring Rubric</h2>
        <p className="text-slate-500 mt-2">
          Define the scoring criteria (e.g. Innovation, Market Fit) for each round.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Criterion Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100">
                <Plus className="w-5 h-5 text-blue-800" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Add Criterion</h3>
            </div>

            <RubricForm rounds={rounds.map(r => ({ _id: r._id.toString(), name: r.name }))} />
          </div>
        </div>

        {/* Existing Rubric List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-semibold text-slate-900">Configured Rubrics</h3>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar p-6 space-y-8">
              {rounds.length === 0 ? (
                <div className="text-center text-slate-500 py-12">
                  No rounds or rubrics exist.
                </div>
              ) : (
                rounds.map((round) => {
                  const roundCriteria = criteriaByRound[round._id.toString()] || [];
                  
                  return (
                    <div key={round._id.toString()} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                          {round.order}
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">{round.name} Rubric</h4>
                      </div>

                      {roundCriteria.length === 0 ? (
                        <div className="p-4 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-500">
                          No criteria defined for this round yet.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {roundCriteria.map(crit => (
                            <div key={crit._id.toString()} className="p-4 rounded-md border border-slate-200 bg-slate-50 relative group">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-xs text-blue-800 font-semibold mb-1">#{crit.order}</div>
                                  <h5 className="font-bold text-slate-900 text-sm">{crit.name}</h5>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-slate-500 uppercase tracking-wider">Out of</div>
                                  <div className="font-bold text-slate-900">{crit.max} pts</div>
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{crit.description || "No description provided."}</p>
                              
                              <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-sm bg-white border border-slate-200 text-slate-500">
                                  Weight: {crit.weight}x
                                </span>
                                
                                <ActionButton actionFn={deleteCriterion.bind(null, crit._id.toString())} className="text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                  <Trash2 className="w-4 h-4" />
                                </ActionButton>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
