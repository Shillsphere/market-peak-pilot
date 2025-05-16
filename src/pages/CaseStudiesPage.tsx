
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const CaseStudiesPage = () => {
  useEffect(() => {
    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 0) {
        const exitModal = document.getElementById('exit-modal');
        if (exitModal) exitModal.classList.remove('hidden');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    // Google Tag Manager - using a type-safe approach
    const pushToDataLayer = (data: Record<string, any>) => {
      // Define dataLayer for TypeScript
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(data);
    };

    // Push the page view event
    pushToDataLayer({ event: 'case_study_page' });

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="bg-gray-50 text-gray-900">
      <Navbar />
      
      {/* HERO */}
      <header className="container mx-auto max-w-6xl px-6 py-12 text-center">
        <h1 className="text-4xl font-extrabold mb-4">Real Results with MarketPeak</h1>
        <p className="text-lg mb-8">See how restaurants, service SMBs, and community orgs boost revenue with AI‑powered marketing.</p>

        {/* KPI COUNTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="counter"><span id="kpi-posts" className="text-3xl font-bold text-primary">1,240</span><br/>AI posts published</div>
          <div className="counter"><span id="kpi-engage" className="text-3xl font-bold text-primary">38 %</span><br/>Avg engagement lift</div>
          <div className="counter"><span id="kpi-rev" className="text-3xl font-bold text-primary">$287 k</span><br/>Incremental revenue</div>
        </div>
      </header>

      {/* FILTER CHIPS */}
      <section className="container mx-auto max-w-6xl px-6 mb-6 flex flex-wrap gap-3 justify-center">
        <button className="px-4 py-2 rounded-full bg-primary text-white" data-filter="all">All</button>
        <button className="px-4 py-2 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors" data-filter="restaurant">Restaurants</button>
        <button className="px-4 py-2 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors" data-filter="services">Gyms & Services</button>
        <button className="px-4 py-2 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors" data-filter="community">Community Orgs</button>
      </section>

      {/* CASE GRID */}
      <section id="case-grid" className="container mx-auto max-w-6xl px-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 pb-16">
        {/* Card 1 – Restaurant */}
        <article className="bg-white p-6 rounded-2xl shadow-lg" data-segment="restaurant">
          <img className="h-12 mb-4" src="/lovable-uploads/8b96431b-d832-42d1-aaf7-1caaf5e13c2e.png" alt="Bella Italia Bistro logo" />
          <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">Restaurant</span>
          <h3 className="mt-2 font-semibold">Bella Italia Bistro</h3>
          <p className="text-sm text-gray-600 mb-3">+27 % weeknight foot‑traffic in 90 days</p>
          <a href="#" className="text-primary font-medium hover:underline">Read Story →</a>
        </article>

        {/* Card 2 – Service SMB */}
        <article className="bg-white p-6 rounded-2xl shadow-lg" data-segment="services">
          <img className="h-12 mb-4" src="/lovable-uploads/8b96431b-d832-42d1-aaf7-1caaf5e13c2e.png" alt="Peak Performance Fitness logo" />
          <span className="inline-block px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-sm font-medium">Gym & Services</span>
          <h3 className="mt-2 font-semibold">Peak Performance Fitness</h3>
          <p className="text-sm text-gray-600 mb-3">3× trial membership sign‑ups</p>
          <a href="#" className="text-primary font-medium hover:underline">Read Story →</a>
        </article>

        {/* Card 3 – Community Org */}
        <article className="bg-white p-6 rounded-2xl shadow-lg" data-segment="community">
          <img className="h-12 mb-4" src="/lovable-uploads/8b96431b-d832-42d1-aaf7-1caaf5e13c2e.png" alt="Community Connection logo" />
          <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">Community Org</span>
          <h3 className="mt-2 font-semibold">Community Connection</h3>
          <p className="text-sm text-gray-600 mb-3">45% more event registrations</p>
          <a href="#" className="text-primary font-medium hover:underline">Read Story →</a>
        </article>
      </section>

      {/* STICKY CTA */}
      <aside className="fixed bottom-4 right-4 md:sticky md:top-20 md:right-auto md:w-64 z-10">
        <div className="bg-white shadow-xl rounded-2xl p-4 flex flex-col gap-4">
          <Link to="/strategy-call" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-center">
            Talk to a strategist
          </Link>
          <a href="#" className="border border-primary text-primary px-4 py-2 rounded-md hover:bg-primary/10 transition-colors text-center">
            Download all case studies
          </a>
        </div>
      </aside>

      {/* EXIT‑INTENT MODAL (hidden) */}
      <div id="exit-modal" className="hidden fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-2">Like these results?</h2>
          <p className="mb-4">Get the full PDF bundle & bonus tactics guide.</p>
          <form id="modal-form" className="space-y-3">
            <input required className="w-full border border-gray-300 rounded-md px-4 py-2" name="email" type="email" placeholder="Email" />
            <input className="w-full border border-gray-300 rounded-md px-4 py-2" name="phone" type="tel" placeholder="Phone (optional)" />
            <button className="bg-primary text-white w-full px-4 py-2 rounded-md hover:bg-primary/90 transition-colors" type="submit">Send me the PDF</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CaseStudiesPage;
