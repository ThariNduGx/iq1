import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  googleId: text("google_id").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Platform connections table to store OAuth tokens
export const platformConnections = pgTable("platform_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  platform: text("platform").notNull(), // "google_ads", "facebook_ads", "tiktok_ads"
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  accountId: text("account_id"),
  accountName: text("account_name"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Normalized campaign metrics data
export const campaignMetrics = pgTable("campaign_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  platform: text("platform").notNull(),
  platformConnectionId: integer("platform_connection_id").references(() => platformConnections.id),
  campaignId: text("campaign_id").notNull(),
  campaignName: text("campaign_name").notNull(),
  date: timestamp("date").notNull(),
  spend: real("spend"),
  impressions: integer("impressions"),
  clicks: integer("clicks"),
  conversions: integer("conversions"),
  costPerConversion: real("cost_per_conversion"),
  conversionRate: real("conversion_rate"),
  ctr: real("ctr"),
  cpc: real("cpc"),
  roas: real("roas"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPlatformConnectionSchema = createInsertSchema(platformConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignMetricsSchema = createInsertSchema(campaignMetrics).omit({
  id: true,
  createdAt: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PlatformConnection = typeof platformConnections.$inferSelect;
export type InsertPlatformConnection = z.infer<typeof insertPlatformConnectionSchema>;

export type CampaignMetric = typeof campaignMetrics.$inferSelect;
export type InsertCampaignMetric = z.infer<typeof insertCampaignMetricsSchema>;

// API response types for frontend
export interface MetricSummary {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageCtr: number;
  averageCpc: number;
  averageCostPerConversion: number;
  overallRoas: number;
  spendChange: number;
  roasChange: number;
  conversionsChange: number;
  costPerConversionChange: number;
}

export interface PlatformPerformance {
  platform: string;
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  roas: number;
  cpc: number;
  ctr: number;
  costPerConversion: number;
  isConnected: boolean;
}

export interface SpendDistribution {
  platform: string;
  percentage: number;
  isConnected: boolean;
}

export interface TopCampaign {
  campaignName: string;
  platform: string;
  spend: number;
  conversions: number;
  roas: number;
}

export interface MetricInsight {
  type: 'improvement' | 'warning' | 'alert' | 'recommendation';
  title: string;
  message: string;
  timestamp: string;
}

export interface PerformanceTimeseriesPoint {
  date: string;
  platform?: string;
  spend?: number;
  roas?: number;
  conversions?: number;
  ctr?: number;
}
