import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiscoButton } from "@/components/ui/disco-button";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";

const plans = [
  {
    name: "Solo Builder",
    priceMonthly: "$69",
    priceYearly: "$59",
    period: "per month",
    yearlyNote: "when billed yearly",
    description: "Perfect for individual entrepreneurs and small businesses just getting started with AI marketing.",
    features: [
      {
        text: "Generate 20 AI posts per month",
        icon: "🤖"
      },
      {
        text: "1-click post to 1 platform",
        icon: "🗺️"
      },
      {
        text: "Monthly Competitor Snapshot",
        icon: "📊"
      },
      {
        text: "Standard engagement analytics",
        icon: "📊"
      },
      {
        text: "Email + community forum support",
        icon: "🤖"
      },
      {
        text: "1 user",
        icon: "🗺️"
      }
    ],
    cta: "Start 7-Day Trial",
    popular: false
  },
  {
    name: "Neighborhood Growth",
    priceMonthly: "$179",
    priceYearly: "$159",
    period: "per month",
    yearlyNote: "when billed yearly",
    description: "Ideal for established local businesses looking to grow their digital presence and outperform competitors.",
    features: [
      {
        text: "Unlimited AI posts + video-script generator",
        icon: "🤖"
      },
      {
        text: "Scheduler to FB, IG, GMB, TikTok",
        icon: "🗺️"
      },
      {
        text: "LocalPulse™ live dashboard (foot-traffic & search trends)",
        icon: "🗺️"
      },
      {
        text: "Comprehensive analytics export",
        icon: "📊"
      },
      {
        text: "Heatmap vs 3 competitors",
        icon: "🗺️"
      },
      {
        text: "Priority chat support | up to 5 users",
        icon: "📊"
      }
    ],
    cta: "Start 7-Day Trial",
    popular: true
  },
  {
    name: "Multi-Location Pro",
    priceMonthly: "$399",
    priceYearly: "$349",
    period: "per month",
    yearlyNote: "when billed yearly",
    description: "Complete marketing solution for multi-location businesses with dedicated AI strategy and unlimited features. Perfect for single‑location businesses, chains, or agencies that want dedicated AI‑strategy support.",
    locationText: "(covers first 3 locations)",
    features: [
      {
        text: "All software features unlimited",
        icon: "🤖"
      },
      {
        text: "Dedicated AI strategist + quarterly on-site workshops",
        icon: "🤖"
      },
      {
        text: "Custom workflow design (Zapier, API, POS)",
        icon: "🗺️"
      },
      {
        text: "Advanced paid-ads autopilot (FB/IG + SMS)",
        icon: "🗺️"
      },
      {
        text: "Unlimited users | phone & 1-day SLA",
        icon: "📊"
      },
      {
        text: "Optional on-site days (rate card)",
        icon: "📊"
      }
    ],
    cta: "Book Strategy Call",
    popular: false
  }
];

const formSchema = z.object({
  business: z.string().min(2, {
    message: "Business name must be at least 2 characters.",
  }),
  zip: z.string().min(5, {
    message: "Please enter a valid ZIP code.",
  }).max(5),
  social: z.string().url({
    message: "Please enter a valid URL.",
  }),
});

const PricingSection = () => {
  const [billingInterval, setBillingInterval] = useState("yearly");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      business: "",
      zip: "",
      social: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // This would normally send to an API endpoint
    console.log(values);
    toast({
      title: "Audit request submitted!",
      description: "We'll email your free marketing health check shortly.",
    });
    
    // Reset the form
    form.reset();
  }
  
  return (
    <section id="pricing" className="section-padding bg-gray-50">
      <div className="container px-6 mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-gray-600">
            Choose the perfect plan for your business needs. All plans include a 7-day free trial.
          </p>
          
          {/* Billing toggle */}
          <div className="mt-8 flex justify-center items-center">
            <ToggleGroup 
              type="single" 
              value={billingInterval}
              onValueChange={(value) => {
                if (value) setBillingInterval(value);
              }}
              className="bg-white border rounded-md p-1"
            >
              <ToggleGroupItem value="yearly" aria-label="Yearly billing">
                Yearly <span className="text-xs font-medium ml-1 text-primary">(Save 15%)</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="monthly" aria-label="Monthly billing">
                Monthly
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`bg-white ${
                plan.popular ? "border-primary shadow-lg relative" : "border-gray-200"
              } animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-primary text-white text-xs px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              
              <CardHeader className="p-8">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-4">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-semibold">
                      {billingInterval === "yearly" ? plan.priceYearly : plan.priceMonthly}
                    </span>
                    <span className="ml-2 text-gray-600">{plan.period}</span>
                  </div>
                  {billingInterval === "yearly" && (
                    <p className="text-sm text-gray-500 mt-1">{plan.yearlyNote}</p>
                  )}
                  {plan.locationText && (
                    <p className="text-sm text-gray-500 mt-1">{plan.locationText}</p>
                  )}
                </div>
                <p className="mt-4 text-gray-600 text-sm">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="px-8 pt-0">
                <ul className="space-y-3">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      <span className="h-5 w-5 text-primary flex-shrink-0 mt-0.5">{feature.icon}</span>
                      <span className="ml-3 text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: feature.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="px-8 pt-4 pb-8">
                {plan.popular ? (
                  <DiscoButton 
                    className="w-full py-6"
                  >
                    {plan.cta}
                  </DiscoButton>
                ) : (
                  <Button 
                    className={`w-full py-6 bg-white border border-primary text-primary hover:bg-primary/10`}
                  >
                    {plan.cta}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* Free Audit Section */}
        <div id="free-audit" className="mt-24 bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold">Free 3-Minute Marketing Health Check</h2>
            <p className="mt-4 text-gray-600">
              See your social reach, get 3 AI post ideas, and benchmark against local rivals—no credit card required.
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4 md:flex md:space-y-0 md:space-x-4 max-w-2xl mx-auto">
                <FormField
                  control={form.control}
                  name="business"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Business name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem className="md:w-32">
                      <FormControl>
                        <Input placeholder="ZIP code" maxLength={5} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="social"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Main social link" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full md:w-auto">Run My Free Audit</Button>
              </form>
            </Form>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h3>
          <Accordion type="single" collapsible className="bg-white rounded-lg border border-gray-200 p-6">
            <AccordionItem value="billing">
              <AccordionTrigger>How does billing work?</AccordionTrigger>
              <AccordionContent>
                You can choose between monthly or yearly billing. Yearly plans are discounted by 15%. 
                All plans start with a 7-day free trial, and you won't be charged until your trial ends. 
                You can upgrade, downgrade, or cancel at any time.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cancel">
              <AccordionTrigger>Can I cancel anytime?</AccordionTrigger>
              <AccordionContent>
                Yes, you can cancel your subscription at any time. When you cancel, your plan will 
                remain active until the end of your current billing period, but you won't be charged again.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="privacy">
              <AccordionTrigger>How is my data protected?</AccordionTrigger>
              <AccordionContent>
                We take data privacy seriously. All your business data is encrypted and stored securely. 
                We never share or sell your information with third parties. You can request to export or 
                delete your data at any time through your account settings.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="support">
              <AccordionTrigger>What support channels are available?</AccordionTrigger>
              <AccordionContent>
                The Solo Builder plan includes email support and community forum access. The Neighborhood Growth 
                plan adds priority chat support. Multi-Location Pro customers receive phone support with a 1-day SLA, 
                plus quarterly on-site workshops with our team.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
