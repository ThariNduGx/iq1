import { 
  users, 
  platformConnections, 
  campaignMetrics, 
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

// In-memory storage implementation for development
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private platformConnections: Map<number, PlatformConnection>;
  private campaignMetrics: CampaignMetric[];
  private currentUserId: number;
  private currentConnectionId: number;
  private currentMetricId: number;

  constructor() {
    this.users = new Map();
    this.platformConnections = new Map();
    this.campaignMetrics = [];
    this.currentUserId = 1;
    this.currentConnectionId = 1;
    this.currentMetricId = 1;
    
    // Add some sample insights for demo purposes
    this.sampleInsights = [
      {
        type: 'improvement',
        title: 'Performance Improvement',
        message: 'Facebook ROAS increased by 24% in the last 7 days compared to the previous period.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 minutes ago
      },
      {
        type: 'warning',
        title: 'Budget Warning',
        message: 'Google Ads "Summer Collection" campaign has spent 85% of its budget with 10 days remaining.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        type: 'alert',
        title: 'Conversion Drop',
        message: 'Instagram "Product Showcase" campaign conversions dropped by 32% in the last 3 days.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        type: 'recommendation',
        title: 'Recommendation',
        message: 'Consider reallocating budget from "Brand Awareness" to "New Product Launch" for better ROAS.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      }
    ];
  }

  // Sample insights for development
  private sampleInsights: MetricInsight[];

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === username
    );
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      avatarUrl: insertUser.avatarUrl || null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Platform connection operations
  async getPlatformConnectionsByUserId(userId: number): Promise<PlatformConnection[]> {
    return Array.from(this.platformConnections.values()).filter(
      conn => conn.userId === userId
    );
  }
  
  async getPlatformConnection(userId: number, platform: string): Promise<PlatformConnection | undefined> {
    return Array.from(this.platformConnections.values()).find(
      conn => conn.userId === userId && conn.platform === platform
    );
  }
  
  async savePlatformConnection(connection: InsertPlatformConnection): Promise<PlatformConnection> {
    // Check if connection already exists
    const existingConn = await this.getPlatformConnection(connection.userId, connection.platform);
    
    if (existingConn) {
      // Update existing connection
      const updatedConnection: PlatformConnection = {
        ...existingConn,
        ...connection,
        updatedAt: new Date()
      };
      this.platformConnections.set(existingConn.id, updatedConnection);
      return updatedConnection;
    } else {
      // Create new connection
      const id = this.currentConnectionId++;
      const newConnection: PlatformConnection = {
        ...connection,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.platformConnections.set(id, newConnection);
      return newConnection;
    }
  }
  
  async deletePlatformConnection(userId: number, platform: string): Promise<void> {
    const connection = await this.getPlatformConnection(userId, platform);
    if (connection) {
      this.platformConnections.delete(connection.id);
    }
  }
  
  // Campaign metrics operations
  async saveCampaignMetrics(metrics: InsertCampaignMetric[]): Promise<void> {
    for (const metric of metrics) {
      const id = this.currentMetricId++;
      this.campaignMetrics.push({
        ...metric,
        id,
        createdAt: new Date()
      });
    }
  }
  
  async getCampaignMetrics(
    userId: number, 
    startDate: Date, 
    endDate: Date, 
    platform?: string
  ): Promise<CampaignMetric[]> {
    return this.campaignMetrics.filter(metric => 
      metric.userId === userId &&
      new Date(metric.date) >= startDate &&
      new Date(metric.date) <= endDate &&
      (platform ? metric.platform === platform : true)
    );
  }
  
  // Analytics operations
  async getMetricsSummary(
    userId: number, 
    startDate: Date, 
    endDate: Date, 
    platform?: string
  ): Promise<MetricSummary> {
    // Get campaign metrics for the date range
    const metrics = await this.getCampaignMetrics(userId, startDate, endDate, platform);
    
    // For empty dataset, return zeros
    if (metrics.length === 0) {
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
        costPerConversionChange: 0
      };
    }
    
    // Calculate totals
    const totalSpend = metrics.reduce((sum, m) => sum + (m.spend || 0), 0);
    const totalImpressions = metrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
    const totalClicks = metrics.reduce((sum, m) => sum + (m.clicks || 0), 0);
    const totalConversions = metrics.reduce((sum, m) => sum + (m.conversions || 0), 0);
    
    // Calculate averages
    const averageCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
    const averageCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const averageCostPerConversion = totalConversions > 0 ? totalSpend / totalConversions : 0;
    
    // Calculate ROAS - assuming each conversion is worth $100 for demo purposes
    const conversionValue = totalConversions * 100;
    const overallRoas = totalSpend > 0 ? conversionValue / totalSpend : 0;
    
    // For real metrics, we would compare with previous period
    // Here we're just generating some sample data for demonstration
    const spendChange = 12.4;
    const roasChange = 8.3;
    const conversionsChange = 23.5;
    const costPerConversionChange = -4.2;
    
    return {
      totalSpend,
      totalImpressions,
      totalClicks,
      totalConversions,
      averageCtr,
      averageCpc,
      averageCostPerConversion,
      overallRoas,
      spendChange,
      roasChange,
      conversionsChange,
      costPerConversionChange
    };
  }
  
  async getPlatformPerformance(
    userId: number, 
    startDate: Date, 
    endDate: Date
  ): Promise<PlatformPerformance[]> {
    // Get all platform connections for the user
    const connections = await this.getPlatformConnectionsByUserId(userId);
    
    // Get all metrics for the date range
    const metrics = await this.getCampaignMetrics(userId, startDate, endDate);
    
    // Group metrics by platform
    const platforms = Array.from(new Set(metrics.map(m => m.platform)));
    
    // Generate platform performance data
    const result: PlatformPerformance[] = [];
    
    // Add connected platforms
    for (const platform of platforms) {
      const platformMetrics = metrics.filter(m => m.platform === platform);
      
      if (platformMetrics.length > 0) {
        const spend = platformMetrics.reduce((sum, m) => sum + (m.spend || 0), 0);
        const impressions = platformMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
        const clicks = platformMetrics.reduce((sum, m) => sum + (m.clicks || 0), 0);
        const conversions = platformMetrics.reduce((sum, m) => sum + (m.conversions || 0), 0);
        
        const ctr = impressions > 0 ? clicks / impressions : 0;
        const cpc = clicks > 0 ? spend / clicks : 0;
        const costPerConversion = conversions > 0 ? spend / conversions : 0;
        
        // Calculate ROAS - assuming each conversion is worth $100 for demo purposes
        const conversionValue = conversions * 100;
        const roas = spend > 0 ? conversionValue / spend : 0;
        
        result.push({
          platform,
          spend,
          impressions,
          clicks,
          conversions,
          ctr,
          cpc,
          costPerConversion,
          roas,
          isConnected: connections.some(c => c.platform === platform)
        });
      }
    }
    
    // Add additional platforms that are connected but have no metrics
    for (const connection of connections) {
      if (!result.some(r => r.platform === connection.platform)) {
        result.push({
          platform: connection.platform,
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          cpc: 0,
          costPerConversion: 0,
          roas: 0,
          isConnected: true
        });
      }
    }
    
    // Add TikTok as not connected for demo
    if (!result.some(r => r.platform === 'tiktok_ads')) {
      result.push({
        platform: 'tiktok_ads',
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        costPerConversion: 0,
        roas: 0,
        isConnected: false
      });
    }
    
    return result;
  }
  
  async getSpendDistribution(
    userId: number, 
    startDate: Date, 
    endDate: Date
  ): Promise<SpendDistribution[]> {
    // Get platform performance data
    const platforms = await this.getPlatformPerformance(userId, startDate, endDate);
    
    // Calculate total spend
    const totalSpend = platforms.reduce((sum, p) => sum + p.spend, 0);
    
    // Calculate percentages
    return platforms.map(platform => ({
      platform: platform.platform,
      percentage: totalSpend > 0 ? (platform.spend / totalSpend) * 100 : 0,
      isConnected: platform.isConnected
    }));
  }
  
  async getTopCampaigns(
    userId: number, 
    startDate: Date, 
    endDate: Date, 
    limit: number, 
    platform?: string
  ): Promise<TopCampaign[]> {
    // Get all metrics for the date range
    const metrics = await this.getCampaignMetrics(userId, startDate, endDate, platform);
    
    // Group by campaign
    const campaignMap = new Map<string, {
      campaignName: string;
      platform: string;
      spend: number;
      conversions: number;
      roas: number;
    }>();
    
    // Aggregate metrics by campaign
    for (const metric of metrics) {
      const key = `${metric.campaignId}:${metric.platform}`;
      const existing = campaignMap.get(key);
      
      if (existing) {
        existing.spend += metric.spend || 0;
        existing.conversions += metric.conversions || 0;
      } else {
        // Calculate ROAS - assuming each conversion is worth $100 for demo purposes
        const conversionValue = (metric.conversions || 0) * 100;
        const roas = (metric.spend || 0) > 0 ? conversionValue / (metric.spend || 0) : 0;
        
        campaignMap.set(key, {
          campaignName: metric.campaignName,
          platform: metric.platform,
          spend: metric.spend || 0,
          conversions: metric.conversions || 0,
          roas
        });
      }
    }
    
    // Convert to array and sort by ROAS (descending)
    const campaigns = Array.from(campaignMap.values())
      .sort((a, b) => b.roas - a.roas)
      .slice(0, limit);
    
    // If we don't have enough campaigns, add some sample data for demo
    if (campaigns.length < limit) {
      const sampleCampaigns: TopCampaign[] = [
        {
          campaignName: 'Summer Collection 2023',
          platform: 'google_ads',
          spend: 4321.56,
          conversions: 325,
          roas: 4.2
        },
        {
          campaignName: 'New Product Launch',
          platform: 'facebook_ads',
          spend: 3785.23,
          conversions: 289,
          roas: 3.8
        },
        {
          campaignName: 'Seasonal Promotion',
          platform: 'instagram_ads',
          spend: 2543.78,
          conversions: 198,
          roas: 3.5
        },
        {
          campaignName: 'Holiday Special',
          platform: 'google_ads',
          spend: 1987.45,
          conversions: 146,
          roas: 2.8
        },
        {
          campaignName: 'Brand Awareness',
          platform: 'facebook_ads',
          spend: 1453.21,
          conversions: 92,
          roas: 1.9
        }
      ];
      
      // Add sample campaigns until we reach the limit
      for (let i = 0; i < Math.min(sampleCampaigns.length, limit - campaigns.length); i++) {
        campaigns.push(sampleCampaigns[i]);
      }
    }
    
    return campaigns;
  }
  
  async getPerformanceTimeseries(
    userId: number, 
    startDate: Date, 
    endDate: Date, 
    metric: string, 
    platform?: string
  ): Promise<PerformanceTimeseriesPoint[]> {
    // Get metrics for the date range
    const metrics = await this.getCampaignMetrics(userId, startDate, endDate, platform);
    
    // Group by date
    const dateMap = new Map<string, {
      [platform: string]: number;
      total: number;
    }>();
    
    // Generate a series of dates in the range
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dates.push(dateStr);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Initialize data points for all dates
    for (const date of dates) {
      dateMap.set(date, { total: 0 });
    }
    
    // Aggregate metrics by date and platform
    for (const m of metrics) {
      const date = new Date(m.date).toISOString().split('T')[0];
      const data = dateMap.get(date) || { total: 0 };
      
      let value = 0;
      switch (metric) {
        case 'spend':
          value = m.spend || 0;
          break;
        case 'roas':
          // Calculate ROAS - assuming each conversion is worth $100 for demo purposes
          const conversionValue = (m.conversions || 0) * 100;
          value = (m.spend || 0) > 0 ? conversionValue / (m.spend || 0) : 0;
          break;
        case 'conversions':
          value = m.conversions || 0;
          break;
        case 'ctr':
          value = (m.impressions || 0) > 0 ? (m.clicks || 0) / (m.impressions || 0) : 0;
          break;
      }
      
      // Add to platform-specific value
      data[m.platform] = (data[m.platform] || 0) + value;
      
      // Add to total
      data.total += value;
      
      dateMap.set(date, data);
    }
    
    // Convert to array and sort by date
    return dates.map(date => {
      const data = dateMap.get(date) || { total: 0 };
      return {
        date,
        ...data
      };
    });
  }
  
  async getMetricInsights(userId: number): Promise<MetricInsight[]> {
    // For development, return sample insights
    return this.sampleInsights;
  }
}

// Export storage instance
export const storage = new MemStorage();
