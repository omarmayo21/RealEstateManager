import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";

export const app = express();

// Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 🔥 تسجيل كل API routes
registerRoutes(app);
