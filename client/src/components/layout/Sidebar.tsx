import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { usePlatforms } from "@/hooks/usePlatforms";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const { data: platforms } = usePlatforms();
  
  // Close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && !isOpen) {
        onToggle();
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, onToggle]);

  const sidebarClass = `bg-white border-r border-neutral-200 w-64 flex-shrink-0 h-full overflow-y-auto 
    transition-all duration-300 ease-in-out shadow-md lg:shadow-none
    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`;

  return (
    <aside id="sidebar" className={sidebarClass}>
      <nav className="p-4">
        <div className="mb-8">
          <h2 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-2 pl-3">Main Navigation</h2>
          <ul>
            <li className="mb-1">
              <Link 
                href="/"
                onClick={handleLinkClick}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location === "/" ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <span className={`material-icons mr-3 ${location === "/" ? "text-primary-600" : "text-neutral-500"}`}>dashboard</span>
                Dashboard
              </Link>
            </li>
            <li className="mb-1">
              <Link 
                href="/campaigns" 
                onClick={handleLinkClick}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location === "/campaigns" ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <span className={`material-icons mr-3 ${location === "/campaigns" ? "text-primary-600" : "text-neutral-500"}`}>campaign</span>
                Campaigns
              </Link>
            </li>
            <li className="mb-1">
              <Link 
                href="/analytics"
                onClick={handleLinkClick}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location === "/analytics" ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <span className={`material-icons mr-3 ${location === "/analytics" ? "text-primary-600" : "text-neutral-500"}`}>insights</span>
                Analytics
              </Link>
            </li>
            <li className="mb-1">
              <Link 
                href="/performance"
                onClick={handleLinkClick}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location === "/performance" ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <span className={`material-icons mr-3 ${location === "/performance" ? "text-primary-600" : "text-neutral-500"}`}>auto_graph</span>
                Performance
              </Link>
            </li>
            <li className="mb-1">
              <Link 
                href="/reports"
                onClick={handleLinkClick}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location === "/reports" ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <span className={`material-icons mr-3 ${location === "/reports" ? "text-primary-600" : "text-neutral-500"}`}>analytics</span>
                Reports
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-2 pl-3">Platform Connections</h2>
          <ul>
            <li className="mb-1">
              <Link 
                href="/platforms/google_ads"
                onClick={handleLinkClick}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-100"
              >
                <div className="w-6 h-6 mr-3 flex items-center justify-center">
                  <span className="material-icons text-[#4285F4]">ads_click</span>
                </div>
                Google Ads
                {platforms?.some(p => p.platform === "google_ads") ? (
                  <span className="ml-auto bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">Connected</span>
                ) : (
                  <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">Connect</span>
                )}
              </Link>
            </li>
            <li className="mb-1">
              <Link 
                href="/platforms/facebook_ads"
                onClick={handleLinkClick}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-100"
              >
                <div className="w-6 h-6 mr-3 flex items-center justify-center">
                  <span className="material-icons text-[#3b5998]">facebook</span>
                </div>
                Facebook Ads
                {platforms?.some(p => p.platform === "facebook_ads") ? (
                  <span className="ml-auto bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">Connected</span>
                ) : (
                  <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">Connect</span>
                )}
              </Link>
            </li>
            <li className="mb-1">
              <Link 
                href="/platforms/instagram_ads"
                onClick={handleLinkClick}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-100"
              >
                <div className="w-6 h-6 mr-3 flex items-center justify-center">
                  <span className="material-icons text-[#E1306C]">photo_camera</span>
                </div>
                Instagram Ads
                {platforms?.some(p => p.platform === "facebook_ads") ? (
                  <span className="ml-auto bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">Connected</span>
                ) : (
                  <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">Connect</span>
                )}
              </Link>
            </li>
            <li className="mb-1">
              <Link 
                href="/platforms/tiktok_ads"
                onClick={handleLinkClick}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-700 hover:bg-neutral-100"
              >
                <div className="w-6 h-6 mr-3 flex items-center justify-center">
                  <span className="material-icons text-[#000000]">movie</span>
                </div>
                TikTok Ads
                {platforms?.some(p => p.platform === "tiktok_ads") ? (
                  <span className="ml-auto bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">Connected</span>
                ) : (
                  <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">Connect</span>
                )}
              </Link>
            </li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-2 pl-3">Settings</h2>
          <ul>
            <li className="mb-1">
              <Link 
                href="/settings"
                onClick={handleLinkClick}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location === "/settings" ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <span className={`material-icons mr-3 ${location === "/settings" ? "text-primary-600" : "text-neutral-500"}`}>settings</span>
                General Settings
              </Link>
            </li>
            <li className="mb-1">
              <Link 
                href="/account"
                onClick={handleLinkClick}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location === "/account" ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <span className={`material-icons mr-3 ${location === "/account" ? "text-primary-600" : "text-neutral-500"}`}>account_circle</span>
                Account
              </Link>
            </li>
            <li className="mb-1">
              <Link 
                href="/support"
                onClick={handleLinkClick}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  location === "/support" ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <span className={`material-icons mr-3 ${location === "/support" ? "text-primary-600" : "text-neutral-500"}`}>support_agent</span>
                Support
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}
