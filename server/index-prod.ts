import "dotenv/config";
import runApp from "./app.js";

import fs from "node:fs";
import path from "node:path";
import { type Server } from "node:http";

import express, { type Express } from "express";

function resolveDistPath() {
  const candidates = [
    path.resolve(process.cwd(), "dist/public"),
    path.resolve(import.meta.dirname, "..", "dist", "public"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

export async function serveStatic(app: Express, _server: Server) {
  const distPath = resolveDistPath();

  if (!distPath) {
    throw new Error(
      `Could not find build directory. Checked: ${path.resolve(process.cwd(), "dist/public")} and ${path.resolve(import.meta.dirname, "..", "dist", "public")}. Run the client build first.`,
    );
  }

  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

(async () => {
  await runApp(serveStatic);
})();
