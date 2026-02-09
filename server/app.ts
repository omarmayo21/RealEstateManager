import express, { type Express } from "express";
import cors from "cors";
import { createServer, type Server } from "node:http";
import { registerRoutes } from "./routes.js";

type SetupFn = (app: Express, server: Server) => Promise<void>;

export default async function runApp(setup?: SetupFn) {
  const app = express();
  const server = createServer(app);

  // Middlewares
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // API routes
  registerRoutes(app);

  // Vite (dev only)
  if (setup) {
    await setup(app, server);
  }

  const PORT = process.env.PORT || 3000;

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  return app;
}
