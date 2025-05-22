import { AdPlatformAdapter, AdPlatformMetrics, OAuthTokenResponse } from '../interfaces';

/**
 * Meta (Facebook/Instagram) Ads API Adapter
 * Implements AdPlatformAdapter interface for Meta Ads
 */
export class MetaAdsAdapter implements AdPlatformAdapter {
  private appId: string;
  private appSecret: string;
  
  constructor(appId: string, appSecret: string) {
    this.appId = appId;
    this.appSecret = appSecret;
  }
  
  // Get platform identifier
  getPlatformId(): string {
    return 'facebook_ads';
  }
  
  // Generate OAuth authorization URL
  generateAuthUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: redirectUri,
      state: state,
      response_type: 'code',
      scope: 'ads_management,ads_read'
    });
    
    return `https://www.facebook.com/v17.0/dialog/oauth?${params.toString()}`;
  }
  
  // Exchange authorization code for tokens
  async exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<OAuthTokenResponse> {
    try {
      const params = new URLSearchParams({
        client_id: this.appId,
        client_secret: this.appSecret,
        redirect_uri: redirectUri,
        code: code,
      });
      
      const response = await fetch(`https://graph.facebook.com/v17.0/oauth/access_token?${params.toString()}`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to exchange code for tokens');
      }
      
      const data = await response.json();
      
      // Get long-lived token
      const longLivedTokenResponse = await this.getLongLivedToken(data.access_token);
      
      return {
        access_token: longLivedTokenResponse.access_token,
        expires_in: longLivedTokenResponse.expires_in,
        token_type: 'bearer'
      };
    } catch (error) {
      console.error('Error exchanging code for Meta tokens:', error);
      throw error;
    }
  }
  
  // Get long-lived token (Meta tokens are short-lived by default)
  private async getLongLivedToken(shortLivedToken: string): Promise<{ access_token: string, expires_in: number }> {
    try {
      const params = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: this.appId,
        client_secret: this.appSecret,
        fb_exchange_token: shortLivedToken
      });
      
      const response = await fetch(`https://graph.facebook.com/v17.0/oauth/access_token?${params.toString()}`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get long-lived token');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting long-lived token:', error);
      throw error;
    }
  }
  
  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse> {
    // Meta doesn't use refresh tokens in the same way as other platforms
    // Instead, we need to exchange the long-lived token before it expires
    
    try {
      // For Meta, we use the refresh token as the current access token
      const params = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: this.appId,
        client_secret: this.appSecret,
        fb_exchange_token: refreshToken
      });
      
      const response = await fetch(`https://graph.facebook.com/v17.0/oauth/access_token?${params.toString()}`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to refresh Meta access token');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error refreshing Meta access token:', error);
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
      // Format dates for Meta Ads API (YYYY-MM-DD)
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // In a production environment, this would make API calls to Meta Graph API
      // to fetch campaign metrics
      
      // Fields to request from the API
      const fields = [
        'campaign_id',
        'campaign_name',
        'spend',
        'impressions',
        'clicks',
        'actions',
        'conversions',
        'cost_per_action_type',
        'action_values'
      ].join(',');
      
      // Time range parameters
      const timeRange = JSON.stringify({
        'since': formattedStartDate,
        'until': formattedEndDate
      });
      
      // Level of aggregation
      const level = 'campaign';
      
      // This API call would be implemented on the backend
      
      // Return empty array as this would be handled by the backend
      return [];
    } catch (error) {
      console.error('Error fetching Meta Ads campaign metrics:', error);
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
      // Format dates for Meta Ads API (YYYY-MM-DD)
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // In a real implementation, this would call the Meta Graph API
      
      // Return placeholder data as this would be handled by the backend
      throw new Error('This method should be implemented on the backend');
    } catch (error) {
      console.error('Error fetching Meta campaign details:', error);
      throw error;
    }
  }
  
  // Helper method to convert Meta API response to standardized metrics
  private convertToStandardMetrics(metaAdsResponse: any): AdPlatformMetrics[] {
    // In a real implementation, this would convert the Meta Ads response format
    // to our standardized AdPlatformMetrics format
    
    return [];
  }
  
  // Helper to extract conversion data from Meta's nested action structure
  private extractConversions(actions: any[]): number {
    if (!actions || !Array.isArray(actions)) return 0;
    
    // Find purchase or conversion actions
    const conversionActions = actions.filter(
      action => action.action_type === 'purchase' || 
                action.action_type === 'offsite_conversion'
    );
    
    // Sum the values
    return conversionActions.reduce((sum, action) => sum + (action.value || 0), 0);
  }
}

// Export singleton instance for use in the application
export const metaAdsAdapter = new MetaAdsAdapter(
  process.env.FACEBOOK_ADS_CLIENT_ID || '',
  process.env.FACEBOOK_ADS_CLIENT_SECRET || ''
);
