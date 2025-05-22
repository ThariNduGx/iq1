import type { Express } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";

// Environment variables for Google OAuth
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const CALLBACK_URL = process.env.CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn("Missing Google OAuth credentials. Using demo mode with automatic authentication.");
}

export function setupAuth(app: Express) {
  // Create a demo user for testing without Google OAuth
  const createDemoUser = async () => {
    try {
      // Check if demo user already exists
      let demoUser = await storage.getUserByGoogleId("demo-user-id");
      
      if (!demoUser) {
        // Create a new demo user
        const newUser = insertUserSchema.parse({
          googleId: "demo-user-id",
          email: "demo@campaigniq.example",
          name: "Demo User",
          avatarUrl: "https://ui-avatars.com/api/?name=Demo+User&background=random",
        });
        
        demoUser = await storage.createUser(newUser);
        console.log("Created demo user for testing");
      }
      
      return demoUser;
    } catch (error) {
      console.error("Error creating demo user:", error);
      throw error;
    }
  };
  
  // If we have Google OAuth credentials, use the Google strategy
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    // Configure Passport Google Strategy
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: CALLBACK_URL,
          scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists
            const googleId = profile.id;
            let user = await storage.getUserByGoogleId(googleId);

            if (!user) {
              // Create new user if not exists
              const email = profile.emails?.[0]?.value || "";
              const name = profile.displayName || "";
              const avatarUrl = profile.photos?.[0]?.value || "";

              const newUser = insertUserSchema.parse({
                googleId,
                email,
                name,
                avatarUrl,
              });

              user = await storage.createUser(newUser);
            }

            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  }

  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Demo login route (when Google OAuth credentials are not available)
  app.get("/api/auth/demo-login", async (req, res) => {
    try {
      const demoUser = await createDemoUser();
      req.login(demoUser, (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to log in" });
        }
        return res.redirect("/");
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create demo user" });
    }
  });

  // Google OAuth routes (only active when credentials are provided)
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    app.get(
      "/api/auth/google",
      passport.authenticate("google", { scope: ["profile", "email"] })
    );

    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", {
        successRedirect: "/",
        failureRedirect: "/login",
      })
    );
  }

  // Logout route
  app.get("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/login");
    });
  });

  // Check authentication status
  app.get("/api/auth/status", (req, res) => {
    res.json({
      isAuthenticated: req.isAuthenticated(),
      user: req.user || null,
      demoMode: !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET
    });
  });
}
