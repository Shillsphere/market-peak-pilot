
import { Database, PenTool, Calendar, Share, Monitor, Users } from "lucide-react";

const features = [
  {
    icon: <Database className="h-8 w-8 text-primary" />,
    title: "AI Deep Research",
    description: "Crawls 20+ data points including SEO metrics, social media performance, and ad campaigns from your local competitors, giving you a competitive edge."
  },
  {
    icon: <PenTool className="h-8 w-8 text-primary" />,
    title: "Hyper-local Copywriter",
    description: "GPT-4o fine-tuned on SMB marketing best-practices creates compelling content tailored specifically to your business and local audience."
  },
  {
    icon: <Calendar className="h-8 w-8 text-primary" />,
    title: "Smart Scheduler",
    description: "BullMQ + Redis-powered scheduling system automatically posts your content at optimal engagement times based on local analytics."
  },
  {
    icon: <Share className="h-8 w-8 text-primary" />,
    title: "Cross-Platform Distribution",
    description: "Automatically distributes your content across all relevant platforms and local Facebook groups for maximum reach."
  },
  {
    icon: <Monitor className="h-8 w-8 text-primary" />,
    title: "Unified Metrics Dashboard",
    description: "Consolidates engagement metrics across all platforms, providing a comprehensive view of your marketing performance."
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Business-level Security",
    description: "Supabase RLS keeps each business's data completely isolated and secure, ensuring privacy and protection for your marketing strategy."
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="section-padding bg-[#FFFBF6]">
      <div className="container px-6 mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">Powered by AI, Built for Results</h2>
          <p className="mt-4 text-gray-600">
            Our platform combines advanced AI technology with hyper-local marketing strategies to deliver exceptional results for your business.
          </p>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
