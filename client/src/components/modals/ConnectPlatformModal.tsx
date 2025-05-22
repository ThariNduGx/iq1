import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { generateCodeChallenge, generateCodeVerifier } from '@/lib/auth';

interface ConnectPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: string;
}

export default function ConnectPlatformModal({ isOpen, onClose, platform }: ConnectPlatformModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // Get platform display name
  const getPlatformName = () => {
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
        return 'Platform';
    }
  };

  // Get platform icon
  const getPlatformIcon = () => {
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
        return <span className="material-icons">link</span>;
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      
      // Generate PKCE code verifier and challenge
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      // Store code verifier in local storage (will be needed for token exchange)
      localStorage.setItem(`${platform}_code_verifier`, codeVerifier);
      
      // Get authorization URL
      const response = await apiRequest('GET', `/api/platforms/connect/${platform}?codeChallenge=${encodeURIComponent(codeChallenge)}`, undefined);
      const data = await response.json();
      
      // Redirect to authorization URL
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error connecting platform:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to the platform. Please try again.',
        variant: 'destructive',
      });
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {getPlatformIcon()}
            <span className="ml-2">Connect {getPlatformName()}</span>
          </DialogTitle>
          <DialogDescription>
            Connect your {getPlatformName()} account to automatically import your advertising data into CampaignIQ.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200 mb-4">
          <div className="flex items-start">
            <span className="material-icons text-neutral-600 mr-3">info</span>
            <p className="text-sm text-neutral-600">
              CampaignIQ will request read-only access to your {getPlatformName()} data. We'll never make changes to your campaigns or settings.
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-neutral-700">We'll import the following data:</h4>
          <ul className="space-y-2">
            <li className="flex items-center text-sm text-neutral-600">
              <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
              Campaign performance metrics
            </li>
            <li className="flex items-center text-sm text-neutral-600">
              <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
              Ad group and ad performance
            </li>
            <li className="flex items-center text-sm text-neutral-600">
              <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
              Conversion and engagement data
            </li>
            <li className="flex items-center text-sm text-neutral-600">
              <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
              Audience and demographic insights
            </li>
          </ul>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isConnecting}
          >
            Cancel
          </Button>
          <Button
            className="flex items-center"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            <span className="material-icons mr-2 text-sm">link</span>
            {isConnecting ? 'Connecting...' : `Connect ${getPlatformName()}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
