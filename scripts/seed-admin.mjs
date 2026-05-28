// Idempotent admin seed. Reads ADMIN_EMAIL and ADMIN_PASSWORD from env,
// upserts a single admin User. Re-run to rotate the password.
//
// Usage:
//   ADMIN_EMAIL=admin@ecell-iitkgp.in ADMIN_PASSWORD='...' node scripts/seed-admin.mjs
import { config as loadEnv } from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Match Next.js: .env.local takes precedence over .env.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not set (check .env.local).");
  process.exit(1);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be provided.");
  process.exit(1);
}

// Write directly against the collection — bypassing Mongoose document
// hydration avoids subtleties with select:false fields and pre-save hooks.
await mongoose.connect(MONGODB_URI);
const users = mongoose.connection.db.collection("users");

const email = ADMIN_EMAIL.toLowerCase();
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
const now = new Date();

const result = await users.updateOne(
  { email },
  {
    $set: { passwordHash, role: "admin", status: "active", updatedAt: now },
    $setOnInsert: {
      username: "admin",
      firstName: "Admin",
      lastName: "ECell",
      panelId: null,
      teamId: null,
      lastLoginAt: null,
      createdAt: now,
    },
  },
  { upsert: true },
);

console.log(
  result.upsertedCount
    ? `Created admin: ${email} (id=${result.upsertedId})`
    : `Updated existing admin: ${email}`,
);

await mongoose.disconnect();
