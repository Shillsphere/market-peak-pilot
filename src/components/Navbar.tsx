
import { Button } from "@/components/ui/button";
import { DiscoButton } from "@/components/ui/disco-button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="bg-white py-4 px-6 md:px-10 fixed w-full z-50 shadow-sm">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <Link to="/">
              <img 
                src="/lovable-uploads/8b96431b-d832-42d1-aaf7-1caaf5e13c2e.png" 
                alt="mktpk logo" 
                className="h-12 object-fill" 
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-gray-900 font-medium">Features</a>
            <Link to="/how-it-works" className="text-gray-700 hover:text-gray-900 font-medium">
              How It Works
            </Link>
            <a href="#testimonials" className="text-gray-700 hover:text-gray-900 font-medium">Testimonials</a>
            <a href="#contact" className="text-gray-700 hover:text-gray-900 font-medium">Contact</a>
            <Link to="/meet-the-founders" className="text-gray-700 hover:text-gray-900 font-medium">Meet the Founders</Link>
            <a href="#pricing" className="text-gray-700 hover:text-gray-900 font-medium">Pricing</a>
          </div>

          {/* Sign In and Get Started buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/sign-in">
              <Button variant="outline" className="font-medium">
                Sign In
              </Button>
            </Link>
            <Link to="/sign-up">
              <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-6 font-medium">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="flex flex-col px-6 py-4 space-y-4">
              <a href="#features" className="text-gray-700 hover:text-gray-900">Features</a>
              <Link to="/how-it-works" className="text-gray-700 hover:text-gray-900">
                How It Works
              </Link>
              <a href="#testimonials" className="text-gray-700 hover:text-gray-900">Testimonials</a>
              <a href="#contact" className="text-gray-700 hover:text-gray-900">Contact</a>
              <Link to="/meet-the-founders" className="text-gray-700 hover:text-gray-900">Meet the Founders</Link>
              <a href="#pricing" className="text-gray-700 hover:text-gray-900">Pricing</a>
              <Link to="/sign-in">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
