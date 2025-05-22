import { 
  type User, 
  type InsertUser, 
  type PlatformConnection, 
  type InsertPlatformConnection, 
  type CampaignMetric, 
  type InsertCampaignMetric,
  type MetricSummary,
  type PlatformPerformance,
  type SpendDistribution,
  type TopCampaign,
  type MetricInsight,
  type PerformanceTimeseriesPoint
} from "@shared/schema";
import { IStorage } from "./storage-interface";
import { db } from "./db";
import { users, platformConnections, campaignMetrics } from "@shared/schema";
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, username));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user by Google ID:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      console.log("Creating user with PostgreSQL:", insertUser);
      const [user] = await db
        .insert(users)
        .values(insertUser)
        .returning();
      console.log("User created successfully:", user);
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Platform connection operations (stub implementations for now)
  async getPlatformConnectionsByUserId(userId: number): Promise<PlatformConnection[]> {
    try {
      return await db.select().from(platformConnections).where(eq(platformConnections.userId, userId));
    } catch (error) {
      console.error("Error getting platform connections:", error);
      return [];
    }
  }

  async getPlatformConnection(userId: number, platform: string): Promise<PlatformConnection | undefined> {
    try {
      const [connection] = await db
        .select()
        .from(platformConnections)
        .where(and(eq(platformConnections.userId, userId), eq(platformConnections.platform, platform)));
      return connection || undefined;
    } catch (error) {
      console.error("Error getting platform connection:", error);
      return undefined;
    }
  }

  async savePlatformConnection(connection: InsertPlatformConnection): Promise<PlatformConnection> {
    try {
      const [saved] = await db
        .insert(platformConnections)
        .values(connection)
        .returning();
      return saved;
    } catch (error) {
      console.error("Error saving platform connection:", error);
      throw error;
    }
  }

  async deletePlatformConnection(userId: number, platform: string): Promise<void> {
    try {
      await db
        .delete(platformConnections)
        .where(and(eq(platformConnections.userId, userId), eq(platformConnections.platform, platform)));
    } catch (error) {
      console.error("Error deleting platform connection:", error);
      throw error;
    }
  }

  // Campaign metrics operations (stub implementations for now)
  async saveCampaignMetrics(metrics: InsertCampaignMetric[]): Promise<void> {
    try {
      if (metrics.length > 0) {
        await db.insert(campaignMetrics).values(metrics);
      }
    } catch (error) {
      console.error("Error saving campaign metrics:", error);
      throw error;
    }
  }

  async getCampaignMetrics(
    userId: number, 
    startDate: Date, 
    endDate: Date, 
    platform?: string
  ): Promise<CampaignMetric[]> {
    try {
      const conditions = [
        eq(campaignMetrics.userId, userId),
        gte(campaignMetrics.date, startDate),
        lte(campaignMetrics.date, endDate)
      ];

      if (platform) {
        conditions.push(eq(campaignMetrics.platform, platform));
      }

      return await db.select().from(campaignMetrics).where(and(...conditions));
    } catch (error) {
      console.error("Error getting campaign metrics:", error);
      return [];
    }
  }

  // Analytics operations (stub implementations for now - will return empty/default data)
  async getMetricsSummary(userId: number, startDate: Date, endDate: Date, platform?: string): Promise<MetricSummary> {
    return {
      totalSpend: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      averageCtr: 0,
      averageCpc: 0,
      averageCostPerConversion: 0,
      overallRoas: 0,
      spendChange: 0,
      roasChange: 0,
      conversionsChange: 0,
      costPerConversionChange: 0,
    };
  }

  async getPlatformPerformance(userId: number, startDate: Date, endDate: Date): Promise<PlatformPerformance[]> {
    return [];
  }

  async getSpendDistribution(userId: number, startDate: Date, endDate: Date): Promise<SpendDistribution[]> {
    return [];
  }

  async getTopCampaigns(userId: number, startDate: Date, endDate: Date, limit: number, platform?: string): Promise<TopCampaign[]> {
    return [];
  }

  async getPerformanceTimeseries(userId: number, startDate: Date, endDate: Date, metric: string, platform?: string): Promise<PerformanceTimeseriesPoint[]> {
    return [];
  }

  async getMetricInsights(userId: number): Promise<MetricInsight[]> {
    return [];
  }
}

export const storage = new DatabaseStorage();