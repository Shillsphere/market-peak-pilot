import { DiscoButton } from "@/components/ui/disco-button";
import { Link } from "react-router-dom";
const HowItWorksSection = () => {
  return <section id="how-it-works" className="section-padding bg-gray-50">
      <div className="container px-6 mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
          <p className="mt-4 text-gray-600">
            Our streamlined processes make marketing automation simple and effective for your business.
          </p>
          
          <div className="mt-8">
            <Link to="/how-it-works">
              <DiscoButton size="lg" className="font-medium text-lg">
                See Our Workflows
              </DiscoButton>
            </Link>
          </div>

          <div className="mt-16 max-w-3xl mx-auto">
            <img src="/lovable-uploads/27337f5d-ecf5-4d1b-8152-727ff0d4635d.png" alt="Sample workflow" className="max-w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300" />
          </div>
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
              
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HowItWorksSection;