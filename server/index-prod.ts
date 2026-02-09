// server/index-prod.ts
import "dotenv/config";
import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import express from "express";
import runApp from "./app.js";

function resolveDistPath() {
  const candidates = [
    path.resolve(process.cwd(), "dist/public"),
    path.resolve(process.cwd(), "client/dist"),
  ];
  return candidates.find((p) => fs.existsSync(p));
}

(async () => {
  const app = await runApp(); // ✅ هنا app بقى موجود

  const distPath = resolveDistPath();
  if (!distPath) {
    throw new Error("Frontend build not found. Run npm run build first.");
  }

  // ✅ static files
  app.use(express.static(distPath));

  // ✅ React Router fix
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API route not found" });
    }
    res.sendFile(path.join(distPath, "index.html"));
  });

  const port = Number(process.env.PORT) || 3000;
  const server = http.createServer(app);

  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${port}`);
  });
})();
