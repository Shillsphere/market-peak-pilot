
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "$99",
    period: "per month",
    description: "Perfect for small local businesses just getting started with digital marketing.",
    features: [
      "Deep research on 5 competitors",
      "AI content generation (15 posts/mo)",
      "Platform-specific formatting",
      "Basic scheduling",
      "Single platform distribution",
      "Standard engagement metrics",
      "Email support"
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Growth",
    price: "$249",
    period: "per month",
    description: "Ideal for established businesses looking to expand their digital presence.",
    features: [
      "Deep research on 15 competitors",
      "AI content generation (50 posts/mo)",
      "Platform-specific formatting",
      "Smart scheduling with local analytics",
      "Multi-platform distribution",
      "Comprehensive engagement metrics",
      "Local Facebook groups targeting",
      "Priority support"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "$499",
    period: "per month",
    description: "Complete solution for businesses with advanced marketing needs.",
    features: [
      "Deep research on 30+ competitors",
      "Unlimited AI content generation",
      "Advanced platform-specific formatting",
      "Advanced smart scheduling",
      "Full cross-platform distribution",
      "Complete analytics suite",
      "Custom integrations",
      "Dedicated account manager"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

const PricingSection = () => {
  return (
    <section id="pricing" className="section-padding bg-gray-50">
      <div className="container px-6 mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-gray-600">
            Choose the perfect plan for your business needs. All plans include a 14-day free trial.
          </p>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg border ${
                plan.popular ? "border-primary shadow-lg relative" : "border-gray-200"
              } animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-primary text-white text-xs px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-semibold">{plan.price}</span>
                  <span className="ml-2 text-gray-600">{plan.period}</span>
                </div>
                <p className="mt-4 text-gray-600 text-sm">{plan.description}</p>
                
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="ml-3 text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`mt-8 w-full py-6 ${
                    plan.popular 
                      ? "bg-primary hover:bg-primary-dark text-white" 
                      : "bg-white border border-primary text-primary hover:bg-primary/10"
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Need a custom solution? <a href="#contact" className="text-primary font-medium hover:underline">Contact us</a> to discuss your specific needs.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
