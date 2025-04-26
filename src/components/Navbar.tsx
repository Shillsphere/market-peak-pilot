
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white py-4 px-6 md:px-10 border-b border-gray-100 fixed w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/8b96431b-d832-42d1-aaf7-1caaf5e13c2e.png" 
              alt="mktpk logo" 
              className="h-12 sm:h-16"
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-600 hover:text-primary text-sm font-medium">Features</a>
          <a href="#how-it-works" className="text-gray-600 hover:text-primary text-sm font-medium">How It Works</a>
          <a href="#testimonials" className="text-gray-600 hover:text-primary text-sm font-medium">Testimonials</a>
          <a href="#pricing" className="text-gray-600 hover:text-primary text-sm font-medium">Pricing</a>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white transition-colors">
            Log in
          </Button>
          <Button className="bg-primary text-white hover:bg-primary-dark">
            Get Started
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="flex flex-col px-6 py-4 gap-4">
            <a 
              href="#features" 
              className="text-gray-600 hover:text-primary py-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="text-gray-600 hover:text-primary py-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </a>
            <a 
              href="#testimonials" 
              className="text-gray-600 hover:text-primary py-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonials
            </a>
            <a 
              href="#pricing" 
              className="text-gray-600 hover:text-primary py-2 text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white w-full justify-center">
                Log in
              </Button>
              <Button className="bg-primary text-white hover:bg-primary-dark w-full justify-center">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
