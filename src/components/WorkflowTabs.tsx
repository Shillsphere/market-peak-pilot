
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const workflows = [
  {
    id: "research",
    title: "Competitor Research",
    description: "Our AI automatically identifies and analyzes top-performing local competitors to extract valuable insights.",
    image: "/lovable-uploads/70f5f90e-6486-4267-a935-8c0cb679866d.png"
  },
  {
    id: "content",
    title: "Content Generation",
    description: "AI creates optimized, hyper-local content tailored to your brand voice and audience preferences.",
    image: "/lovable-uploads/de32dc77-2e05-4d1c-8f50-b1e812949477.png"
  },
  {
    id: "scheduling",
    title: "Smart Scheduling",
    description: "Content is automatically scheduled to post at times when your local audience is most active and engaged.",
    image: "/lovable-uploads/0976d68e-b841-4176-bf57-0db9f2c318cd.png"
  },
  {
    id: "analytics",
    title: "Performance Analytics",
    description: "Track unified metrics across platforms and receive AI-powered recommendations for strategy improvements.",
    image: "/lovable-uploads/8b96431b-d832-42d1-aaf7-1caaf5e13c2e.png"
  }
];

const WorkflowTabs = () => {
  const [activeTab, setActiveTab] = useState("research");

  return (
    <div className="mt-20 animate-fade-in">
      <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">See Our Platform in Action</h3>
      
      <Tabs 
        defaultValue="research" 
        value={activeTab}
        onValueChange={setActiveTab} 
        className="w-full max-w-5xl mx-auto"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-100 p-1 rounded-lg mb-8">
          {workflows.map((workflow) => (
            <TabsTrigger 
              key={workflow.id} 
              value={workflow.id}
              className={`
                text-sm md:text-base py-3 font-medium
                data-[state=active]:bg-white data-[state=active]:text-primary
                transition-all duration-300
              `}
            >
              {workflow.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {workflows.map((workflow) => (
          <TabsContent 
            key={workflow.id} 
            value={workflow.id}
            className={`${activeTab === workflow.id ? 'animate-fade-in' : ''}`}
          >
            <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col">
                  <div className="p-6 md:p-8">
                    <h4 className="text-xl font-semibold mb-2">{workflow.title}</h4>
                    <p className="text-gray-600">{workflow.description}</p>
                  </div>
                  <div className="relative overflow-hidden rounded-b-lg bg-gradient-to-b from-gray-50 to-white">
                    <img 
                      src={workflow.image} 
                      alt={`${workflow.title} workflow diagram`} 
                      className="w-full object-contain rounded-b-lg shadow-inner"
                      style={{ maxHeight: '500px' }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default WorkflowTabs;
