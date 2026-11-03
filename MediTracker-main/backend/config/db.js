import { mkdir, rm } from "node:fs/promises";
import { resolve, join } from "node:path";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

const connectDemoDB = async () => {
  const dbPath = process.env.MONGODB_MEMORY_DB_PATH;
  if (dbPath) {
    const fullPath = resolve(dbPath);
    await mkdir(fullPath, { recursive: true });
    // Remove stale lock files from previous unclean shutdowns
    try {
      await rm(join(fullPath, "mongod.lock"), { force: true });
      await rm(join(fullPath, "WiredTiger.lock"), { force: true });
    } catch (_) {}
  }

  const options = dbPath
    ? {
        instance: {
          dbPath: resolve(dbPath),
          storageEngine: "wiredTiger",
        },
      }
    : {};

  memoryServer = await MongoMemoryServer.create(options);
  await mongoose.connect(memoryServer.getUri("meditracker"));
};

export const connectDB = async () => {
  try {
    if (process.env.MONGODB_MEMORY_SERVER === "true") {
      await connectDemoDB();
    } else {
      await mongoose.connect(process.env.MONGO_URI); // No options needed in v7+
    }

    console.log("MongoDB connected successfully...");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};