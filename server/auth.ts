import type { Express } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage-export";
import { insertUserSchema } from "@shared/schema";

// Environment variables for Google OAuth
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const CALLBACK_URL = process.env.CALLBACK_URL || "https://50f08424-4db7-427b-854e-3aa8fa35a974-00-20tp46kjys5mv.worf.replit.dev/api/auth/google/callback";

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("Google OAuth credentials are missing. Authentication will not work properly.");
}

export function setupAuth(app: Express) {
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
            console.log(`New user created: ${email}`);
          }

          return done(null, user);
        } catch (error) {
          console.error("Error during Google authentication:", error);
          return done(error as Error);
        }
      }
    )
  );

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

  // Google OAuth routes
  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "/",
      failureRedirect: "/login?error=auth_failed",
    })
  );

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
      user: req.user || null
    });
  });
}
