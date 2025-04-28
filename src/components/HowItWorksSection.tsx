
const steps = [
  {
    number: "01",
    title: "Input Business Details",
    description: "Tell us about your business, target audience, and marketing goals. Our AI analyzes your information to create a personalized strategy."
  },
  {
    number: "02",
    title: "Competitor Research",
    description: "Our system automatically identifies and analyzes top-performing local competitors, extracting valuable insights to inform your strategy."
  },
  {
    number: "03",
    title: "Content Generation",
    description: "AI creates high-quality, hyper-local content including posts, captions, and graphics all tailored to your brand voice and audience."
  },
  {
    number: "04",
    title: "Smart Scheduling",
    description: "Your content is automatically scheduled to post at optimal times when your local audience is most active and engaged."
  },
  {
    number: "05",
    title: "Wide Distribution",
    description: "Content is distributed across multiple platforms and relevant local groups to maximize reach and engagement."
  },
  {
    number: "06",
    title: "Analytics & Optimization",
    description: "Track performance with unified metrics and receive AI-powered recommendations to continuously improve your marketing strategy."
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section-padding bg-gray-50">
      <div className="container px-6 mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
          <p className="mt-4 text-gray-600">
            Our streamlined process makes marketing automation simple and effective for your business.
          </p>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="flex flex-col animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center mb-4">
                <span className="text-4xl font-serif font-bold text-primary/20">{step.number}</span>
                <span className="ml-3 h-px flex-1 bg-primary/10"></span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
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
              <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md text-sm font-medium transition-colors">
                Get Started Now
              </button>
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
