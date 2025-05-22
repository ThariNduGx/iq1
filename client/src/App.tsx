import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Suspense, lazy, useEffect } from "react";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { getQueryFn } from "@/lib/queryClient";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

// Lazy load dashboard to reduce initial bundle size
const Dashboard = lazy(() => import("@/pages/dashboard"));

function App() {
  const [location, setLocation] = useLocation();
  
  // Check authentication status
  const { data: authData, isLoading, isError } = useQuery({
    queryKey: ["/api/auth/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: true
  });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isError) {
      if (!authData?.isAuthenticated && location !== "/login") {
        setLocation("/login");
      } else if (authData?.isAuthenticated && location === "/login") {
        setLocation("/");
      }
    }
  }, [authData, isLoading, isError, location, setLocation]);

  return (
    <Suspense fallback={<LoadingOverlay isOpen={true} message="Loading application..." />}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" component={Dashboard} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default App;
