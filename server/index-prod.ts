import "dotenv/config";
import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import express from "express";
import { app } from "./app.js";

function resolveDistPath() {
  const candidates = [
    path.resolve(process.cwd(), "dist/public"),
    path.resolve(process.cwd(), "client/dist"),
  ];
  return candidates.find((p) => fs.existsSync(p));
}

// static + react
const distPath = resolveDistPath();
if (!distPath) {
  throw new Error("Frontend build not found. Run npm run build first.");
}

app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});

// 🔥 هنا الصح
const server = http.createServer(app);
console.log("DATABASE_URL =", process.env.DATABASE_URL);

const port = Number(process.env.PORT) || 5000;
server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
