import express, { type Express } from "express";
import cors from "cors";
import { createServer, type Server } from "node:http";
import path from "node:path";
import fs from "node:fs";
import { registerRoutes } from "./routes.js";

type SetupFn = (app: Express, server: Server) => Promise<void>;

export default async function runApp(setup?: SetupFn) {
  const app = express();
  const server = createServer(app);

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  registerRoutes(app);

  // ✅ PROD: serve frontend
  if (!setup) {
    const distPath = path.resolve(process.cwd(), "client/dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        if (req.path.startsWith("/api")) {
          return res.status(404).json({ error: "API route not found" });
        }
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  if (setup) {
    await setup(app, server);
  }

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
