
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building, Phone, User, Mail, Briefcase, MapPin } from 'lucide-react';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Define the form schema with validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  industry: z.string().optional(),
  locations: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const StrategyCallPage = () => {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      companyName: "",
      industry: "",
      locations: "",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    
    // In a real application, this would send the data to your backend
    // For now, we'll just show a success toast
    toast({
      title: "Booking request submitted",
      description: "We'll reach out to you shortly to confirm your strategy call.",
    });
    
    // Reset form after submission
    form.reset();
    
    // This would typically redirect to a confirmation page
    // For now, we'll just scroll to the calendly embed
    const calendlySection = document.getElementById('calendly-embed');
    if (calendlySection) {
      calendlySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Navigation Bar - Matches Dashboard Style */}
      <nav className="bg-[#111111] border-b border-gray-800 px-4 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img 
              src="/lovable-uploads/8b96431b-d832-42d1-aaf7-1caaf5e13c2e.png" 
              alt="MarketPeak Logo" 
              className="h-8 invert"
            />
          </a>
          <div>
            <Button variant="outline" asChild className="mr-2 text-black border-gray-700 hover:bg-gray-800 hover:text-white">
              <a href="/">Return to Home</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Book Your Strategy Call</h1>
            <p className="text-lg text-gray-300">Schedule a personalized consultation with our AI marketing strategists to discuss your multi-location growth plan.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Booking Form */}
            <Card className="bg-[#1A1A1A] border-gray-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Your Information</CardTitle>
                <CardDescription>We need a few details to prepare for your call</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input className="pl-10 bg-[#222222] border-gray-700" placeholder="Your name" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input 
                                className="pl-10 bg-[#222222] border-gray-700" 
                                placeholder="your.email@example.com" 
                                type="email" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input 
                                className="pl-10 bg-[#222222] border-gray-700" 
                                placeholder="(555) 123-4567" 
                                type="tel" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Company Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input className="pl-10 bg-[#222222] border-gray-700" placeholder="Your business name" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Industry</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input className="pl-10 bg-[#222222] border-gray-700" placeholder="e.g. Restaurants" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="locations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Number of Locations</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input className="pl-10 bg-[#222222] border-gray-700" placeholder="e.g. 3" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full mt-6">Continue to Schedule</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            {/* Calendly Section */}
            <div id="calendly-embed" className="bg-[#1A1A1A] border border-gray-800 rounded-lg p-6 shadow-xl">
              <h3 className="text-xl font-semibold text-white mb-4">Select a Time</h3>
              <p className="text-gray-300 mb-6">Choose a convenient time for your 30-minute strategy session with our team.</p>
              
              {/* This is a placeholder for where a real Calendly embed would go */}
              <div className="bg-[#222222] border border-gray-700 rounded-lg p-4 text-center h-[400px] flex flex-col items-center justify-center">
                <p className="text-gray-400 mb-4">Calendly integration would appear here.</p>
                <p className="text-gray-400 mb-4">In production, this would include a live calendar widget for scheduling.</p>
                <Button variant="outline" className="mt-4">Select Available Time Slot</Button>
                
                {/* In a real implementation, you would add the Calendly embed script like: */}
                {/* 
                <div className="calendly-inline-widget" 
                     data-url="https://calendly.com/yourcompany/strategy-session" 
                     style={{minWidth: '320px', height: '400px'}}></div>
                */}
              </div>
            </div>
          </div>
          
          {/* What to Expect */}
          <Card className="mt-12 bg-[#1A1A1A] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">What to Expect</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 border border-gray-800 rounded-lg bg-[#222222]">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-primary text-xl">1</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Discovery Call</h3>
                  <p className="text-gray-400 text-sm">30-minute consultation to understand your business needs and marketing challenges.</p>
                </div>
                
                <div className="p-4 border border-gray-800 rounded-lg bg-[#222222]">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-primary text-xl">2</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Customized Proposal</h3>
                  <p className="text-gray-400 text-sm">Receive a tailored plan for your multi-location business within 48 hours.</p>
                </div>
                
                <div className="p-4 border border-gray-800 rounded-lg bg-[#222222]">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-primary text-xl">3</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Implementation</h3>
                  <p className="text-gray-400 text-sm">Fast onboarding and AI strategy workshops to get your marketing automation running.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StrategyCallPage;
