import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const ROUND_STATUSES = ["draft", "open", "closed", "published"] as const;
export type RoundStatus = (typeof ROUND_STATUSES)[number];

const RoundSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    order: { type: Number, required: true, index: true },
    status: { type: String, enum: ROUND_STATUSES, default: "draft", index: true },

    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },

    scoresEditable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

RoundSchema.index({ order: 1 }, { unique: true });

export type RoundDoc = InferSchemaType<typeof RoundSchema> & { _id: mongoose.Types.ObjectId };

export const Round: Model<RoundDoc> =
  (mongoose.models.Round as Model<RoundDoc>) || mongoose.model<RoundDoc>("Round", RoundSchema);
