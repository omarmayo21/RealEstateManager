// server/app.ts
import express, { type Express } from "express";
import cors from "cors";
import { createServer, type Server } from "node:http";
import { registerRoutes } from "./routes.js";

export type SetupFn = (app: Express, server: Server) => Promise<void>;

export default async function runApp(setup?: SetupFn) {
  const app = express();
  const server = createServer(app);

  app.use(cors({ origin: true, credentials: true }));


  registerRoutes(app);
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  if (setup) {
    await setup(app, server);
  }

  return app; // 🔴 مهم
}
