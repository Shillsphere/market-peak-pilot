import { useState } from "react";
import { Check, Info } from "lucide-react";
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
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Local Launch",
    priceMonthly: "$99",
    priceYearly: "$1,089",
    period: "per month",
    periodYearly: "per year",
    yearlyNote: "1 month free when billed yearly",
    description: "Content gen + hyper-local insights",
    features: [
      {
        text: "Access to content/video creation",
        icon: "🤖"
      },
      {
        text: "Competitor and market deep research",
        icon: "🗺️"
      },
      {
        text: "General AI agent (great for most tasks)",
        icon: "📊"
      },
      {
        text: "More coming soon...",
        icon: "🔍"
      }
    ],
    cta: "Start Free Trial",
    ctaAction: "modal",
    ctaTarget: "start-launch",
    popular: false
  },
  {
    name: "Automation Partner",
    priceMonthly: "$299",
    priceYearly: "$3,289",
    period: "per month",
    periodYearly: "per year",
    yearlyNote: "1 month free when billed yearly",
    onboarding: "+ $750 one-time onboarding fee (always applies)",
    description: "Custom AI agents & full CRM automation",
    features: [
      {
        text: "Everything in Local Launch",
        icon: "🤖"
      },
      {
        text: "Custom AI agents for your specific needs (CRM, etc.)",
        icon: "🗺️"
      },
      {
        text: "Automated email & SMS campaigns",
        icon: "📊"
      },
      {
        text: "Monthly 30-min strategy call",
        icon: "📞"
      },
      {
        text: "Priority chat support (≤ 5 users)",
        icon: "💬"
      }
    ],
    cta: "Get 1 Month Free",
    ctaAction: "scroll",
    ctaTarget: "strategy-cal",
    popular: true
  },
  {
    name: "Fractional CMO",
    priceMonthly: "Quote",
    priceYearly: "",
    period: "",
    periodYearly: "",
    yearlyNote: "",
    description: "Enterprise-grade AI & on-site strategy",
    features: [
      {
        text: "Everything in Automation Partner",
        icon: "🤖"
      },
      {
        text: "Advanced ads on autopilot",
        icon: "🗺️"
      },
      {
        text: "Advanced competitor maps",
        icon: "📊"
      },
      {
        text: "Quarterly on-site workshop",
        icon: "🤝"
      },
      {
        text: "Book a call",
        icon: "👥"
      }
    ],
    cta: "Talk to an Expert",
    ctaAction: "navigate",
    ctaTarget: "/contact?plan=fcm",
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
          <h2 className="text-3xl md:text-4xl font-bold text-[#1C1C1C]">AI Agents + Human Strategists = Hands-Free Growth</h2>
          <p className="mt-4 text-[#333]">
            From turnkey content to fully-custom CRM workflows, choose the level of automation that fits your business.
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
                Yearly <span className="text-xs font-medium ml-1 text-[#5F42FF]">(1 month free)</span>
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
              className={`bg-gradient-to-b from-[#F9F9FF] to-white rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] ${
                plan.popular ? "border-[#5F42FF] shadow-lg relative" : "border-gray-200"
              } animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-[#5F42FF] text-white text-xs px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              
              <CardHeader className="p-8">
                <h3 className="text-xl font-bold text-[#1C1C1C]">{plan.name}</h3>
                <div className="mt-4">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-semibold text-[#1C1C1C]">
                      {billingInterval === "yearly" && plan.priceYearly ? plan.priceYearly : plan.priceMonthly}
                    </span>
                    {(billingInterval === "yearly" ? 
                      (plan.periodYearly && <span className="ml-2 text-[#333]">{plan.periodYearly}</span>) : 
                      (plan.period && <span className="ml-2 text-[#333]">{plan.period}</span>)
                    )}
                  </div>
                  {billingInterval === "yearly" && plan.yearlyNote && (
                    <p className="text-sm text-[#777] mt-1">{plan.yearlyNote}</p>
                  )}
                  {plan.onboarding && (
                    <p className="text-sm text-[#777] mt-1">{plan.onboarding}</p>
                  )}
                </div>
                <p className="mt-4 text-[#333] text-sm font-medium">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="px-8 pt-0">
                <ul className="space-y-3">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      <span className="h-5 w-5 text-[#5F42FF] flex-shrink-0 mt-0.5">{feature.icon}</span>
                      <span className="ml-3 text-[#333] text-sm" dangerouslySetInnerHTML={{ __html: feature.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="px-8 pt-4 pb-8">
                {plan.name === "Fractional CMO" ? (
                  <Button 
                    className={`w-full py-6 bg-white border border-[#5F42FF] text-[#5F42FF] hover:bg-[#5F42FF]/10`}
                    asChild
                    aria-label={`${plan.cta} for the ${plan.name} plan`}
                  >
                    <a 
                      href={plan.ctaTarget}
                      id={`cta-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
                      data-gtm="pricing_contact_click"
                    >
                      {plan.cta}
                    </a>
                  </Button>
                ) : plan.name === "Automation Partner" ? (
                  <DiscoButton 
                    className="w-full py-6 bg-[#5F42FF] text-white hover:bg-[#5F42FF]/90"
                    aria-label={`${plan.cta} for the ${plan.name} plan`}
                  >
                    <a href="#strategy-cal" id={`cta-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      {plan.cta}
                    </a>
                  </DiscoButton>
                ) : (
                  <Button 
                    className={`w-full py-6 bg-white border border-[#5F42FF] text-[#5F42FF] hover:bg-[#5F42FF]/10`}
                    aria-label={`${plan.cta} for the ${plan.name} plan`}
                  >
                    {plan.cta}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* Promo banner */}
        <div className="mt-8 bg-[#5F42FF] text-white p-3 rounded-md text-center text-sm md:text-base">
          <strong>Early-adopter offer:</strong> sign up for Automation Partner before July 31 2025 and your first month is free.
        </div>
        
        {/* Footnotes */}
        <div className="mt-4 text-center text-[11px] text-[#777]">
          <p>*Onboarding fee covers custom workflow build-out and CRM integration.</p>
          <p>All automations run on our private infrastructure—no license fees, ever.</p>
        </div>
        
        {/* Free Audit Section */}
        <div id="free-audit" className="mt-24 bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1C]">Free 3-Minute Marketing Health Check</h2>
            <p className="mt-4 text-[#333]">
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
                <Button type="submit" className="w-full md:w-auto bg-[#5F42FF] hover:bg-[#5F42FF]/90">Run My Free Audit</Button>
              </form>
            </Form>
          </div>
        </div>
        
        {/* Calendly section for Automation Partner */}
        <div id="strategy-cal" className="mt-16 scroll-mt-20">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-6 text-[#1C1C1C]">Schedule Your Strategy Call</h3>
            <p className="text-center text-[#333] mb-8">
              Let's discuss how our Automation Partner plan can help grow your business. 
              Choose a time that works for you and we'll give you a call.
            </p>
            <div className="h-[600px] bg-gray-100 flex items-center justify-center">
              <p className="text-gray-500">Calendly embed will appear here</p>
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-6 text-[#1C1C1C]">Frequently Asked Questions</h3>
          <Accordion type="single" collapsible className="bg-white rounded-lg border border-gray-200 p-6">
            <AccordionItem value="billing">
              <AccordionTrigger className="text-[#1C1C1C]">How does billing work?</AccordionTrigger>
              <AccordionContent className="text-[#333]">
                You can choose between monthly or yearly billing. Yearly plans are discounted by giving you one month free. 
                All plans start with a 7-day free trial, and you won't be charged until your trial ends. 
                You can upgrade, downgrade, or cancel at any time.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cancel">
              <AccordionTrigger className="text-[#1C1C1C]">Can I cancel anytime?</AccordionTrigger>
              <AccordionContent className="text-[#333]">
                Yes, you can cancel your subscription at any time. When you cancel, your plan will 
                remain active until the end of your current billing period, but you won't be charged again.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="privacy">
              <AccordionTrigger className="text-[#1C1C1C]">How is my data protected?</AccordionTrigger>
              <AccordionContent className="text-[#333]">
                We take data privacy seriously. All your business data is encrypted and stored securely. 
                We never share or sell your information with third parties. You can request to export or 
                delete your data at any time through your account settings.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="support">
              <AccordionTrigger className="text-[#1C1C1C]">What support channels are available?</AccordionTrigger>
              <AccordionContent className="text-[#333]">
                The Local Launch plan includes email support and community forum access. The Automation Partner 
                plan adds priority chat support and a dedicated Slack channel. Fractional CMO customers receive 
                phone support with a 1-day SLA, plus quarterly on-site workshops with our team.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-[#333]">
            Need a custom solution? <a href="#contact" className="text-[#5F42FF] font-medium hover:underline">Contact us</a> to discuss your specific needs.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
