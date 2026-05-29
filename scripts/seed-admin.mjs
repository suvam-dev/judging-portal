
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

// Schema mirrors models/User.ts. We use the same collection name ("users").
const UserSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    status: { type: String, default: "pending" },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    panelId: { type: Number, default: null },
    teamId: { type: mongoose.Schema.Types.ObjectId, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

await mongoose.connect(MONGODB_URI);

const email = ADMIN_EMAIL.toLowerCase();
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

const existing = await User.findOne({ email });
if (existing) {
  existing.passwordHash = passwordHash;
  existing.role = "admin";
  existing.status = "active";
  await existing.save();
  console.log(`Updated existing admin: ${email} (id=${existing._id})`);
} else {
  const created = await User.create({
    role: "admin",
    status: "active",
    username: "admin",
    email,
    passwordHash,
    firstName: "Admin",
    lastName: "ECell",
  });
  console.log(`Created admin: ${email} (id=${created._id})`);
}

await mongoose.disconnect();
