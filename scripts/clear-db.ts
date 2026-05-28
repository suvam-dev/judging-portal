import mongoose from "mongoose";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

async function clearDatabase() {
  try {
    console.log("Connecting to the database...");
    await mongoose.connect(MONGODB_URI!);
    console.log("Connected successfully.");

    // Define the collections to clear
    const collections = mongoose.connection.collections;

    if (Object.keys(collections).length === 0) {
      console.log("No collections found in the database. Exiting...");
      process.exit(0);
    }

    console.log("WARNING: This will delete ALL documents in the following collections:");
    for (const key in collections) {
      console.log(` - ${key}`);
    }

    // Give the user a moment to cancel if they want, but since it's a script we'll just execute.
    // In a real scenario you might want a confirmation prompt, but for a dev script this is fine.
    console.log("\nClearing collections...");

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
      console.log(`Cleared collection: ${key}`);
    }

    console.log("\n✅ Database cleared successfully.");
  } catch (error) {
    console.error("Error clearing database:", error);
  } finally {
    console.log("Disconnecting...");
    await mongoose.disconnect();
    process.exit(0);
  }
}

clearDatabase();
