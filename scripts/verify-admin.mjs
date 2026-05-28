// Verifies that the stored bcrypt hash for the admin matches a given password.
// Usage: ADMIN_PASSWORD='...' node scripts/verify-admin.mjs
import { config as loadEnv } from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const { MONGODB_URI, ADMIN_PASSWORD } = process.env;
if (!MONGODB_URI || !ADMIN_PASSWORD) {
  console.error("MONGODB_URI and ADMIN_PASSWORD required.");
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
const user = await mongoose.connection.db
  .collection("users")
  .findOne({ email: "admin@ecell-iitkgp.in" });

if (!user) {
  console.log("ADMIN NOT FOUND");
  process.exit(1);
}

console.log("email:        ", user.email);
console.log("username:     ", user.username);
console.log("role:         ", user.role);
console.log("status:       ", user.status);
console.log("hash prefix:  ", user.passwordHash?.slice(0, 7));
console.log("hash length:  ", user.passwordHash?.length);

const ok = await bcrypt.compare(ADMIN_PASSWORD, user.passwordHash);
console.log("\nbcrypt.compare(ADMIN_PASSWORD, storedHash) =>", ok);

await mongoose.disconnect();
