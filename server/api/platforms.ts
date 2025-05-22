import type { Express } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertPlatformConnectionSchema } from "@shared/schema";

// OAuth configurations for different platforms
const GOOGLE_ADS_CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID || "";
const GOOGLE_ADS_CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET || "";
const FACEBOOK_ADS_CLIENT_ID = process.env.FACEBOOK_ADS_CLIENT_ID || "";
const FACEBOOK_ADS_CLIENT_SECRET = process.env.FACEBOOK_ADS_CLIENT_SECRET || "";
const TIKTOK_ADS_CLIENT_ID = process.env.TIKTOK_ADS_CLIENT_ID || "";
const TIKTOK_ADS_CLIENT_SECRET = process.env.TIKTOK_ADS_CLIENT_SECRET || "";
const REDIRECT_URI_BASE = process.env.REDIRECT_URI_BASE || "http://localhost:5000";

export function setupPlatformRoutes(app: Express, requireAuth: any) {
  // Get connected platforms for the current user
  app.get("/api/platforms", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const platforms = await storage.getPlatformConnectionsByUserId(userId);
      
      res.json(platforms);
    } catch (error) {
      console.error("Error fetching platforms:", error);
      res.status(500).json({ message: "Failed to fetch platforms" });
    }
  });

  // Connect platform with OAuth - Generate auth URL
  app.get("/api/platforms/connect/:platform", requireAuth, (req, res) => {
    const { platform } = req.params;
    const { codeChallenge } = req.query;
    
    let authUrl = "";
    const redirectUri = `${REDIRECT_URI_BASE}/api/platforms/callback/${platform}`;
    
    switch (platform) {
      case "google_ads":
        authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${GOOGLE_ADS_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/adwords&access_type=offline&prompt=consent&code_challenge=${codeChallenge}&code_challenge_method=S256`;
        break;
      case "facebook_ads":
        authUrl = `https://www.facebook.com/v14.0/dialog/oauth?client_id=${FACEBOOK_ADS_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=ads_management,ads_read&response_type=code&state=${codeChallenge}`;
        break;
      case "tiktok_ads":
        authUrl = `https://ads.tiktok.com/marketing_api/auth?app_id=${TIKTOK_ADS_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${codeChallenge}`;
        break;
      default:
        return res.status(400).json({ message: "Invalid platform" });
    }
    
    res.json({ authUrl });
  });

  // OAuth callback handler
  app.get("/api/platforms/callback/:platform", requireAuth, async (req, res) => {
    const { platform } = req.params;
    const { code, code_verifier, state } = req.query;
    const userId = (req.user as any).id;
    
    try {
      let tokenResponse;
      const redirectUri = `${REDIRECT_URI_BASE}/api/platforms/callback/${platform}`;

      // Exchange authorization code for access token
      switch (platform) {
        case "google_ads":
          tokenResponse = await exchangeGoogleAdsToken(code as string, code_verifier as string, redirectUri);
          break;
        case "facebook_ads":
          tokenResponse = await exchangeFacebookAdsToken(code as string, redirectUri);
          break;
        case "tiktok_ads":
          tokenResponse = await exchangeTikTokAdsToken(code as string, redirectUri);
          break;
        default:
          throw new Error("Invalid platform");
      }
      
      // Store platform connection
      const connection = insertPlatformConnectionSchema.parse({
        userId,
        platform,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: tokenResponse.expires_in ? new Date(Date.now() + tokenResponse.expires_in * 1000) : null,
        accountId: tokenResponse.account_id || null,
        accountName: tokenResponse.account_name || null,
        metadata: tokenResponse
      });
      
      await storage.savePlatformConnection(connection);
      
      res.redirect("/?connection_success=true");
    } catch (error) {
      console.error(`Error connecting ${platform}:`, error);
      res.redirect("/?connection_error=true");
    }
  });

  // Disconnect platform
  app.delete("/api/platforms/:platform", requireAuth, async (req, res) => {
    const { platform } = req.params;
    const userId = (req.user as any).id;
    
    try {
      await storage.deletePlatformConnection(userId, platform);
      res.json({ success: true });
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
      res.status(500).json({ message: "Failed to disconnect platform" });
    }
  });
}

// Helper functions to exchange authorization codes for tokens

async function exchangeGoogleAdsToken(code: string, codeVerifier: string, redirectUri: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_ADS_CLIENT_ID,
      client_secret: GOOGLE_ADS_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code_verifier: codeVerifier
    })
  });
  
  if (!response.ok) {
    throw new Error(`Google Ads token exchange failed: ${await response.text()}`);
  }
  
  return await response.json();
}

async function exchangeFacebookAdsToken(code: string, redirectUri: string) {
  const response = await fetch("https://graph.facebook.com/v14.0/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: FACEBOOK_ADS_CLIENT_ID,
      client_secret: FACEBOOK_ADS_CLIENT_SECRET,
      redirect_uri: redirectUri,
    })
  });
  
  if (!response.ok) {
    throw new Error(`Facebook Ads token exchange failed: ${await response.text()}`);
  }
  
  return await response.json();
}

async function exchangeTikTokAdsToken(code: string, redirectUri: string) {
  const response = await fetch("https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_code: code,
      app_id: TIKTOK_ADS_CLIENT_ID,
      secret: TIKTOK_ADS_CLIENT_SECRET,
      auth_type: "authorization_code"
    })
  });
  
  if (!response.ok) {
    throw new Error(`TikTok Ads token exchange failed: ${await response.text()}`);
  }
  
  return await response.json();
}
