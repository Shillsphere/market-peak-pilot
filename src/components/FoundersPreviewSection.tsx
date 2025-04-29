
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DiscoButton } from "@/components/ui/disco-button";

const FoundersPreviewSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Meet the Founders</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            The team behind Market Peak is dedicated to revolutionizing how local businesses approach marketing.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
          <div className="w-48 h-48 rounded-full overflow-hidden shadow-lg">
            <img 
              src="/lovable-uploads/6fa44a85-2488-40e1-a969-e1f63f5dd950.png" 
              alt="Harry Thomas, CEO" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-48 h-48 rounded-full overflow-hidden shadow-lg">
            <img 
              src="/lovable-uploads/4a8112d9-5772-45ce-a60e-17406cf7f3fd.png" 
              alt="Parker Wilson, CTO" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-48 h-48 rounded-full overflow-hidden shadow-lg">
            <img 
              src="/lovable-uploads/e581a9ae-1779-4c6e-b674-f148c99abe6b.png" 
              alt="Sarah Chen, COO" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="text-center">
          <Link to="/meet-the-founders">
            <DiscoButton size="lg" className="px-8 text-lg">
              Learn more <ArrowRight className="h-5 w-5 ml-2" />
            </DiscoButton>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FoundersPreviewSection;
