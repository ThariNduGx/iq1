import { useMetrics } from "@/hooks/useMetrics";
import { Skeleton } from "@/components/ui/skeleton";

export default function KeyMetricsCards() {
  const { summary, isLoading } = useMetrics();

  // Format currency with commas and 2 decimal places
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return value.toFixed(1) + '%';
  };

  if (isLoading) {
    return (
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
            <Skeleton className="h-5 w-28 mb-2" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Spend Card */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-neutral-500 text-sm">Total Spend</p>
            <p className="text-2xl font-semibold font-mono mt-1 text-neutral-800">
              {formatCurrency(summary?.totalSpend || 0)}
            </p>
            <div className="flex items-center mt-1">
              <span className={`text-sm flex items-center font-medium ${summary?.spendChange && summary.spendChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="material-icons text-xs mr-1">
                  {summary?.spendChange && summary.spendChange > 0 ? 'arrow_upward' : 'arrow_downward'}
                </span>
                {formatPercentage(Math.abs(summary?.spendChange || 0))}
              </span>
              <span className="text-neutral-500 text-xs ml-1">vs prev. period</span>
            </div>
          </div>
          <div className="bg-primary-100 p-2 rounded-md">
            <span className="material-icons text-primary-700">payments</span>
          </div>
        </div>
      </div>

      {/* Overall ROAS Card */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-neutral-500 text-sm">Overall ROAS</p>
            <p className="text-2xl font-semibold font-mono mt-1 text-neutral-800">
              {(summary?.overallRoas || 0).toFixed(2)}x
            </p>
            <div className="flex items-center mt-1">
              <span className={`text-sm flex items-center font-medium ${summary?.roasChange && summary.roasChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="material-icons text-xs mr-1">
                  {summary?.roasChange && summary.roasChange > 0 ? 'arrow_upward' : 'arrow_downward'}
                </span>
                {formatPercentage(Math.abs(summary?.roasChange || 0))}
              </span>
              <span className="text-neutral-500 text-xs ml-1">vs prev. period</span>
            </div>
          </div>
          <div className="bg-secondary-100 p-2 rounded-md">
            <span className="material-icons text-secondary-700">trending_up</span>
          </div>
        </div>
      </div>

      {/* Total Conversions Card */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-neutral-500 text-sm">Total Conversions</p>
            <p className="text-2xl font-semibold font-mono mt-1 text-neutral-800">
              {summary?.totalConversions?.toLocaleString() || 0}
            </p>
            <div className="flex items-center mt-1">
              <span className={`text-sm flex items-center font-medium ${summary?.conversionsChange && summary.conversionsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="material-icons text-xs mr-1">
                  {summary?.conversionsChange && summary.conversionsChange > 0 ? 'arrow_upward' : 'arrow_downward'}
                </span>
                {formatPercentage(Math.abs(summary?.conversionsChange || 0))}
              </span>
              <span className="text-neutral-500 text-xs ml-1">vs prev. period</span>
            </div>
          </div>
          <div className="bg-accent-100 p-2 rounded-md">
            <span className="material-icons text-accent-700">shopping_cart</span>
          </div>
        </div>
      </div>

      {/* Cost Per Conversion Card */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-neutral-500 text-sm">Cost Per Conversion</p>
            <p className="text-2xl font-semibold font-mono mt-1 text-neutral-800">
              {formatCurrency(summary?.averageCostPerConversion || 0)}
            </p>
            <div className="flex items-center mt-1">
              <span className={`text-sm flex items-center font-medium ${summary?.costPerConversionChange && summary.costPerConversionChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="material-icons text-xs mr-1">
                  {summary?.costPerConversionChange && summary.costPerConversionChange < 0 ? 'arrow_downward' : 'arrow_upward'}
                </span>
                {formatPercentage(Math.abs(summary?.costPerConversionChange || 0))}
              </span>
              <span className="text-neutral-500 text-xs ml-1">vs prev. period</span>
            </div>
          </div>
          <div className="bg-red-100 p-2 rounded-md">
            <span className="material-icons text-red-700">money_off</span>
          </div>
        </div>
      </div>
    </div>
  );
}
