import { useAuth } from "@/providers/AuthProvider";
import { useBusiness } from "@/providers/BusinessProvider";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { useEffect, useState } from "react";
import { PlusCircle, FileText, MessageSquare, BarChart3 } from "lucide-react";

export function DashboardHome() {
  const { user } = useAuth();
  const { currentBusiness, loading } = useBusiness();
  const [greeting, setGreeting] = useState<string>('Good day');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <DashboardLayout>
      {loading ? (
        <LoadingState message="Loading dashboard data..." />
      ) : (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto">
          <div className="bg-[#111111] rounded-xl shadow-md p-8 border border-gray-800">
            <h1 className="text-3xl font-serif mb-2 text-white">{greeting}</h1>
            {currentBusiness ? (
              <p className="text-gray-300 mb-6 text-lg">
                Welcome to the {currentBusiness.name} dashboard. Let's create some incredible content for your business.
              </p>
            ) : (
              <p className="text-gray-300 mb-6 text-lg">
                Welcome to MarketPeak. Let's create some incredible content for your business.
              </p>
            )}
            <Link to="/dashboard/content">
              <Button size="lg" className="font-medium flex items-center gap-2 bg-primary hover:bg-primary-dark text-white">
                <PlusCircle className="h-5 w-5" />
                <span>Generate your first marketing content using AI</span>
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-[#111111] p-6 rounded-xl shadow-md border border-gray-800 transition-transform hover:translate-y-[-4px]">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-3 rounded-lg mr-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-medium text-white">Content</h2>
              </div>
              <p className="text-gray-400 mb-5 text-sm">Create and manage your AI-generated marketing content with ease.</p>
              <Link to="/dashboard/content">
                <Button variant="outline" className="w-full text-white border-gray-700 hover:bg-gray-800 hover:text-white">
                  Go to Content
                </Button>
              </Link>
            </div>
            
            <div className="bg-[#111111] p-6 rounded-xl shadow-md border border-gray-800 transition-transform hover:translate-y-[-4px]">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500/10 p-3 rounded-lg mr-3">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                </div>
                <h2 className="text-xl font-medium text-white">Inbox</h2>
              </div>
              <p className="text-gray-400 mb-5 text-sm">View and respond to customer messages and inquiries efficiently.</p>
              <Link to="/dashboard/inbox">
                <Button variant="outline" className="w-full text-white border-gray-700 hover:bg-gray-800 hover:text-white">
                  Go to Inbox
                </Button>
              </Link>
            </div>
            
            <div className="bg-[#111111] p-6 rounded-xl shadow-md border border-gray-800 transition-transform hover:translate-y-[-4px]">
              <div className="flex items-center mb-4">
                <div className="bg-green-500/10 p-3 rounded-lg mr-3">
                  <BarChart3 className="h-6 w-6 text-green-500" />
                </div>
                <h2 className="text-xl font-medium text-white">Analytics</h2>
              </div>
              <p className="text-gray-400 mb-5 text-sm">Track performance metrics for your marketing campaigns in real-time.</p>
              <Link to="/dashboard/analytics">
                <Button variant="outline" className="w-full text-white border-gray-700 hover:bg-gray-800 hover:text-white">
                  Go to Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 