import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, subDays } from 'date-fns';

type MetricType = 'spend' | 'roas' | 'conversions' | 'ctr';

export default function PerformanceChart() {
  const [activeMetric, setActiveMetric] = useState<MetricType>('spend');
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Fetch performance data
  const { data: performanceData, isLoading } = useQuery({
    queryKey: [`/api/metrics/performance?metric=${activeMetric}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Format data for chart
  const formattedData = performanceData?.map((item: any) => ({
    date: format(parseISO(item.date), 'MMM dd'),
    googleAds: item.google_ads || 0,
    facebookAds: item.facebook_ads || 0,
    instagramAds: item.instagram_ads || 0,
    tiktokAds: item.tiktok_ads || 0,
    total: item.total || 0
  }));

  // Get metric label and format
  const getMetricConfig = (metric: MetricType) => {
    switch (metric) {
      case 'spend':
        return {
          label: 'Spend ($)',
          format: (value: number) => `$${value.toFixed(2)}`
        };
      case 'roas':
        return {
          label: 'ROAS',
          format: (value: number) => `${value.toFixed(2)}x`
        };
      case 'conversions':
        return {
          label: 'Conversions',
          format: (value: number) => value.toLocaleString()
        };
      case 'ctr':
        return {
          label: 'CTR (%)',
          format: (value: number) => `${(value * 100).toFixed(2)}%`
        };
    }
  };

  const metricConfig = getMetricConfig(activeMetric);

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <Skeleton className="h-6 w-48 mb-2 sm:mb-0" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
          <div className="h-80 w-full bg-neutral-50 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-800 mb-2 sm:mb-0">Performance Over Time</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveMetric('spend')}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                activeMetric === 'spend'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Spend
            </button>
            <button
              onClick={() => setActiveMetric('roas')}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                activeMetric === 'roas'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              ROAS
            </button>
            <button
              onClick={() => setActiveMetric('conversions')}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                activeMetric === 'conversions'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Conversions
            </button>
            <button
              onClick={() => setActiveMetric('ctr')}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                activeMetric === 'ctr'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              CTR
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData || []}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                tickFormatter={(value) => {
                  if (activeMetric === 'spend') {
                    return value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value}`;
                  } else if (activeMetric === 'ctr') {
                    return `${(value * 100).toFixed(1)}%`;
                  } else if (activeMetric === 'roas') {
                    return `${value.toFixed(1)}x`;
                  }
                  return value.toString();
                }}
              />
              <Tooltip 
                formatter={(value: number) => metricConfig.format(value)}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="googleAds"
                name="Google Ads"
                stroke="#4285F4"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="facebookAds"
                name="Facebook Ads"
                stroke="#3b5998"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="instagramAds"
                name="Instagram Ads"
                stroke="#E1306C"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="tiktokAds"
                name="TikTok Ads"
                stroke="#000000"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="#6B7280"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
