import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { useAuth } from "@/providers/AuthProvider";
import { useBusiness } from "@/providers/BusinessProvider";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { User, Building, AtSign, Shield, Settings2 } from "lucide-react";

export function ProfilePage() {
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();
  const { data: profile, isLoading } = useProfile();
  
  return (
    <DashboardLayout>
      {isLoading ? (
        <LoadingState message="Loading profile..." />
      ) : (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
          <div className="bg-[#111111] rounded-xl shadow-md p-8 border border-gray-800">
            <h1 className="text-3xl font-serif mb-4 text-white">User Profile</h1>
            <p className="text-gray-300 mb-8 text-lg">
              Manage your profile settings and preferences.
            </p>
            
            <div className="border border-gray-800 rounded-xl p-6 mb-8 space-y-6 bg-[#0D0D0D]">
              <div className="flex items-center mb-2">
                <div className="bg-primary/10 p-2 rounded-lg mr-3">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-medium text-white">Account Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <AtSign className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-400">Email Address</p>
                  </div>
                  <p className="font-medium text-white pl-6">{user?.email}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-400">Account Role</p>
                  </div>
                  <p className="font-medium text-white capitalize pl-6">{profile?.role || "User"}</p>
                </div>
              </div>
            </div>
            
            {currentBusiness && (
              <div className="border border-gray-800 rounded-xl p-6 mb-8 bg-[#0D0D0D]">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-500/10 p-2 rounded-lg mr-3">
                    <Building className="h-5 w-5 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-medium text-white">Business Information</h2>
                </div>
                <div className="space-y-2 pl-6">
                  <p className="text-sm text-gray-400">Business Name</p>
                  <p className="font-medium text-white">{currentBusiness.name}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button variant="outline" className="text-white border-gray-700 hover:bg-gray-800 hover:text-white">
                <Settings2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
          
          <div className="bg-[#111111] rounded-xl shadow-md p-8 border border-gray-800">
            <h2 className="text-xl font-medium mb-4 text-white">Account Settings</h2>
            <p className="text-sm text-gray-400">
              Additional profile settings will be available in future updates.
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 