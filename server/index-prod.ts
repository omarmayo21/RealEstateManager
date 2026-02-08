import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import express from "express";
import type { Express } from "express";

import runApp, { app } from "./app.js";

function resolveDistPath() {
  const candidates = [
    path.resolve(process.cwd(), "dist/public"),
    path.resolve(process.cwd(), "client/dist"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function serveStatic(app: Express) {
  const distPath = resolveDistPath();

  if (!distPath) {
    throw new Error("Frontend build not found. Run npm run build first.");
  }

  // static files
  app.use(express.static(distPath));

  // react fallback (بعد الـ API)
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

(async () => {
  // 1️⃣ شغّل API (لازم function حتى لو فاضية)
  await runApp(async () => {});

  // 2️⃣ بعده فعّل static + react
  await serveStatic(app);
})();
