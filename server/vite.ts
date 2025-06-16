import type { Express } from "express";
import { createServer as createViteServer } from "vite";
import path from "node:path";
import express from "express";

export async function setupVite(app: Express, server: any) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    root: process.cwd(),
  });

  app.use(vite.middlewares);
}

export function serveStatic(app: Express) {
  const distPath = path.join(process.cwd(), "dist", "public");
  app.use(express.static(distPath));
}

export const log = (...args: any[]) => console.log(...args);
