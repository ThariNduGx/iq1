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
import { supabase } from "./supabase-db";

export class SupabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !data) return undefined;
    
    return {
      id: data.id,
      googleId: data.google_id,
      email: data.email,
      name: data.name,
      avatarUrl: data.avatar_url,
      createdAt: new Date(data.created_at)
    };
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', username)
      .single();
      
    if (error || !data) return undefined;
    
    return {
      id: data.id,
      googleId: data.google_id,
      email: data.email,
      name: data.name,
      avatarUrl: data.avatar_url,
      createdAt: new Date(data.created_at)
    };
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .single();
      
    if (error || !data) return undefined;
    
    return {
      id: data.id,
      googleId: data.google_id,
      email: data.email,
      name: data.name,
      avatarUrl: data.avatar_url,
      createdAt: new Date(data.created_at)
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    console.log("Attempting to create user with data:", insertUser);
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        google_id: insertUser.googleId,
        email: insertUser.email,
        name: insertUser.name,
        avatar_url: insertUser.avatarUrl || null
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error creating user:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw error;
    }
    
    return {
      id: data.id,
      googleId: data.google_id,
      email: data.email,
      name: data.name,
      avatarUrl: data.avatar_url,
      createdAt: new Date(data.created_at)
    };
  }
  
  // Platform connection operations
  async getPlatformConnectionsByUserId(userId: number): Promise<PlatformConnection[]> {
    const { data, error } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error getting platform connections:", error);
      return [];
    }
    
    return data.map(conn => ({
      id: conn.id,
      userId: conn.user_id,
      platform: conn.platform,
      accessToken: conn.access_token,
      refreshToken: conn.refresh_token,
      expiresAt: conn.expires_at ? new Date(conn.expires_at) : null,
      accountId: conn.account_id,
      accountName: conn.account_name,
      metadata: conn.metadata,
      createdAt: new Date(conn.created_at),
      updatedAt: new Date(conn.updated_at)
    }));
  }
  
  async getPlatformConnection(userId: number, platform: string): Promise<PlatformConnection | undefined> {
    const { data, error } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .single();
      
    if (error || !data) return undefined;
    
    return {
      id: data.id,
      userId: data.user_id,
      platform: data.platform,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at ? new Date(data.expires_at) : null,
      accountId: data.account_id,
      accountName: data.account_name,
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
  
  async savePlatformConnection(connection: InsertPlatformConnection): Promise<PlatformConnection> {
    // Check if connection already exists
    const existingConn = await this.getPlatformConnection(connection.userId, connection.platform);
    
    if (existingConn) {
      // Update existing connection
      const { data, error } = await supabase
        .from('platform_connections')
        .update({
          access_token: connection.accessToken,
          refresh_token: connection.refreshToken ?? existingConn.refreshToken,
          expires_at: connection.expiresAt ?? existingConn.expiresAt,
          account_id: connection.accountId ?? existingConn.accountId,
          account_name: connection.accountName ?? existingConn.accountName,
          metadata: connection.metadata ?? existingConn.metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConn.id)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating platform connection:", error);
        throw error;
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        platform: data.platform,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at ? new Date(data.expires_at) : null,
        accountId: data.account_id,
        accountName: data.account_name,
        metadata: data.metadata,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } else {
      // Create new connection
      const { data, error } = await supabase
        .from('platform_connections')
        .insert({
          user_id: connection.userId,
          platform: connection.platform,
          access_token: connection.accessToken,
          refresh_token: connection.refreshToken ?? null,
          expires_at: connection.expiresAt ?? null,
          account_id: connection.accountId ?? null,
          account_name: connection.accountName ?? null,
          metadata: connection.metadata ?? {}
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error creating platform connection:", error);
        throw error;
      }
      
      return {
        id: data.id,
        userId: data.user_id,
        platform: data.platform,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at ? new Date(data.expires_at) : null,
        accountId: data.account_id,
        accountName: data.account_name,
        metadata: data.metadata,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    }
  }
  
  async deletePlatformConnection(userId: number, platform: string): Promise<void> {
    const { error } = await supabase
      .from('platform_connections')
      .delete()
      .eq('user_id', userId)
      .eq('platform', platform);
      
    if (error) {
      console.error("Error deleting platform connection:", error);
      throw error;
    }
  }
  
  // Campaign metrics operations
  async saveCampaignMetrics(metrics: InsertCampaignMetric[]): Promise<void> {
    if (metrics.length === 0) return;
    
    const supabaseMetrics = metrics.map(metric => ({
      user_id: metric.userId,
      platform: metric.platform,
      platform_connection_id: metric.platformConnectionId ?? null,
      campaign_id: metric.campaignId,
      campaign_name: metric.campaignName,
      date: metric.date.toISOString(),
      spend: metric.spend ?? null,
      impressions: metric.impressions ?? null,
      clicks: metric.clicks ?? null,
      conversions: metric.conversions ?? null,
      cost_per_conversion: metric.costPerConversion ?? null,
      conversion_rate: metric.conversionRate ?? null,
      ctr: metric.ctr ?? null,
      cpc: metric.cpc ?? null,
      roas: metric.roas ?? null
    }));
    
    const { error } = await supabase
      .from('campaign_metrics')
      .insert(supabaseMetrics);
      
    if (error) {
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
    let query = supabase
      .from('campaign_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString());
      
    if (platform) {
      query = query.eq('platform', platform);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error getting campaign metrics:", error);
      return [];
    }
    
    return data.map(metric => ({
      id: metric.id,
      userId: metric.user_id,
      platform: metric.platform,
      platformConnectionId: metric.platform_connection_id,
      campaignId: metric.campaign_id,
      campaignName: metric.campaign_name,
      date: new Date(metric.date),
      spend: metric.spend,
      impressions: metric.impressions,
      clicks: metric.clicks,
      conversions: metric.conversions,
      costPerConversion: metric.cost_per_conversion,
      conversionRate: metric.conversion_rate,
      ctr: metric.ctr,
      cpc: metric.cpc,
      roas: metric.roas,
      createdAt: new Date(metric.created_at)
    }));
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
    
    // Check if we have any platforms yet (new account)
    if (result.length === 0) {
      // Add sample platforms for a better first-time experience
      const samplePlatforms = [
        { platform: 'google_ads', isConnected: false },
        { platform: 'facebook_ads', isConnected: false },
        { platform: 'tiktok_ads', isConnected: false }
      ];
      
      for (const sample of samplePlatforms) {
        result.push({
          platform: sample.platform,
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          cpc: 0,
          costPerConversion: 0,
          roas: 0,
          isConnected: sample.isConnected
        });
      }
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
    
    // If we don't have enough campaigns, add some sample data for first-time users
    if (campaigns.length < limit) {
      const sampleCampaigns: TopCampaign[] = [
        {
          campaignName: 'Summer Collection 2025',
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
      
      // Add sample campaigns until we reach the limit, but only if we're a new account with no data
      if (campaigns.length === 0) {
        for (let i = 0; i < Math.min(sampleCampaigns.length, limit); i++) {
          campaigns.push(sampleCampaigns[i]);
        }
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
    
    // Aggregate metrics by date
    for (const m of metrics) {
      const dateStr = new Date(m.date).toISOString().split('T')[0];
      const entry = dateMap.get(dateStr);
      
      if (entry) {
        // Add platform-specific value
        const platformKey = m.platform;
        let value = 0;
        
        switch (metric) {
          case 'spend':
            value = m.spend || 0;
            break;
          case 'impressions':
            value = m.impressions || 0;
            break;
          case 'clicks':
            value = m.clicks || 0;
            break;
          case 'conversions':
            value = m.conversions || 0;
            break;
          case 'ctr':
            value = m.ctr || 0;
            break;
          case 'cpc':
            value = m.cpc || 0;
            break;
          case 'roas':
            value = m.roas || 0;
            break;
          default:
            value = 0;
        }
        
        entry[platformKey] = (entry[platformKey] || 0) + value;
        
        // Update total
        entry.total += value;
      }
    }
    
    // Convert to array of data points
    const result: PerformanceTimeseriesPoint[] = [];
    
    dateMap.forEach((values, date) => {
      if (platform) {
        // If platform is specified, return platform-specific data points
        const point: PerformanceTimeseriesPoint = {
          date
        };
        
        // Add the metric data using proper typing
        if (metric === 'spend') point.spend = values[platform] || 0;
        if (metric === 'roas') point.roas = values[platform] || 0;
        if (metric === 'conversions') point.conversions = values[platform] || 0;
        if (metric === 'ctr') point.ctr = values[platform] || 0;
        
        result.push(point);
      } else {
        // Otherwise, return total
        const point: PerformanceTimeseriesPoint = {
          date
        };
        
        // Add the metric data using proper typing
        if (metric === 'spend') point.spend = values.total;
        if (metric === 'roas') point.roas = values.total;
        if (metric === 'conversions') point.conversions = values.total;
        if (metric === 'ctr') point.ctr = values.total;
        
        result.push(point);
      }
    });
    
    // If we have no data, provide some sample data for first-time users
    if (metrics.length === 0) {
      // Generate random values for empty datasets
      for (let i = 0; i < result.length; i++) {
        let value;
        
        switch (metric) {
          case 'spend':
            value = Math.random() * 500 + 500; // 500-1000
            result[i].spend = value;
            break;
          case 'roas':
            value = Math.random() * 3 + 1; // 1-4
            result[i].roas = value;
            break;
          case 'conversions':
            value = Math.floor(Math.random() * 40 + 10); // 10-50
            result[i].conversions = value;
            break;
          case 'ctr':
            value = Math.random() * 0.05 + 0.01; // 1%-6%
            result[i].ctr = value;
            break;
        }
      }
    }
    
    return result;
  }
  
  async getMetricInsights(userId: number): Promise<MetricInsight[]> {
    const { data, error } = await supabase
      .from('metric_insights')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(5);
      
    if (error || !data || data.length === 0) {
      // Provide sample insights for new users
      return [
        {
          type: 'improvement',
          title: 'Welcome to CampaignIQ',
          message: 'Connect your ad platforms to see personalized insights and performance metrics.',
          timestamp: new Date().toISOString()
        },
        {
          type: 'recommendation',
          title: 'Getting Started',
          message: 'Start by connecting your Google, Facebook or TikTok ad accounts to see your campaign performance.',
          timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString() // 3 minutes ago
        }
      ];
    }
    
    return data.map(insight => ({
      type: insight.type as 'improvement' | 'warning' | 'alert' | 'recommendation',
      title: insight.title,
      message: insight.message,
      timestamp: insight.timestamp
    }));
  }
}

export const storage = new SupabaseStorage();