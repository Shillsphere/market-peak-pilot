import { Database, PenTool, Calendar, Share, Monitor, Users } from "lucide-react";
const features = [{
  icon: <Database className="h-8 w-8 text-primary" />,
  title: "AI Deep Research",
  description: "Crawls 20+ data points including SEO metrics, social media performance, and ad campaigns from your local competitors, giving you a competitive edge."
}, {
  icon: <PenTool className="h-8 w-8 text-primary" />,
  title: "Hyper-local Copywriter",
  description: "GPT-4o fine-tuned on SMB marketing best-practices creates compelling content tailored specifically to your business and local audience."
}, {
  icon: <Calendar className="h-8 w-8 text-primary" />,
  title: "Smart Scheduler",
  description: "BullMQ + Redis-powered scheduling system automatically posts your content at optimal engagement times based on local analytics."
}, {
  icon: <Share className="h-8 w-8 text-primary" />,
  title: "Cross-Platform Distribution",
  description: "Automatically distributes your content across all relevant platforms and local Facebook groups for maximum reach."
}, {
  icon: <Monitor className="h-8 w-8 text-primary" />,
  title: "Unified Metrics Dashboard",
  description: "Consolidates engagement metrics across all platforms, providing a comprehensive view of your marketing performance."
}, {
  icon: <Users className="h-8 w-8 text-primary" />,
  title: "Business-level Security",
  description: "Supabase RLS keeps each business's data completely isolated and secure, ensuring privacy and protection for your marketing strategy."
}];
const FeaturesSection = () => {
  return <section id="features" className="section-padding bg-[#FFFBF6]">
      
    </section>;
};
export default FeaturesSection;