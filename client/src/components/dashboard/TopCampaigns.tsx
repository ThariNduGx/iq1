import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

export default function TopCampaigns() {
  // Fetch top campaigns data
  const { data: topCampaigns, isLoading } = useQuery({
    queryKey: ['/api/metrics/top-campaigns'],
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
        return <span className="material-icons text-[#4285F4] text-sm mr-1">ads_click</span>;
      case 'facebook_ads':
        return <span className="material-icons text-[#3b5998] text-sm mr-1">facebook</span>;
      case 'instagram_ads':
        return <span className="material-icons text-[#E1306C] text-sm mr-1">photo_camera</span>;
      case 'tiktok_ads':
        return <span className="material-icons text-[#000000] text-sm mr-1">movie</span>;
      default:
        return <span className="material-icons text-neutral-500 text-sm mr-1">help_outline</span>;
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
      <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-5 w-16" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Campaign</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Platform</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Spend</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Conversions</th>
                <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">ROAS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="hover:bg-neutral-50">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-36" />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-4 mr-1 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right">
                    <Skeleton className="h-4 w-12 ml-auto" />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right">
                    <Skeleton className="h-4 w-10 ml-auto" />
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
    <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-800">Top Performing Campaigns</h2>
        <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">View All</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Campaign</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Platform</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Spend</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Conversions</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">ROAS</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {topCampaigns?.map((campaign: any) => (
              <tr key={campaign.campaignName + campaign.platform} className="hover:bg-neutral-50">
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-neutral-800">{campaign.campaignName}</div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getPlatformIcon(campaign.platform)}
                    <span className="text-sm text-neutral-600">{getPlatformName(campaign.platform)}</span>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-mono text-neutral-800">
                  {formatCurrency(campaign.spend)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-mono text-neutral-800">
                  {campaign.conversions.toLocaleString()}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-mono text-neutral-800">
                  <span className={`font-medium ${getRoasColorClass(campaign.roas)}`}>
                    {campaign.roas.toFixed(1)}x
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
