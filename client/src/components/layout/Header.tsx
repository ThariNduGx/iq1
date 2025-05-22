import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface HeaderProps {
  onSidebarToggle: () => void;
}

export default function Header({ onSidebarToggle }: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Get user data
  const { data: authData } = useQuery({
    queryKey: ["/api/auth/status"],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  const user = authData?.user;
  
  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm z-10">
      <div className="flex justify-between items-center px-4 py-2">
        <div className="flex items-center">
          <button 
            id="sidebar-toggle" 
            className="mr-2 p-2 rounded-md hover:bg-neutral-100 lg:hidden"
            onClick={onSidebarToggle}
            aria-label="Toggle sidebar"
          >
            <span className="material-icons text-neutral-600">menu</span>
          </button>
          <div className="flex items-center">
            <svg className="h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <h1 className="text-xl font-semibold text-neutral-800 ml-2">CampaignIQ</h1>
          </div>
        </div>
        <div className="flex items-center">
          <button 
            className="p-2 rounded-full hover:bg-neutral-100 relative" 
            aria-label="Notifications"
          >
            <span className="material-icons text-neutral-600">notifications</span>
            <span className="absolute top-1 right-1 bg-accent-500 rounded-full w-2 h-2"></span>
          </button>
          <button 
            className="p-2 rounded-full hover:bg-neutral-100" 
            aria-label="Help"
          >
            <span className="material-icons text-neutral-600">help_outline</span>
          </button>
          <div className="ml-2 flex items-center">
            <div className="relative group">
              <button 
                className="flex items-center hover:bg-neutral-100 rounded-full p-1 transition-colors duration-200"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <img 
                  className="h-8 w-8 rounded-full" 
                  src={user?.avatarUrl || "https://ui-avatars.com/api/?name=User&background=random"}
                  alt="User profile" 
                />
                <span className="material-icons text-neutral-500 ml-1">arrow_drop_down</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-neutral-200 z-10">
                  <div className="py-2 px-4 border-b border-neutral-200">
                    <p className="text-sm font-medium text-neutral-800">{user?.name || "User"}</p>
                    <p className="text-xs text-neutral-500">{user?.email || "user@example.com"}</p>
                  </div>
                  <div className="py-1">
                    <a href="/account" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                      Profile Settings
                    </a>
                    <a href="/teams" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                      Team Management
                    </a>
                    <a href="/api-settings" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                      API Settings
                    </a>
                    <a 
                      href="/api/auth/logout" 
                      className="block px-4 py-2 text-sm text-red-600 hover:bg-neutral-100 hover:text-red-700"
                    >
                      Sign out
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
