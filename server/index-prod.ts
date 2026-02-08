import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import express from "express";
import type { Express } from "express";

import runApp, { app } from "./app.js";

/**
 * نحدد فين build بتاع الفرونت
 */
function resolveDistPath() {
  const candidates = [
    path.resolve(process.cwd(), "dist/public"),
    path.resolve(process.cwd(), "client/dist"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

/**
 * static + react fallback
 */
async function serveStatic(app: Express) {
  const distPath = resolveDistPath();

  if (!distPath) {
    throw new Error("Frontend build not found. Run npm run build first.");
  }

  // 1️⃣ static files
  app.use(express.static(distPath));

  // 2️⃣ react fallback (GET فقط + مش API)
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API route not found" });
    }

    res.sendFile(path.join(distPath, "index.html"));
  });
}

/**
 * bootstrap
 */
(async () => {
  // 1️⃣ شغّل الـ API routes
  await runApp(async () => {});

  // 2️⃣ بعدها فعّل static + react
  await serveStatic(app);
})();
