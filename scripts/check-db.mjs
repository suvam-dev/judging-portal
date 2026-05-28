// Read-only sanity check: counts and a sample row per collection that the
// admin pages render. Confirms Mongo is reachable and the schemas line up.
import { config as loadEnv } from "dotenv";
import mongoose from "mongoose";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI not set.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

const collections = ["users", "teams", "rounds", "criteria", "assignments", "scores", "auditlogs"];

for (const name of collections) {
  const c = db.collection(name);
  const count = await c.countDocuments();
  const sample = await c.findOne({}, { projection: { passwordHash: 0 } });
  console.log(`\n[${name}] count=${count}`);
  if (sample) console.log("  sample:", JSON.stringify(sample));
}

console.log("\n--- admin user ---");
const admin = await db.collection("users").findOne(
  { role: "admin" },
  { projection: { passwordHash: 0 } },
);
console.log(admin ? JSON.stringify(admin, null, 2) : "NONE FOUND");

await mongoose.disconnect();
