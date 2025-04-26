import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { useBusiness } from "@/providers/BusinessProvider";
import { Button } from "@/components/ui/button";
import { PlusCircle, Twitter, Mail, Instagram, Facebook } from "lucide-react";

export function ContentPage() {
  const { currentBusiness, loading } = useBusiness();

  return (
    <DashboardLayout>
      {loading ? (
        <LoadingState message="Loading content dashboard..." />
      ) : (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
          <div className="bg-[#111111] rounded-xl shadow-md p-8 border border-gray-800">
            <h1 className="text-3xl font-serif mb-3 text-white">Content Management</h1>
            <p className="text-gray-300 mb-8 text-lg">
              {currentBusiness
                ? `Create and manage AI-generated marketing content for ${currentBusiness.name}.`
                : "Create and manage your AI-generated marketing content."}
            </p>

            <div className="mt-6 p-8 border border-dashed border-gray-700 rounded-xl bg-[#0D0D0D] flex flex-col items-center justify-center text-center">
              <h2 className="text-xl font-medium mb-4 text-white">Ready to create content?</h2>
              <p className="text-gray-400 mb-6 max-w-lg">
                Generate engaging social media posts, email newsletters, and more with our AI-powered content creation tools.
              </p>
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                <div className="flex items-center p-3 bg-blue-500/10 rounded-lg text-blue-400">
                  <Twitter className="h-5 w-5 mr-2" />
                  <span>Twitter</span>
                </div>
                <div className="flex items-center p-3 bg-pink-500/10 rounded-lg text-pink-400">
                  <Instagram className="h-5 w-5 mr-2" />
                  <span>Instagram</span>
                </div>
                <div className="flex items-center p-3 bg-blue-600/10 rounded-lg text-blue-500">
                  <Facebook className="h-5 w-5 mr-2" />
                  <span>Facebook</span>
                </div>
                <div className="flex items-center p-3 bg-purple-500/10 rounded-lg text-purple-400">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>Email</span>
                </div>
              </div>
              <Button size="lg" className="font-medium flex items-center gap-2 bg-primary hover:bg-primary-dark">
                <PlusCircle className="h-5 w-5" />
                <span>Create new content</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 