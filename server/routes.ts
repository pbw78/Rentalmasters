import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // przykładowa trasa
  app.get("/api/hello", (_req, res) => {
    res.json({ message: "Hello from backend!" });
  });

  const server = createServer(app);
  return server;
}
