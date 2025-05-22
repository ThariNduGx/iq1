import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

export default function PlatformPerformance() {
  // Fetch platform performance data
  const { data: platformPerformance, isLoading } = useQuery({
    queryKey: ['/api/metrics/platforms'],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Format currency with commas and 2 decimal places
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'google_ads':
        return <span className="material-icons text-[#4285F4]">ads_click</span>;
      case 'facebook_ads':
        return <span className="material-icons text-[#3b5998]">facebook</span>;
      case 'instagram_ads':
        return <span className="material-icons text-[#E1306C]">photo_camera</span>;
      case 'tiktok_ads':
        return <span className="material-icons text-[#000000]">movie</span>;
      default:
        return <span className="material-icons text-neutral-500">help_outline</span>;
    }
  };

  // Get platform display name
  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'google_ads':
        return 'Google Ads';
      case 'facebook_ads':
        return 'Facebook Ads';
      case 'instagram_ads':
        return 'Instagram Ads';
      case 'tiktok_ads':
        return 'TikTok Ads';
      default:
        return platform;
    }
  };

  // Get ROAS color class
  const getRoasColorClass = (roas: number) => {
    if (roas >= 3) return 'text-green-600';
    if (roas >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200 h-full">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-6" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Platform</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Spend</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Clicks</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Conversions</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">ROAS</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">CPC</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {[...Array(4)].map((_, index) => (
                <tr key={index} className="hover:bg-neutral-50">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-24 ml-3" />
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right">
                    <Skeleton className="h-4 w-12 ml-auto" />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right">
                    <Skeleton className="h-4 w-10 ml-auto" />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right">
                    <Skeleton className="h-4 w-12 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-800">Platform Performance</h2>
        <button className="text-neutral-500 hover:text-neutral-700">
          <span className="material-icons">more_vert</span>
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Platform</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Spend</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Clicks</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Conversions</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">ROAS</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">CPC</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {platformPerformance?.map((platform: any) => (
              <tr key={platform.platform} className={`hover:bg-neutral-50 ${!platform.isConnected ? 'opacity-50' : ''}`}>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center">
                      {getPlatformIcon(platform.platform)}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-neutral-800">
                        {getPlatformName(platform.platform)}
                      </div>
                      {!platform.isConnected && (
                        <div className="text-xs text-neutral-500">Not connected</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-mono font-medium text-neutral-800">
                  {platform.isConnected ? formatCurrency(platform.spend) : '-'}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-mono text-neutral-800">
                  {platform.isConnected ? platform.clicks.toLocaleString() : '-'}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-mono text-neutral-800">
                  {platform.isConnected ? platform.conversions.toLocaleString() : '-'}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-mono text-neutral-800">
                  {platform.isConnected ? (
                    <span className={`font-medium ${getRoasColorClass(platform.roas)}`}>
                      {platform.roas.toFixed(1)}x
                    </span>
                  ) : '-'}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-mono text-neutral-800">
                  {platform.isConnected ? formatCurrency(platform.cpc) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
