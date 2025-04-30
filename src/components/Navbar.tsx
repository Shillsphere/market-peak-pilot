import { Button } from "@/components/ui/button";
import { DiscoButton } from "@/components/ui/disco-button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <nav className="bg-gradient-to-r from-white to-gray-50 py-3 px-6 md:px-10 fixed w-full z-50 shadow-sm">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <Link to="/">
              <img alt="mktpk logo" src="/lovable-uploads/0b91c1cf-91f5-4d73-9119-5b20bdf4c54c.png" className="h-12 object-fill" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center space-x-10">
            <a href="#features" className="text-gray-700 hover:text-primary font-medium text-sm">Features</a>
            <Link to="/how-it-works" className="text-gray-700 hover:text-primary font-medium text-sm">
              How It Works
            </Link>
            
            <a href="#contact" className="text-gray-700 hover:text-primary font-medium text-sm">Contact</a>
            <Link to="/meet-the-founders" className="text-gray-700 hover:text-primary font-medium text-sm">Meet the Founders</Link>
            <a href="#pricing" className="text-gray-700 hover:text-primary font-medium text-sm">Pricing</a>
          </div>

          {/* Sign In and Get Started buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/sign-in">
              <Button variant="outline" className="font-medium text-gray-700 border-gray-300">
                Sign In
              </Button>
            </Link>
            <Link to="/sign-up">
              <DiscoButton className="text-white rounded-full px-6 py-2 font-medium bg-slate-950 hover:bg-slate-800">
                Get Started
              </DiscoButton>
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
        {isMenuOpen && <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="flex flex-col px-6 py-4 space-y-4">
              <a href="#features" className="text-gray-700 hover:text-primary">Features</a>
              <Link to="/how-it-works" className="text-gray-700 hover:text-primary">
                How It Works
              </Link>
              <a href="#testimonials" className="text-gray-700 hover:text-primary">Testimonials</a>
              <a href="#contact" className="text-gray-700 hover:text-primary">Contact</a>
              <Link to="/meet-the-founders" className="text-gray-700 hover:text-primary">Meet the Founders</Link>
              <a href="#pricing" className="text-gray-700 hover:text-primary">Pricing</a>
              <Link to="/sign-in">
                <Button variant="outline" className="w-full text-gray-700 border-gray-300">
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <DiscoButton className="w-full bg-primary text-white hover:bg-primary/90">
                  Get Started
                </DiscoButton>
              </Link>
            </div>
          </div>}
      </div>
    </nav>;
};
export default Navbar;