import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export default function SpendDistribution() {
  // Fetch spend distribution data
  const { data: spendDistribution, isLoading } = useQuery({
    queryKey: ['/api/metrics/spend-distribution'],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Platform colors
  const PLATFORM_COLORS: Record<string, string> = {
    google_ads: '#4285F4',
    facebook_ads: '#3b5998',
    instagram_ads: '#E1306C',
    tiktok_ads: '#000000'
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

  // Format percentage
  const formatPercentage = (value: number) => {
    return value.toFixed(1) + '%';
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-neutral-200 shadow-sm rounded-md">
          <p className="text-sm font-medium">{getPlatformName(data.platform)}</p>
          <p className="text-sm text-neutral-600">{formatPercentage(data.percentage)}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200 h-full">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-6" />
        </div>
        
        <div className="h-64 w-full mb-4">
          <div className="w-full h-full bg-neutral-50 rounded-lg animate-pulse" />
        </div>
        
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="w-3 h-3 rounded-full mr-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-800">Spend Distribution</h2>
        <button className="text-neutral-500 hover:text-neutral-700">
          <span className="material-icons">more_vert</span>
        </button>
      </div>
      
      <div className="h-64 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={spendDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={40}
              paddingAngle={2}
              dataKey="percentage"
            >
              {spendDistribution?.map((entry: any) => (
                <Cell 
                  key={entry.platform} 
                  fill={entry.isConnected ? PLATFORM_COLORS[entry.platform] : '#E5E7EB'} 
                  opacity={entry.isConnected ? 1 : 0.5}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="space-y-3">
        {spendDistribution?.map((platform: any) => (
          <div key={platform.platform} className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ 
                  backgroundColor: platform.isConnected ? PLATFORM_COLORS[platform.platform] : '#E5E7EB',
                  opacity: platform.isConnected ? 1 : 0.5
                }}
              ></div>
              <span className="text-sm text-neutral-700">{getPlatformName(platform.platform)}</span>
            </div>
            <span className="text-sm font-medium font-mono text-neutral-800">
              {formatPercentage(platform.percentage)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
