import { AdPlatformAdapter, AdPlatformMetrics, OAuthTokenResponse } from '../interfaces';

/**
 * TikTok Ads API Adapter
 * Implements AdPlatformAdapter interface for TikTok Ads
 */
export class TikTokAdsAdapter implements AdPlatformAdapter {
  private appId: string;
  private appSecret: string;
  
  constructor(appId: string, appSecret: string) {
    this.appId = appId;
    this.appSecret = appSecret;
  }
  
  // Get platform identifier
  getPlatformId(): string {
    return 'tiktok_ads';
  }
  
  // Generate OAuth authorization URL
  generateAuthUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      app_id: this.appId,
      redirect_uri: redirectUri,
      state: state,
      response_type: 'code'
    });
    
    return `https://ads.tiktok.com/marketing_api/auth?${params.toString()}`;
  }
  
  // Exchange authorization code for tokens
  async exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<OAuthTokenResponse> {
    try {
      const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app_id: this.appId,
          secret: this.appSecret,
          auth_code: code,
          auth_type: 'authorization_code'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to exchange code for tokens');
      }
      
      const data = await response.json();
      
      // TikTok API returns nested data
      if (data.code !== 0) {
        throw new Error(data.message || 'TikTok API error');
      }
      
      const tokenData = data.data;
      
      return {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        token_type: 'bearer',
        account_id: tokenData.advertiser_id?.toString(),
        account_name: tokenData.advertiser_name
      };
    } catch (error) {
      console.error('Error exchanging code for TikTok tokens:', error);
      throw error;
    }
  }
  
  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse> {
    try {
      const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/oauth2/refresh_token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app_id: this.appId,
          secret: this.appSecret,
          refresh_token: refreshToken
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to refresh TikTok access token');
      }
      
      const data = await response.json();
      
      // TikTok API returns nested data
      if (data.code !== 0) {
        throw new Error(data.message || 'TikTok API error');
      }
      
      const tokenData = data.data;
      
      return {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        token_type: 'bearer'
      };
    } catch (error) {
      console.error('Error refreshing TikTok access token:', error);
      throw error;
    }
  }
  
  // Fetch campaign metrics
  async fetchCampaignMetrics(
    accessToken: string,
    startDate: Date,
    endDate: Date
  ): Promise<AdPlatformMetrics[]> {
    try {
      // Format dates for TikTok Ads API (YYYY-MM-DD)
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // In a production environment, this would make API calls to TikTok Ads API
      // to fetch campaign metrics
      
      // Fields to request
      const fields = [
        'campaign_id',
        'campaign_name',
        'spend',
        'impressions',
        'clicks',
        'conversions',
        'cost_per_conversion',
        'conversion_rate',
        'ctr',
        'cpc'
      ];
      
      // In a real implementation, we would make a request to:
      // https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/
      
      // With appropriate filtering for date range and metrics
      
      // This would be implemented on the backend with proper rate limiting
      // and error handling specific to TikTok Ads API
      
      // Return empty array as this would be handled by the backend
      return [];
    } catch (error) {
      console.error('Error fetching TikTok Ads campaign metrics:', error);
      throw error;
    }
  }
  
  // Fetch specific campaign details
  async fetchCampaignDetails(
    accessToken: string,
    campaignId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AdPlatformMetrics> {
    try {
      // Format dates for TikTok Ads API (YYYY-MM-DD)
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // In a real implementation, this would call the TikTok Ads API
      
      // Return placeholder data as this would be handled by the backend
      throw new Error('This method should be implemented on the backend');
    } catch (error) {
      console.error('Error fetching TikTok campaign details:', error);
      throw error;
    }
  }
  
  // Helper method to convert TikTok API response to standardized metrics
  private convertToStandardMetrics(tiktokAdsResponse: any): AdPlatformMetrics[] {
    // In a real implementation, this would convert the TikTok Ads response format
    // to our standardized AdPlatformMetrics format
    
    return [];
  }
}

// Export singleton instance for use in the application
export const tiktokAdsAdapter = new TikTokAdsAdapter(
  process.env.TIKTOK_ADS_CLIENT_ID || '',
  process.env.TIKTOK_ADS_CLIENT_SECRET || ''
);
