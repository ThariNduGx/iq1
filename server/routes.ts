import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import session from "express-session";
import passport from "passport";
import { z } from "zod";
import { setupPlatformRoutes } from "./api/platforms";
import { setupMetricsRoutes } from "./api/metrics";

// Environment variables for session
const SESSION_SECRET = process.env.SESSION_SECRET || "campaigniq-session-secret";
const NODE_ENV = process.env.NODE_ENV || "development";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup authentication routes
  setupAuth(app);

  // Authentication middleware for protected routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // API routes - all prefixed with /api
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Platform connection routes
  setupPlatformRoutes(app, requireAuth);

  // Metrics routes
  setupMetricsRoutes(app, requireAuth);

  // User info route
  app.get("/api/user", requireAuth, (req, res) => {
    res.json(req.user);
  });

  const httpServer = createServer(app);

  return httpServer;
}
