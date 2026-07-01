import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { User, type UserDoc } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export class AuthError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function requireAdmin(): Promise<UserDoc> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) throw new AuthError("Unauthorized", 401);

  let userId: string;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "admin") throw new AuthError("Forbidden", 403);
    userId = payload.sub as string;
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new AuthError("Unauthorized", 401);
  }

  await dbConnect();
  const actor = await User.findById(userId);
  if (!actor || actor.role !== "admin" || actor.status !== "active") {
    throw new AuthError("Forbidden", 403);
  }
  return actor;
}

export async function audit(
  actor: UserDoc,
  action: string,
  target?: { type: string; id: string | mongoose.Types.ObjectId },
  metadata?: Record<string, unknown>,
): Promise<void> {
  await AuditLog.create({
    actorId: actor._id,
    action,
    targetType: target?.type ?? null,
    targetId: target ? new mongoose.Types.ObjectId(String(target.id)) : null,
    metadata: metadata ?? null,
  });
}
