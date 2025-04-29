
import { Button } from "@/components/ui/button";

const workflows = [
  {
    title: "How Competitor Deep Research Works",
    image: "/lovable-uploads/28f1f2ec-f8ed-4af2-8815-b735ab3655da.png",
    alt: "Competitor research workflow showing steps: Add Rivals, Enter Goal, Crawl Google, Crawl Yelp, Insights Board, and Gap Detection"
  },
  {
    title: "How Content Creation Works",
    image: "/lovable-uploads/e581a9ae-1779-4c6e-b674-f148c99abe6b.png",
    alt: "Content creation workflow showing steps: Enter Prompt, Generate Ideas, Write Content, Visual Design, and Export to Distribution"
  },
  {
    title: "How mktpk Content Distribution Works",
    image: "/lovable-uploads/8a684c6f-e0a8-4888-84bf-e91e357d32b8.png",
    alt: "Content distribution workflow showing steps: Paste Content, Pick Channels, Schedule Send, Hyperpush Blast, Track Buzz, and Auto Boost"
  },
  {
    title: "How mktpk General AI Agent Works",
    image: "/lovable-uploads/e0f970a4-0873-415a-a07e-f01329d659a1.png",
    alt: "General AI agent workflow showing steps: Ask Anything, Smart Reasoning, Toolbox Calls, Fact Fusion, Trend Highlights, and Clear Answers"
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section-padding bg-gray-50">
      <div className="container px-6 mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
          <p className="mt-4 text-gray-600">
            Our streamlined processes make marketing automation simple and effective for your business.
          </p>
        </div>
        
        <div className="mt-16 space-y-20">
          {workflows.map((workflow, index) => (
            <div 
              key={index} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">{workflow.title}</h3>
              <div className="flex justify-center">
                <img 
                  src={workflow.image} 
                  alt={workflow.alt} 
                  className="max-w-full rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-20 bg-white border border-gray-100 rounded-lg p-8 shadow-md max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2">
              <h3 className="text-2xl font-bold mb-4">Ready to automate your marketing?</h3>
              <p className="text-gray-600 mb-6">
                Get started today and see how Market Peak can transform your business's local marketing strategy.
              </p>
              <Button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md text-sm font-medium transition-colors">
                Get Started Now
              </Button>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
              <img 
                src="/lovable-uploads/0976d68e-b841-4176-bf57-0db9f2c318cd.png" 
                alt="Market Peak Dashboard" 
                className="w-full max-w-xs rounded-lg shadow-lg" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
