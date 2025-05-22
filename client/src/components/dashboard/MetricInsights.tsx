import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistance } from 'date-fns';

export default function MetricInsights() {
  // Fetch insights data
  const { data: insights, isLoading } = useQuery({
    queryKey: ['/api/metrics/insights'],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Get insight type config (icon, colors, etc.)
  const getInsightTypeConfig = (type: string) => {
    switch (type) {
      case 'improvement':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconBgColor: 'bg-green-100',
          iconColor: 'text-green-700',
          icon: 'trending_up',
          titleColor: 'text-green-800',
          textColor: 'text-green-700',
          timeColor: 'text-green-600'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconBgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-700',
          icon: 'warning',
          titleColor: 'text-yellow-800',
          textColor: 'text-yellow-700',
          timeColor: 'text-yellow-600'
        };
      case 'alert':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconBgColor: 'bg-red-100',
          iconColor: 'text-red-700',
          icon: 'trending_down',
          titleColor: 'text-red-800',
          textColor: 'text-red-700',
          timeColor: 'text-red-600'
        };
      case 'recommendation':
      default:
        return {
          bgColor: 'bg-neutral-50',
          borderColor: 'border-neutral-200',
          iconBgColor: 'bg-neutral-100',
          iconColor: 'text-neutral-700',
          icon: 'auto_awesome',
          titleColor: 'text-neutral-800',
          textColor: 'text-neutral-700',
          timeColor: 'text-neutral-500'
        };
    }
  };

  // Format relative time (e.g., "10 minutes ago")
  const formatRelativeTime = (timestamp: string) => {
    return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200 h-full">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
              <div className="flex items-start">
                <Skeleton className="h-8 w-8 rounded-md mr-3" />
                <div className="w-full">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const newInsightsCount = insights?.filter((insight: any) => {
    const timestamp = new Date(insight.timestamp);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return timestamp > oneDayAgo;
  }).length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-800">Insights & Alerts</h2>
        {newInsightsCount > 0 && (
          <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-2 py-1 rounded-full">
            {newInsightsCount} New
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        {insights?.map((insight: any, index: number) => {
          const config = getInsightTypeConfig(insight.type);
          return (
            <div key={index} className={`p-3 ${config.bgColor} border ${config.borderColor} rounded-lg`}>
              <div className="flex items-start">
                <div className={`${config.iconBgColor} p-1.5 rounded-md mr-3`}>
                  <span className={`material-icons ${config.iconColor} text-lg`}>
                    {config.icon}
                  </span>
                </div>
                <div>
                  <h3 className={`text-sm font-medium ${config.titleColor}`}>{insight.title}</h3>
                  <p className={`text-xs ${config.textColor} mt-1`}>{insight.message}</p>
                  <p className={`text-xs ${config.timeColor} mt-2 font-medium`}>
                    {formatRelativeTime(insight.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
