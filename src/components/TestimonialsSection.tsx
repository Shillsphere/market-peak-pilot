import { useState } from 'react';
import { Button } from '@/components/ui/button';
const testimonials = [{
  quote: "Market Peak has completely transformed our local marketing strategy. The AI-generated content is indistinguishable from what we'd pay an agency thousands for, and the local engagement has been phenomenal.",
  name: "Sarah Johnson",
  title: "Owner, Riverside Cafe",
  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80"
}, {
  quote: "The competitor research alone is worth the subscription. We discovered untapped local markets and optimized our content strategy based on what was already working in our area. Our engagement has tripled since implementing Market Peak.",
  name: "David Miller",
  title: "Marketing Manager, City Fitness",
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
}, {
  quote: "As a small business owner, I don't have time for marketing. Market Peak has been a game-changer—it's like having a full marketing team working for me 24/7. The ROI has been incredible.",
  name: "Michelle Wong",
  title: "Founder, Bloom Boutique",
  image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80"
}];
const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const nextTestimonial = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % testimonials.length);
  };
  const prevTestimonial = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };
  return <section id="testimonials" className="section-padding bg-gray-50">
      
    </section>;
};
export default TestimonialsSection;