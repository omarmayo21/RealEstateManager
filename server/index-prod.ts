import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import express from "express";
import type { Express } from "express";
import http from "node:http";

import runApp from "./app.js"; // نفس runApp عندك

function resolveDistPath() {
  const candidates = [
    path.resolve(process.cwd(), "dist/public"),
    path.resolve(process.cwd(), "client/dist"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

export async function serveStatic(app: Express, _server: http.Server) {
  const distPath = resolveDistPath();

  if (!distPath) {
    throw new Error("Frontend build not found. Run npm run build first.");
  }

  // 1️⃣ static files
  app.use(express.static(distPath));

  // 2️⃣ تجاهل API routes
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    // 3️⃣ fallback للـ React
    res.sendFile(path.join(distPath, "index.html"));
  });
}

(async () => {
  await runApp(serveStatic);
})();
