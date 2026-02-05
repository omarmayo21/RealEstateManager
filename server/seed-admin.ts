import "dotenv/config";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "../shared/schema.js";


const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function run() {
  const hash = await bcrypt.hash("mars@3011#", 10);

  await db.insert(schema.adminUsers).values({
    username: "mars",
    passwordHash: hash,
  });

  console.log("Admin created successfully!");
  process.exit();
}

run();
