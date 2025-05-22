import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import KeyMetricsCards from '@/components/dashboard/KeyMetricsCards';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import PlatformPerformance from '@/components/dashboard/PlatformPerformance';
import SpendDistribution from '@/components/dashboard/SpendDistribution';
import TopCampaigns from '@/components/dashboard/TopCampaigns';
import MetricInsights from '@/components/dashboard/MetricInsights';
import ConnectPlatformModal from '@/components/modals/ConnectPlatformModal';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';
import { usePlatforms } from '@/hooks/usePlatforms';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [platformToConnect, setPlatformToConnect] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  const { data: platforms, isLoading: platformsLoading } = usePlatforms();
  
  // Check for connection success/error in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connectionSuccess = urlParams.get('connection_success');
    const connectionError = urlParams.get('connection_error');
    
    if (connectionSuccess) {
      toast({
        title: 'Connection Successful',
        description: 'Your ad platform has been connected successfully.',
        variant: 'default',
      });
      // Remove query params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (connectionError) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to the ad platform. Please try again.',
        variant: 'destructive',
      });
      // Remove query params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);
  
  // Simulate loading state for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleConnectPlatform = (platform: string) => {
    setPlatformToConnect(platform);
    setConnectModalOpen(true);
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <>
      <LoadingOverlay isOpen={isLoading || platformsLoading} />
      
      <div className="bg-neutral-50 h-screen flex flex-col">
        <Header onSidebarToggle={toggleSidebar} />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
          
          <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 lg:p-6">
            <div>
              {/* Page Header */}
              <div className="mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h1 className="text-2xl font-bold text-neutral-800">Analytics Dashboard</h1>
                    <p className="text-neutral-500">Real-time insights across all your ad platforms</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Date Range Selector */}
                    <div className="relative">
                      <button className="inline-flex items-center px-4 py-2 border border-neutral-300 bg-white rounded-md shadow-sm text-sm text-neutral-700 hover:bg-neutral-50">
                        <span className="material-icons text-neutral-500 mr-2 text-sm">date_range</span>
                        Last 30 days
                        <span className="material-icons text-neutral-500 ml-2 text-sm">arrow_drop_down</span>
                      </button>
                    </div>
                    
                    {/* Filter Button */}
                    <div className="relative">
                      <button className="inline-flex items-center px-4 py-2 border border-neutral-300 bg-white rounded-md shadow-sm text-sm text-neutral-700 hover:bg-neutral-50">
                        <span className="material-icons text-neutral-500 mr-2 text-sm">filter_list</span>
                        Filters
                        <span className="material-icons text-neutral-500 ml-2 text-sm">arrow_drop_down</span>
                      </button>
                    </div>
                    
                    {/* Export Button */}
                    <button className="inline-flex items-center px-4 py-2 border border-neutral-300 bg-white rounded-md shadow-sm text-sm text-neutral-700 hover:bg-neutral-50">
                      <span className="material-icons text-neutral-500 mr-2 text-sm">download</span>
                      Export
                    </button>
                  </div>
                </div>
                
                {/* Platform Filter Pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button 
                    onClick={() => setSelectedPlatform(null)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full ${
                      selectedPlatform === null 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'bg-white border border-neutral-300 text-neutral-700'
                    } text-sm font-medium`}
                  >
                    <span className="mr-1">All Platforms</span>
                  </button>
                  
                  <button 
                    onClick={() => setSelectedPlatform('google_ads')}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full ${
                      selectedPlatform === 'google_ads' 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'bg-white border border-neutral-300 text-neutral-700'
                    } text-sm font-medium hover:bg-neutral-50`}
                  >
                    <span className="material-icons text-[#4285F4] mr-1 text-sm">ads_click</span>
                    <span>Google Ads</span>
                  </button>
                  
                  <button 
                    onClick={() => setSelectedPlatform('facebook_ads')}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full ${
                      selectedPlatform === 'facebook_ads' 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'bg-white border border-neutral-300 text-neutral-700'
                    } text-sm font-medium hover:bg-neutral-50`}
                  >
                    <span className="material-icons text-[#3b5998] mr-1 text-sm">facebook</span>
                    <span>Facebook Ads</span>
                  </button>
                  
                  <button 
                    onClick={() => setSelectedPlatform('instagram_ads')}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full ${
                      selectedPlatform === 'instagram_ads' 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'bg-white border border-neutral-300 text-neutral-700'
                    } text-sm font-medium hover:bg-neutral-50`}
                  >
                    <span className="material-icons text-[#E1306C] mr-1 text-sm">photo_camera</span>
                    <span>Instagram Ads</span>
                  </button>
                  
                  <button 
                    onClick={() => handleConnectPlatform('tiktok_ads')}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full ${
                      selectedPlatform === 'tiktok_ads' 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'bg-white border border-neutral-300 text-neutral-700'
                    } text-sm font-medium hover:bg-neutral-50 ${
                      !platforms?.some(p => p.platform === 'tiktok_ads') ? 'opacity-50' : ''
                    }`}
                  >
                    <span className="material-icons text-neutral-500 mr-1 text-sm">movie</span>
                    <span>TikTok Ads</span>
                  </button>
                </div>
              </div>
              
              {/* Key Metrics Cards */}
              <KeyMetricsCards />
              
              {/* Performance Chart */}
              <PerformanceChart />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Platform Performance */}
                <div className="lg:col-span-2">
                  <PlatformPerformance />
                </div>
                
                {/* Spend Distribution */}
                <div className="lg:col-span-1">
                  <SpendDistribution />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Top Campaigns */}
                <div className="lg:col-span-2">
                  <TopCampaigns />
                </div>
                
                {/* Metric Insights */}
                <div className="lg:col-span-1">
                  <MetricInsights />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {/* Connect Platform Modal */}
      <ConnectPlatformModal 
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        platform={platformToConnect}
      />
    </>
  );
}
