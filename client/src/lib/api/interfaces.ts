/**
 * Common interfaces for API adapters
 * These define the standardized structures used across different ad platform APIs
 */

// Base interface for all ad platform metrics
export interface AdPlatformMetrics {
  platform: string;
  date: string;
  campaignId: string;
  campaignName: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  costPerConversion?: number;
  conversionRate?: number;
  ctr?: number;
  cpc?: number;
  roas?: number;
}

// Interface for API adapter implementations
export interface AdPlatformAdapter {
  // Get platform identifier
  getPlatformId(): string;
  
  // Generate OAuth authorization URL
  generateAuthUrl(redirectUri: string, state: string, codeChallenge?: string): string;
  
  // Exchange authorization code for tokens
  exchangeCodeForTokens(
    code: string,
    redirectUri: string,
    codeVerifier?: string
  ): Promise<OAuthTokenResponse>;
  
  // Refresh access token
  refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse>;
  
  // Fetch campaign metrics
  fetchCampaignMetrics(
    accessToken: string,
    startDate: Date,
    endDate: Date
  ): Promise<AdPlatformMetrics[]>;
  
  // Fetch specific campaign details
  fetchCampaignDetails(
    accessToken: string,
    campaignId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AdPlatformMetrics>;
}

// OAuth token response
export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  account_id?: string;
  account_name?: string;
  [key: string]: any; // Additional platform-specific fields
}

// Error response
export interface ErrorResponse {
  status: number;
  message: string;
  errors?: string[] | Record<string, string[]>;
}

// Campaign metrics request options
export interface MetricsRequestOptions {
  startDate: Date;
  endDate: Date;
  campaignId?: string;
  includeDeleted?: boolean;
  fields?: string[];
}

// Campaign metrics with platform-specific data
export interface CampaignMetricsWithPlatformData extends AdPlatformMetrics {
  platformData: any; // Raw platform-specific data
}

// Summary metrics across platforms
export interface CrossPlatformSummary {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageCtr: number;
  averageCpc: number;
  averageCostPerConversion: number;
  overallRoas: number;
  platformBreakdown: {
    [platform: string]: {
      spend: number;
      impressions: number;
      clicks: number;
      conversions: number;
      roas: number;
    };
  };
}
