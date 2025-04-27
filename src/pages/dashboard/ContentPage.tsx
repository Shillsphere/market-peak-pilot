import React, { useState } from 'react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LoadingState } from "@/components/dashboard/LoadingState";
import { useBusiness } from "@/providers/BusinessProvider";
import { Button } from "@/components/ui/button";
import { PlusCircle, Twitter, Mail, Instagram, Facebook, Image as ImageIcon, Loader2, ClipboardCopy } from "lucide-react";
import { useGeneratePost } from "@/hooks/useGeneratePost";
import { usePosts, Post } from "@/hooks/usePosts";
import { supabaseUrl } from "@/lib/supabaseUrl";
import { toast } from "sonner";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Template {
  id: string;
  name: string;
  prompt: string;
}

async function fetchTemplates(): Promise<Template[]> {
  const response = await fetch('/api/content/templates');
  if (!response.ok) {
    throw new Error('Failed to fetch templates');
  }
  return response.json();
}

function useTemplates() {
  return useQuery<Template[], Error>({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  });
}

export function ContentPage() {
  const { currentBusiness, loading: businessLoading } = useBusiness();
  const genPost = useGeneratePost();
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading: postsLoading } = usePosts(currentBusiness?.id);
  const { data: templates = [], isLoading: templatesLoading } = useTemplates();

  console.log("ContentPage Render:");
  console.log("  businessLoading:", businessLoading);
  console.log("  currentBusiness:", currentBusiness);
  console.log("  templatesLoading:", templatesLoading);
  console.log("  templates:", templates);
  console.log("  Button Disabled Check:", { 
      isBusinessMissing: !currentBusiness,
      isTemplatesLoading: templatesLoading,
      shouldBeDisabled: !currentBusiness || templatesLoading 
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);
  const [additionalPrompt, setAdditionalPrompt] = useState('');

  const handleGenerate = () => {
    if (!currentBusiness) {
      toast.error("Please select a business first.");
      return;
    }
    if (!selectedTemplateId) {
        toast.error("Please select a template.");
        return;
    }

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
    if (!selectedTemplate) {
        toast.error("Selected template not found.");
        return;
    }

    let finalPrompt = selectedTemplate.prompt;
    if (additionalPrompt.trim()) {
        finalPrompt += `\n\nAdditional details: ${additionalPrompt.trim()}`;
    }

    console.log("Starting generation with prompt:", finalPrompt);
    toast.info("Starting content generation...");

    genPost.mutate(
      {
        prompt: finalPrompt
      },
      {
        onSuccess: (data) => {
          toast.success("Content generation started! It will appear below shortly.");
          queryClient.invalidateQueries({ queryKey: ['posts', currentBusiness?.id] });
          setIsModalOpen(false);
          setSelectedTemplateId(undefined);
          setAdditionalPrompt('');
        },
        onError: (error) => {
          toast.error(`Failed to start generation: ${error.message}`);
        }
      }
    );
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success("Caption copied to clipboard!");
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast.error("Failed to copy caption.");
      });
  };

  const isLoading = businessLoading || postsLoading;

  return (
    <DashboardLayout>
      {isLoading ? (
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
                Select a template and optionally add details to generate engaging social media posts and images.
              </p>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                   <Button
                      size="lg"
                      className="font-medium flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50"
                      disabled={!currentBusiness || templatesLoading}
                    >
                       <PlusCircle className="h-5 w-5" />
                       <span>Create new content</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-[#111111] border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Generate New Content</DialogTitle>
                    <DialogDescription>
                      Select a template and provide any additional details for the AI.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="template" className="text-right text-gray-300">
                        Template
                      </Label>
                       <Select
                          value={selectedTemplateId}
                          onValueChange={setSelectedTemplateId}
                          disabled={templatesLoading}
                       >
                        <SelectTrigger id="template" className="col-span-3 bg-[#0D0D0D] border-gray-600 text-white">
                          <SelectValue placeholder="Select a template..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111111] border-gray-600 text-white">
                          {templatesLoading ? (
                              <SelectItem value="loading" disabled>Loading...</SelectItem>
                          ) : (
                              templates.map(template => (
                                  <SelectItem key={template.id} value={template.id}>
                                      {template.name}
                                  </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="additionalPrompt" className="text-right text-gray-300 pt-2">
                        Details
                        <span className="block text-xs text-gray-500">(Optional)</span>
                      </Label>
                      <Textarea
                        id="additionalPrompt"
                        className="col-span-3 bg-[#0D0D0D] border-gray-600 text-white min-h-[100px]"
                        placeholder="e.g., Mention 20% discount, target audience is young families, use a friendly tone..."
                        value={additionalPrompt}
                        onChange={(e) => setAdditionalPrompt(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={handleGenerate}
                      disabled={genPost.isPending || !selectedTemplateId || templatesLoading}
                      className="bg-primary hover:bg-primary-dark"
                    >
                      {genPost.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Content'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Generated Content</h2>
            {postsLoading && !posts.length ? (
              <LoadingState message="Loading posts..." />
            ) : posts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No content generated yet. Click the button above to start!</p>
            ) : (
              [...posts]
               .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
               .map((p: Post) => (
                <div key={p.id} className={`border border-gray-800 rounded-lg p-4 bg-[#0d0d0d] flex gap-4 items-start ${p.status === 'generating' ? 'opacity-60' : ''}`}>
                  <div className="flex-shrink-0 w-32 h-32 bg-gray-800 rounded flex items-center justify-center overflow-hidden">
                     {p.status === 'generating' && (
                        <div className="text-center p-2">
                            <Loader2 className="h-8 w-8 text-gray-500 mx-auto animate-spin" />
                            <p className="text-gray-400 text-xs italic mt-1">Generating...</p>
                        </div>
                     )}
                     {p.status === 'ready' && p.generated_images?.url && supabaseUrl && (
                        <img
                          className="w-full h-full object-cover"
                          src={`${supabaseUrl}/storage/v1/object/public/${p.generated_images.url}`}
                          alt={`Generated image for: ${p.caption?.substring(0, 30)}...`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const errorIconHtml = `
                                <div class="text-center p-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle h-8 w-8 text-red-500 mx-auto mb-1"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                                    <p class="text-red-400 text-xs italic">Load Error</p>
                                </div>`;
                            (e.target as HTMLImageElement).parentElement!.innerHTML = errorIconHtml;
                           }}
                        />
                     )}
                     {p.status === 'failed' && (
                        <div className="text-center p-2">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle h-8 w-8 text-red-500 mx-auto mb-1"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                             <p className="text-red-400 text-xs italic">Failed</p>
                        </div>
                     )}
                     {p.status === 'ready' && !p.generated_images?.url && (
                          <div className="text-center p-2">
                              <ImageIcon className="h-8 w-8 text-gray-500 mx-auto mb-1" />
                              <p className="text-gray-400 text-xs italic">No Image</p>
                          </div>
                     )}
                  </div>
                  <div className="flex-grow">
                     <p className="text-white font-medium mb-2 leading-snug">
                          {p.caption || <span className="italic text-gray-500">Generating caption...</span>}
                     </p>
                     <div className="flex justify-between items-center">
                         <p className="text-gray-500 text-xs">
                           {p.status === 'generating' ? 'Generating now' : `Generated: ${new Date(p.created_at).toLocaleString()}`}
                         </p>
                         {p.caption && p.status !== 'generating' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-white h-7 px-2"
                                onClick={() => handleCopyToClipboard(p.caption)}
                                title="Copy caption"
                            >
                               <ClipboardCopy className="h-4 w-4" />
                            </Button>
                          )}
                      </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </DashboardLayout>
  );
} 