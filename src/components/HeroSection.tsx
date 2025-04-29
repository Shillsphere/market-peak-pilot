
import React from "react";
import { Link } from "react-router-dom";
import { DiscoButton } from "./ui/disco-button";
const HeroSection = () => {
  return <section className="pt-40 pb-20 bg-[#FFFBF6]">
      <div className="container px-6 mx-auto">
        <div className="flex flex-col items-center text-center max-w-6xl mx-auto">
          <h1 className="text-[4rem] font-serif font-bold leading-[1.1] tracking-tight text-center md:text-[transparente] text-inherit mx-[16px]">
            Your Entire Marketing-Automated by AI Agents
          </h1>
          
          <p className="mt-10 text-xl md:text-2xl text-gray-600 max-w-4xl leading-relaxed">
            Automate your local marketing workflows with mktpk. Create, schedule, and distribute content—all tailored to your specific local context.
          </p>
          
          <div className="hero-illustration mt-10">
            <img src="/lovable-uploads/70f5f90e-6486-4267-a935-8c0cb679866d.png" srcSet="/lovable-uploads/70f5f90e-6486-4267-a935-8c0cb679866d.png 1x, /lovable-uploads/70f5f90e-6486-4267-a935-8c0cb679866d.png 2x" alt="Marketer relaxing while mktpk AI agents juggle multiple local marketing tasks" loading="lazy" className="w-full max-w-[960px] h-auto rounded-lg lg:max-w-[960px] md:max-w-[92vw] sm:max-w-[92vw]" />
          </div>
          
          {/* New text and CTA button */}
          <div className="mt-12 text-center max-w-4xl">
            
            
            <Link to="/sign-up" className="inline-block mt-6">
              <DiscoButton variant="default" size="xl" className="font-serif px-10 py-6">
                Automate My Marketing
              </DiscoButton>
            </Link>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;
