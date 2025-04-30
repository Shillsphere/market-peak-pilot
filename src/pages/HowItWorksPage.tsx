
import { DiscoButton } from "@/components/ui/disco-button";
import Navbar from "@/components/Navbar";

const workflows = [
  {
    subtitle: "Analyze competitors and find actionable opportunities",
    image: "/lovable-uploads/27337f5d-ecf5-4d1b-8152-727ff0d4635d.png",
    alt: "Competitor research workflow showing steps: Add Rivals, Enter Goal, Crawl Google, Crawl Yelp, Insights Board, and Gap Detection",
    outputs: ["Competitive Insights", "Actionable Gaps", "Updated Plan"]
  },
  {
    subtitle: "Transform ideas into engaging content with AI assistance",
    image: "/lovable-uploads/88c819fb-9d1c-43b1-bedc-69f70a3fafec.png",
    alt: "Content creation workflow showing steps: Enter Prompt, Generate Ideas, Write Content, Visual Design, and Export to Distribution",
    outputs: ["Engaging Post", "Ready Assets"]
  },
  {
    subtitle: "Distribute content across multiple channels intelligently",
    image: "/lovable-uploads/43142f5f-6a99-4304-b444-3f3d7638cdf2.png",
    alt: "Content distribution workflow showing steps: Paste Content, Pick Channels, Schedule Send, Hyperpush Blast, Track Buzz, and Auto Boost",
    outputs: ["Multi-Channel Reach", "Performance Boost"]
  },
  {
    subtitle: "Get instant answers and insights with AI agent technology",
    image: "/lovable-uploads/e1a417cd-38b2-4ef5-b31c-3c85a7d3ee99.png",
    alt: "General AI agent workflow showing steps: Ask Anything, Smart Reasoning, Toolbox Calls, Fact Fusion, Trend Highlights, and Clear Answers",
    outputs: ["Instant Answers", "Market Trends"]
  }
];

const HowItWorksPage = () => {
  return (
    <>
      <Navbar />
      <div className="pt-36 pb-16 bg-gray-50 min-h-screen">
        <div className="container px-6 mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold">How It Works</h1>
            <p className="mt-4 text-gray-600">
              Our streamlined processes make marketing automation simple and effective for your business.
            </p>
          </div>
          
          <div className="mt-16 space-y-24">
            {workflows.map((workflow, index) => (
              <div 
                key={index} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="max-w-4xl mx-auto">
                  <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">{workflow.subtitle}</p>
                  
                  <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <img 
                      src={workflow.image} 
                      alt={workflow.alt} 
                      className="max-w-full rounded-lg w-full"
                    />
                  </div>
                  
                  {workflow.outputs && workflow.outputs.length > 0 && (
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                      {workflow.outputs.map((output, idx) => (
                        <span 
                          key={idx} 
                          className="inline-block bg-primary bg-opacity-10 text-primary-dark px-4 py-2 rounded-full text-sm font-medium"
                        >
                          {output}
                        </span>
                      ))}
                    </div>
                  )}
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
                <DiscoButton>
                  Get Started Now
                </DiscoButton>
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
      </div>
    </>
  );
};

export default HowItWorksPage;
