import { ReactNode, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useBusiness } from "@/providers/BusinessProvider";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  MessageSquare, 
  BarChart, 
  Settings, 
  User, 
  Menu, 
  X, 
  LogOut,
  Search,
  FlaskConical
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const { currentBusiness } = useBusiness();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { 
      name: "Content", 
      path: "/dashboard/content", 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    {
      name: "Research",
      path: "/dashboard/research",
      icon: <FlaskConical className="h-5 w-5" />
    },
    { 
      name: "Inbox", 
      path: "/dashboard/inbox", 
      icon: <MessageSquare className="h-5 w-5" /> 
    },
    { 
      name: "Analytics", 
      path: "/dashboard/analytics", 
      icon: <BarChart className="h-5 w-5" /> 
    },
    { 
      name: "Settings", 
      path: "/dashboard/settings", 
      icon: <Settings className="h-5 w-5" /> 
    },
  ];

  return (
    <div className="flex h-screen bg-[#1A1A1A] text-white font-sans">
      {/* Mobile sidebar toggle */}
      <div className="fixed inset-0 z-40 bg-black/80 lg:hidden" 
           onClick={() => setSidebarOpen(false)} 
           style={{ display: sidebarOpen ? "block" : "none" }} />

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#111111] transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:w-64 lg:shadow-xl border-r border-gray-800",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-800">
          <Link to="/dashboard" className="text-xl font-bold text-white">
            MarketPeak
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {currentBusiness && (
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-sm text-gray-400">Current Business</p>
            <p className="font-medium text-white">{currentBusiness.name}</p>
          </div>
        )}

        <nav className="mt-6 px-3">
          <ul className="space-y-1.5">
            {navigationItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center p-2.5 rounded-md transition-colors",
                    location.pathname === item.path || location.pathname.startsWith(item.path + "/")
                      ? "bg-gray-800 text-white font-medium" 
                      : "text-gray-400 hover:text-white hover:bg-gray-800/70"
                  )}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="bg-[#111111] border-b border-gray-800 h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden mr-2 text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium lg:hidden text-white">MarketPeak</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="py-1.5 pl-10 pr-4 text-sm bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white w-40 lg:w-56"
              />
            </div>
            <Link to="/dashboard/profile">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={signOut} className="text-gray-400 hover:text-white hover:bg-gray-800">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-5 lg:p-8 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {children}
        </main>
      </div>
    </div>
  );
} 