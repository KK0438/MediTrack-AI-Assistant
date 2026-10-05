// config/db.js
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

const connectDemoDB = async () => {
  const dbPath = process.env.MONGODB_MEMORY_DB_PATH;
  const options = dbPath
    ? {
        instance: {
          dbPath: resolve(dbPath),
          storageEngine: "wiredTiger",
        },
      }
    : {};

  if (dbPath) {
    await mkdir(resolve(dbPath), { recursive: true });
  }

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