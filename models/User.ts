import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const USER_ROLES = ["admin", "judge", "participant"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["pending", "active", "disabled"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

const UserSchema = new Schema(
  {
    role: { type: String, enum: USER_ROLES, required: true, index: true },
    status: { type: String, enum: USER_STATUSES, default: "pending", index: true },

    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    panelId: { type: Number, default: null },

    teamId: { type: Schema.Types.ObjectId, ref: "Team", default: null, index: true },

    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export const User: Model<UserDoc> =
  (mongoose.models.User as Model<UserDoc>) || mongoose.model<UserDoc>("User", UserSchema);
