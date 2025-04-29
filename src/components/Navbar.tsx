
import { Button } from "@/components/ui/button";
import { DiscoButton } from "@/components/ui/disco-button";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const location = useLocation();
  
  // Function to determine which section is currently visible
  const checkActiveSection = () => {
    const sections = ["features", "pricing", "contact", "testimonials", "how-it-works"];
    
    // If we're on the home page, check scroll position
    if (location.pathname === "/") {
      const scrollPosition = window.scrollY + 300; // Offset to trigger slightly before reaching section
      
      // Find the current section based on scroll position
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const top = element.offsetTop;
          const bottom = top + element.offsetHeight;
          
          if (scrollPosition >= top && scrollPosition < bottom) {
            setActiveSection(section);
            return;
          }
        }
      }
      
      // If at the top of the page, don't highlight any section
      if (scrollPosition < 500) {
        setActiveSection("");
      }
    } else {
      // For other pages, set based on the path
      const path = location.pathname.substring(1); // Remove leading slash
      setActiveSection(path);
    }
  };
  
  // Set up scroll and navigation listeners
  useEffect(() => {
    checkActiveSection();
    
    window.addEventListener("scroll", checkActiveSection);
    return () => {
      window.removeEventListener("scroll", checkActiveSection);
    };
  }, [location.pathname]);
  
  // Helper function to determine if a section is active
  const isActive = (section: string) => {
    return activeSection === section ? "font-bold text-black" : "text-gray-700 hover:text-gray-900";
  };
  
  return (
    <nav className="bg-white py-6 px-6 md:px-10 fixed w-full z-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <Link to="/">
              <img src="/lovable-uploads/8b96431b-d832-42d1-aaf7-1caaf5e13c2e.png" alt="mktpk logo" className="h-36 w-auto object-contain" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            <a href="#features" className={`text-lg ${isActive("features")}`}>Features</a>
            <Link to="/how-it-works" className={`text-lg ${location.pathname === "/how-it-works" ? "font-bold text-black" : "text-gray-700 hover:text-gray-900"}`}>
              How It Works
            </Link>
            <a href="#testimonials" className={`text-lg ${isActive("testimonials")}`}>Testimonials</a>
            <a href="#pricing" className={`text-lg ${isActive("pricing")}`}>Pricing</a>
            <a href="#contact" className={`text-lg ${isActive("contact")}`}>Contact</a>
            <Link to="/meet-the-founders" className={`text-lg ${location.pathname === "/meet-the-founders" ? "font-bold text-black" : "text-gray-700 hover:text-gray-900"}`}>
              Meet the Founders
            </Link>
            <Link to="/sign-in">
              <Button variant="outline" className="text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
            <Link to="/sign-up">
              <DiscoButton size="lg" className="text-lg">
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
        {isMenuOpen && (
          <div className="md:hidden absolute top-24 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="flex flex-col px-6 py-4 space-y-4">
              <a href="#features" className={isActive("features")}>Features</a>
              <Link to="/how-it-works" className={location.pathname === "/how-it-works" ? "font-bold text-black" : "text-gray-700 hover:text-gray-900"}>
                How It<br />Works
              </Link>
              <a href="#testimonials" className={isActive("testimonials")}>Testimonials</a>
              <a href="#pricing" className={isActive("pricing")}>Pricing</a>
              <a href="#contact" className={isActive("contact")}>Contact</a>
              <Link to="/meet-the-founders" className={location.pathname === "/meet-the-founders" ? "font-bold text-black" : "text-gray-700 hover:text-gray-900"}>
                Meet the Founders
              </Link>
              <Link to="/sign-in">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <DiscoButton className="w-full">
                  Get Started
                </DiscoButton>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
