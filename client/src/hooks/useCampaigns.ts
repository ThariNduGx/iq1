import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { CampaignMetric } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';

// Hook for fetching campaign metrics with filtering options
export function useCampaignMetrics(
  platform?: string,
  startDate?: string,
  endDate?: string,
  campaignId?: string
) {
  const { toast } = useToast();
  
  // Build query params
  const queryParams = new URLSearchParams();
  if (platform) queryParams.append('platform', platform);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (campaignId) queryParams.append('campaignId', campaignId);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  return useQuery<CampaignMetric[]>({
    queryKey: [`/api/campaigns/metrics${queryString}`],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    onError: (error: any) => {
      toast({
        title: 'Error fetching campaign metrics',
        description: error.message || 'Failed to load campaign data',
        variant: 'destructive',
      });
    }
  });
}

// Hook for fetching a specific campaign's performance over time
export function useCampaignPerformance(
  campaignId: string,
  metric: 'spend' | 'clicks' | 'impressions' | 'conversions' | 'roas' = 'spend',
  startDate?: string,
  endDate?: string
) {
  const { toast } = useToast();
  
  // Build query params
  const queryParams = new URLSearchParams();
  queryParams.append('campaignId', campaignId);
  queryParams.append('metric', metric);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  
  const queryString = `?${queryParams.toString()}`;
  
  return useQuery<any[]>({
    queryKey: [`/api/campaigns/performance${queryString}`],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    onError: (error: any) => {
      toast({
        title: 'Error fetching campaign performance',
        description: error.message || 'Failed to load performance data',
        variant: 'destructive',
      });
    }
  });
}

// Hook for manually refreshing campaign data from platforms
export function useRefreshCampaignData() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (platform?: string) => {
      const body = platform ? { platform } : undefined;
      await apiRequest('POST', '/api/metrics/fetch', body);
    },
    onSuccess: () => {
      // Invalidate all metrics queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      
      toast({
        title: 'Data Refresh Initiated',
        description: 'Campaign data is being refreshed from connected platforms.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error Refreshing Data',
        description: error.message || 'Failed to refresh campaign data',
        variant: 'destructive',
      });
    }
  });
}
