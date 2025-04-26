
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    quote: "Market Peak has completely transformed our local marketing strategy. The AI-generated content is indistinguishable from what we'd pay an agency thousands for, and the local engagement has been phenomenal.",
    name: "Sarah Johnson",
    title: "Owner, Riverside Cafe",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80"
  },
  {
    quote: "The competitor research alone is worth the subscription. We discovered untapped local markets and optimized our content strategy based on what was already working in our area. Our engagement has tripled since implementing Market Peak.",
    name: "David Miller",
    title: "Marketing Manager, City Fitness",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
  },
  {
    quote: "As a small business owner, I don't have time for marketing. Market Peak has been a game-changer—it's like having a full marketing team working for me 24/7. The ROI has been incredible.",
    name: "Michelle Wong",
    title: "Founder, Bloom Boutique",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80"
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="section-padding bg-white">
      <div className="container px-6 mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">What Our Clients Say</h2>
          <p className="mt-4 text-gray-600">
            Businesses across industries are seeing real results with Market Peak.
          </p>
        </div>
        
        <div className="mt-16 md:mt-20 max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 relative">
            <svg className="absolute top-4 left-4 md:top-8 md:left-8 w-16 h-16 text-primary opacity-10" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            
            <div className="relative z-10">
              <p className="text-xl md:text-2xl font-serif italic text-gray-800 mb-8">
                "{testimonials[currentIndex].quote}"
              </p>
              <div className="flex items-center">
                <img 
                  src={testimonials[currentIndex].image} 
                  alt={testimonials[currentIndex].name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="font-semibold">{testimonials[currentIndex].name}</h4>
                  <p className="text-sm text-gray-600">{testimonials[currentIndex].title}</p>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-8 right-8 flex space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={prevTestimonial}
              >
                ←
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={nextTestimonial}
              >
                →
              </Button>
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full ${
                  currentIndex === index ? "bg-primary w-8" : "bg-gray-300 w-4"
                } transition-all duration-300 ease-in-out`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
