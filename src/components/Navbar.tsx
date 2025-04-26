import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <nav className="bg-white py-6 px-6 md:px-10 fixed w-full z-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <img src="/lovable-uploads/8b96431b-d832-42d1-aaf7-1caaf5e13c2e.png" alt="mktpk logo" className="h-16 object-fill" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            <a href="#features" className="text-gray-700 hover:text-gray-900 text-lg">Features</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-gray-900 text-lg">How It Works</a>
            <a href="#testimonials" className="text-gray-700 hover:text-gray-900 text-lg">Testimonials</a>
            <a href="#pricing" className="text-gray-700 hover:text-gray-900 text-lg">Pricing</a>
            <a href="#contact" className="text-gray-700 hover:text-gray-900 text-lg">Contact</a>
            <Button className="bg-black text-white hover:bg-gray-800 text-lg px-8 py-6">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden absolute top-24 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="flex flex-col px-6 py-4 space-y-4">
              <a href="#features" className="text-gray-700 hover:text-gray-900">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-gray-900">How It Works</a>
              <a href="#testimonials" className="text-gray-700 hover:text-gray-900">Testimonials</a>
              <a href="#pricing" className="text-gray-700 hover:text-gray-900">Pricing</a>
              <a href="#contact" className="text-gray-700 hover:text-gray-900">Contact</a>
              <Button className="bg-black text-white hover:bg-gray-800 w-full">
                Get Started
              </Button>
            </div>
          </div>}
      </div>
    </nav>;
};
export default Navbar;