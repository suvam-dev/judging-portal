import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AuditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    action: { type: String, required: true, index: true },

    targetType: { type: String, default: null },
    targetId: { type: Schema.Types.ObjectId, default: null },

    metadata: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type AuditLogDoc = InferSchemaType<typeof AuditLogSchema> & { _id: mongoose.Types.ObjectId };

export const AuditLog: Model<AuditLogDoc> =
  (mongoose.models.AuditLog as Model<AuditLogDoc>) ||
  mongoose.model<AuditLogDoc>("AuditLog", AuditLogSchema);
