import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const TRACKS = ["PnS", "Social", "KGP", "DeeptechAI", "BlockchainWeb3"] as const;
export type Track = (typeof TRACKS)[number];

export const TEAM_STATUSES = ["pending", "approved", "rejected"] as const;
export type TeamStatus = (typeof TEAM_STATUSES)[number];

const TeamMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, default: null, trim: true, lowercase: true },
    role: { type: String, default: null, trim: true },
  },
  { _id: false },
);

const TeamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    track: { type: String, enum: TRACKS, required: true, index: true },

    pitchTitle: { type: String, default: null, trim: true },
    summary: { type: String, default: null, trim: true },
    pitchLink: { type: String, default: null, trim: true },

    members: { type: [TeamMemberSchema], default: [] },

    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    status: { type: String, enum: TEAM_STATUSES, default: "pending", index: true },
    submissionLocked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type TeamDoc = InferSchemaType<typeof TeamSchema> & { _id: mongoose.Types.ObjectId };

export const Team: Model<TeamDoc> =
  (mongoose.models.Team as Model<TeamDoc>) || mongoose.model<TeamDoc>("Team", TeamSchema);
