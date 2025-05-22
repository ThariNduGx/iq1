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

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Platform connection operations
  getPlatformConnectionsByUserId(userId: number): Promise<PlatformConnection[]>;
  getPlatformConnection(userId: number, platform: string): Promise<PlatformConnection | undefined>;
  savePlatformConnection(connection: InsertPlatformConnection): Promise<PlatformConnection>;
  deletePlatformConnection(userId: number, platform: string): Promise<void>;
  
  // Campaign metrics operations
  saveCampaignMetrics(metrics: InsertCampaignMetric[]): Promise<void>;
  getCampaignMetrics(userId: number, startDate: Date, endDate: Date, platform?: string): Promise<CampaignMetric[]>;
  
  // Analytics operations
  getMetricsSummary(userId: number, startDate: Date, endDate: Date, platform?: string): Promise<MetricSummary>;
  getPlatformPerformance(userId: number, startDate: Date, endDate: Date): Promise<PlatformPerformance[]>;
  getSpendDistribution(userId: number, startDate: Date, endDate: Date): Promise<SpendDistribution[]>;
  getTopCampaigns(userId: number, startDate: Date, endDate: Date, limit: number, platform?: string): Promise<TopCampaign[]>;
  getPerformanceTimeseries(userId: number, startDate: Date, endDate: Date, metric: string, platform?: string): Promise<PerformanceTimeseriesPoint[]>;
  getMetricInsights(userId: number): Promise<MetricInsight[]>;
}