import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "../shared/schema.js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function run() {
  const users = await db.select().from(schema.adminUsers);
  console.log(users);
  process.exit();
}

run();
