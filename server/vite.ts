import type { Express } from "express";
import { createServer as createViteServer } from "vite";

export async function setupVite(app: Express, server: any) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    root: process.cwd(),
  });

  app.use(vite.middlewares);
}

export function serveStatic(app: Express) {
  const path = require("path");
  const express = require("express");

  const distPath = path.join(__dirname, "public");
  app.use(express.static(distPath));
}
