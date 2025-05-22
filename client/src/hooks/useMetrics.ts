import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { 
  MetricSummary, 
  PlatformPerformance, 
  SpendDistribution, 
  TopCampaign, 
  MetricInsight,
  PerformanceTimeseriesPoint
} from '@shared/schema';

// Custom hook for fetching metrics summary data
export function useMetrics(platform?: string, startDate?: string, endDate?: string) {
  const { toast } = useToast();
  
  // Build query params
  const queryParams = new URLSearchParams();
  if (platform) queryParams.append('platform', platform);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  // Fetch metrics summary
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery<MetricSummary>({
    queryKey: [`/api/metrics/summary${queryString}`],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    onError: (error: any) => {
      toast({
        title: 'Error fetching metrics',
        description: error.message || 'Failed to load metrics data',
        variant: 'destructive',
      });
    }
  });
  
  return {
    summary,
    isLoading: summaryLoading,
    error: summaryError
  };
}

// Hook for fetching platform performance data
export function usePlatformPerformance(startDate?: string, endDate?: string) {
  const { toast } = useToast();
  
  // Build query params
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  // Fetch platform performance
  const { data, isLoading, error } = useQuery<PlatformPerformance[]>({
    queryKey: [`/api/metrics/platforms${queryString}`],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    onError: (error: any) => {
      toast({
        title: 'Error fetching platform performance',
        description: error.message || 'Failed to load platform data',
        variant: 'destructive',
      });
    }
  });
  
  return {
    platformPerformance: data,
    isLoading,
    error
  };
}

// Hook for fetching spend distribution data
export function useSpendDistribution(startDate?: string, endDate?: string) {
  const { toast } = useToast();
  
  // Build query params
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  // Fetch spend distribution
  const { data, isLoading, error } = useQuery<SpendDistribution[]>({
    queryKey: [`/api/metrics/spend-distribution${queryString}`],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    onError: (error: any) => {
      toast({
        title: 'Error fetching spend distribution',
        description: error.message || 'Failed to load spend data',
        variant: 'destructive',
      });
    }
  });
  
  return {
    spendDistribution: data,
    isLoading,
    error
  };
}

// Hook for fetching top campaigns data
export function useTopCampaigns(limit: number = 5, platform?: string, startDate?: string, endDate?: string) {
  const { toast } = useToast();
  
  // Build query params
  const queryParams = new URLSearchParams();
  queryParams.append('limit', limit.toString());
  if (platform) queryParams.append('platform', platform);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  
  const queryString = `?${queryParams.toString()}`;
  
  // Fetch top campaigns
  const { data, isLoading, error } = useQuery<TopCampaign[]>({
    queryKey: [`/api/metrics/top-campaigns${queryString}`],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    onError: (error: any) => {
      toast({
        title: 'Error fetching top campaigns',
        description: error.message || 'Failed to load campaign data',
        variant: 'destructive',
      });
    }
  });
  
  return {
    topCampaigns: data,
    isLoading,
    error
  };
}

// Hook for fetching performance timeseries data
export function usePerformanceTimeseries(
  metric: 'spend' | 'roas' | 'conversions' | 'ctr' = 'spend', 
  platform?: string, 
  startDate?: string, 
  endDate?: string
) {
  const { toast } = useToast();
  
  // Build query params
  const queryParams = new URLSearchParams();
  queryParams.append('metric', metric);
  if (platform) queryParams.append('platform', platform);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  
  const queryString = `?${queryParams.toString()}`;
  
  // Fetch performance data
  const { data, isLoading, error } = useQuery<PerformanceTimeseriesPoint[]>({
    queryKey: [`/api/metrics/performance${queryString}`],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    onError: (error: any) => {
      toast({
        title: 'Error fetching performance data',
        description: error.message || 'Failed to load performance data',
        variant: 'destructive',
      });
    }
  });
  
  return {
    performanceData: data,
    isLoading,
    error
  };
}

// Hook for fetching metric insights and alerts
export function useMetricInsights() {
  const { toast } = useToast();
  
  // Fetch insights
  const { data, isLoading, error } = useQuery<MetricInsight[]>({
    queryKey: ['/api/metrics/insights'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    onError: (error: any) => {
      toast({
        title: 'Error fetching insights',
        description: error.message || 'Failed to load insights data',
        variant: 'destructive',
      });
    }
  });
  
  return {
    insights: data,
    isLoading,
    error
  };
}
