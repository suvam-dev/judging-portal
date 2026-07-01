import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ScoreSchema = new Schema(
  {
    roundId: { type: Schema.Types.ObjectId, ref: "Round", required: true, index: true },
    judgeId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    criterionId: { type: Schema.Types.ObjectId, ref: "Criterion", required: true, index: true },

    value: { type: Number, required: true, min: 0 },
    comment: { type: String, default: null, trim: true },
  },
  { timestamps: true },
);

ScoreSchema.index(
  { roundId: 1, judgeId: 1, teamId: 1, criterionId: 1 },
  { unique: true },
);

export type ScoreDoc = InferSchemaType<typeof ScoreSchema> & { _id: mongoose.Types.ObjectId };

export const Score: Model<ScoreDoc> =
  (mongoose.models.Score as Model<ScoreDoc>) || mongoose.model<ScoreDoc>("Score", ScoreSchema);
