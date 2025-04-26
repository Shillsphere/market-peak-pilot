
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-white to-gray-50">
      <div className="container px-6 mx-auto">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl">
            <span className="block">Leave it to</span> 
            <span className="text-primary">Market Peak</span>
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl">
            Automate your entire marketing workflow with AI-powered competitor research, 
            content creation, and hyper-local distribution—all tailored to your business context.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary-dark text-white px-8 py-6 rounded-md text-base">
              Start Free Trial
              <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 px-8 py-6 rounded-md text-base">
              Watch Demo
            </Button>
          </div>
          
          <div className="mt-12 md:mt-16 relative w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80" 
                alt="MarketingonAutoPilot Dashboard" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 rounded-lg"></div>
            </div>
          </div>
          
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
            <div className="flex flex-col items-center">
              <p className="text-3xl font-bold text-primary">97%</p>
              <p className="text-sm text-gray-600 mt-2">Time Saved</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-3xl font-bold text-primary">3.5x</p>
              <p className="text-sm text-gray-600 mt-2">Engagement</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-3xl font-bold text-primary">20+</p>
              <p className="text-sm text-gray-600 mt-2">Data Points</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-3xl font-bold text-primary">4.9/5</p>
              <p className="text-sm text-gray-600 mt-2">User Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
