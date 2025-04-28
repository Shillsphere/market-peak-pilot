import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { BusinessProvider } from "@/providers/BusinessProvider";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import { supabase } from "@/lib/supabase";
import { DashboardHome } from "./pages/dashboard/DashboardHome";
import { ContentPage } from "./pages/dashboard/ContentPage";
import { ProfilePage } from "./pages/dashboard/ProfilePage";
import { ResearchPage } from "./pages/dashboard/ResearchPage";

const queryClient = new QueryClient();

// Protected route component that requires approval
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkApproval = async () => {
      if (!user) {
        setIsApproved(false);
        setChecking(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_approved')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        setIsApproved(profile?.is_approved || false);
      } catch (error) {
        console.error('Error checking approval status:', error);
        setIsApproved(false);
      }
      setChecking(false);
    };

    checkApproval();
  }, [user]);

  if (loading || checking) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || !isApproved) {
    return <Navigate to="/sign-in" replace />;
  }

  return <BusinessProvider>{children}</BusinessProvider>;
};

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            
            {/* Dashboard routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardHome />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/content" element={
              <ProtectedRoute>
                <ContentPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/research" element={
              <ProtectedRoute>
                <ResearchPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/research/:jobId" element={
              <ProtectedRoute>
                <ResearchPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/inbox" element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Inbox</h1>
                  <p className="mt-4">This feature will be available in future updates.</p>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/analytics" element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Analytics</h1>
                  <p className="mt-4">This feature will be available in future updates.</p>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Settings</h1>
                  <p className="mt-4">This feature will be available in future updates.</p>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
