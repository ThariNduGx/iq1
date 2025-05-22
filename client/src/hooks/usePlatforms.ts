import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { PlatformConnection } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';

// Hook for fetching connected platforms
export function usePlatforms() {
  const { toast } = useToast();
  
  return useQuery<PlatformConnection[]>({
    queryKey: ['/api/platforms'],
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
    onError: (error: any) => {
      toast({
        title: 'Error fetching platforms',
        description: error.message || 'Failed to load platform connections',
        variant: 'destructive',
      });
    }
  });
}

// Hook for checking if a specific platform is connected
export function usePlatformConnection(platform: string) {
  const { data: platforms, isLoading, error } = usePlatforms();
  
  const isConnected = platforms?.some(p => p.platform === platform) || false;
  const platformData = platforms?.find(p => p.platform === platform);
  
  return {
    isConnected,
    platformData,
    isLoading,
    error
  };
}

// Hook for disconnecting a platform
export function useDisconnectPlatform() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (platform: string) => {
      await apiRequest('DELETE', `/api/platforms/${platform}`, undefined);
      return platform;
    },
    onSuccess: (platform) => {
      // Invalidate platforms query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/platforms'] });
      
      toast({
        title: 'Platform Disconnected',
        description: `Your ${getPlatformDisplayName(platform)} account has been disconnected.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error Disconnecting Platform',
        description: error.message || 'Failed to disconnect the platform',
        variant: 'destructive',
      });
    }
  });
}

// Hook for initiating a platform connection
export function useConnectPlatform() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (params: { platform: string, codeChallenge: string }) => {
      const { platform, codeChallenge } = params;
      const response = await apiRequest(
        'GET', 
        `/api/platforms/connect/${platform}?codeChallenge=${encodeURIComponent(codeChallenge)}`, 
        undefined
      );
      return response.json();
    },
    onError: (error: any) => {
      toast({
        title: 'Error Connecting Platform',
        description: error.message || 'Failed to initiate platform connection',
        variant: 'destructive',
      });
    }
  });
}

// Helper function to get platform display name
function getPlatformDisplayName(platform: string): string {
  switch (platform) {
    case 'google_ads':
      return 'Google Ads';
    case 'facebook_ads':
      return 'Facebook Ads';
    case 'tiktok_ads':
      return 'TikTok Ads';
    default:
      return platform;
  }
}
