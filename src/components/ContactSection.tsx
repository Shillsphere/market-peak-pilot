import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DiscoButton } from "@/components/ui/disco-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageCircle, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit form data to Supabase
      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          { 
            name: formData.name,
            email: formData.email,
            company: formData.company || null,
            message: formData.message
          }
        ]);

      if (error) throw error;

      // Log the successful submission
      console.log("Form submitted to Supabase:", formData);

      // Reset the form and show success message
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        company: "",
        message: ""
      });

      // Show toast notification
      toast({
        title: "Message sent",
        description: "Thank you! We've received your message and will be in touch soon.",
      });

      // Reset success message after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
      
      // Show error toast
      toast({
        title: "Error sending message",
        description: "There was a problem sending your message. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return <section id="contact" className="section-padding bg-[#FFFBF6]">
      <div className="container px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">Get in Touch</h2>
            <p className="mt-4 text-gray-600">
              Have questions about Market Peak or want to learn more about how we can help your business? Reach out to our team.
            </p>
            
            <div className="mt-8 space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Email</h3>
                  <p className="mt-1 text-gray-600">mktpk2@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Live Chat</h3>
                  <p className="mt-1 text-gray-600">Available Monday-Saturday, 9am-5pm PT</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Link className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Follow Us</h3>
                  <div className="mt-1 flex space-x-4">
                    <a href="#" className="text-gray-600 hover:text-primary">X</a>
                    <a href="#" className="text-gray-600 hover:text-primary">LinkedIn</a>
                    <a href="#" className="text-gray-600 hover:text-primary">Facebook</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-8 shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold mb-6">Send us a message</h3>
            
            {isSubmitted ? <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                <p className="text-green-700">Thank you for your message! We'll be in touch soon.</p>
              </div> : <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="block text-gray-700">Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required className="mt-1 border-gray-200 focus:border-primary focus:ring-primary" />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="block text-gray-700">Email</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required className="mt-1 border-gray-200 focus:border-primary focus:ring-primary" />
                  </div>
                  
                  <div>
                    <Label htmlFor="company" className="block text-gray-700">Company</Label>
                    <Input id="company" name="company" value={formData.company} onChange={handleChange} placeholder="Your company" className="mt-1 border-gray-200 focus:border-primary focus:ring-primary" />
                  </div>
                  
                  <div>
                    <Label htmlFor="message" className="block text-gray-700">Message</Label>
                    <Textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="How can we help you?" required className="mt-1 min-h-[120px] border-gray-200 focus:border-primary focus:ring-primary" />
                  </div>
                  
                  <DiscoButton type="submit" className="w-full bg-primary hover:bg-primary-dark text-white" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </DiscoButton>
                </div>
              </form>}
          </div>
        </div>
      </div>
    </section>;
};
export default ContactSection;
