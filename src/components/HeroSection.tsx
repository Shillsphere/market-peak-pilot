
const HeroSection = () => {
  return <section className="pt-40 pb-20">
      <div className="container px-6 mx-auto">
        <div className="flex flex-col items-center text-center max-w-6xl mx-auto">
          <h1 className="text-[4rem] font-serif font-bold leading-[1.1] tracking-tight text-center md:text-[transparente] text-inherit mx-[16px]">Your Entire Marketing-Automated by AI Agents</h1>
          
          <div className="my-8 flex justify-center">
            <img 
              src="/lovable-uploads/de32dc77-2e05-4d1c-8f50-b1e812949477.png" 
              alt="mktpk illustration" 
              className="w-full max-w-2xl mx-auto"
            />
          </div>
          
          <p className="mt-4 text-xl md:text-2xl text-gray-600 max-w-4xl leading-relaxed">
            Automate your local marketing workflows with mktpk. Create, schedule, and distribute content—all tailored to your specific local context.
          </p>
        </div>
      </div>
    </section>;
};
export default HeroSection;
