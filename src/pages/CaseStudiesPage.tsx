
import React, { useState } from 'react';
import { Link } from "react-router-dom";

const CaseStudiesPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filterCases = (segment) => {
    setActiveFilter(segment);
  };

  const handleExitIntent = () => {
    const exitModal = document.getElementById('exit-modal');
    if (exitModal) exitModal.classList.remove('hidden');
  };

  // Add exit intent detection
  React.useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY < 0) handleExitIntent();
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    
    // Push to dataLayer for GTM
    if (window.dataLayer) {
      window.dataLayer.push({ event: 'case_study_page' });
    }

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Dashboard-style nav */}
      <nav className="bg-gray-900 text-white">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/8b96431b-d832-42d1-aaf7-1caaf5e13c2e.png" 
              alt="MarketPeak logo" 
              className="h-8 invert" 
            />
          </Link>
          <div>
            <Link to="/">
              <button className="text-white px-4 py-1 hover:text-gray-300">
                Return to Home
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <header className="container mx-auto max-w-6xl px-6 py-12 text-center">
        <h1 className="text-4xl font-extrabold mb-4">Real Results with MarketPeak</h1>
        <p className="text-lg mb-8">See how restaurants, service SMBs, and community orgs boost revenue with AI‑powered marketing.</p>

        {/* KPI Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4">
            <span className="text-3xl font-bold text-primary">1,240</span>
            <br/>AI posts published
          </div>
          <div className="p-4">
            <span className="text-3xl font-bold text-primary">38 %</span>
            <br/>Avg engagement lift
          </div>
          <div className="p-4">
            <span className="text-3xl font-bold text-primary">$287 k</span>
            <br/>Incremental revenue
          </div>
        </div>
      </header>

      {/* Filter chips */}
      <section className="container mx-auto max-w-6xl px-6 mb-6 flex flex-wrap gap-3 justify-center">
        <button 
          className={`px-4 py-2 rounded-full ${activeFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-200'}`} 
          onClick={() => filterCases('all')}
        >
          All
        </button>
        <button 
          className={`px-4 py-2 rounded-full ${activeFilter === 'restaurant' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          onClick={() => filterCases('restaurant')}
        >
          Restaurants
        </button>
        <button 
          className={`px-4 py-2 rounded-full ${activeFilter === 'services' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          onClick={() => filterCases('services')}
        >
          Gyms & Services
        </button>
        <button 
          className={`px-4 py-2 rounded-full ${activeFilter === 'community' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          onClick={() => filterCases('community')}
        >
          Community Orgs
        </button>
      </section>

      {/* Case Grid */}
      <section className="container mx-auto max-w-6xl px-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 pb-16">
        {/* Restaurant Case */}
        <article 
          className={`bg-white rounded-2xl shadow-lg p-6 ${activeFilter !== 'all' && activeFilter !== 'restaurant' ? 'hidden' : ''}`} 
          data-segment="restaurant"
        >
          <div className="h-12 mb-4 flex items-center">
            <span className="font-serif text-xl font-bold">Bella Italia Bistro</span>
          </div>
          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-amber-100 text-amber-800">Restaurant</span>
          <h3 className="mt-2 font-semibold">Bella Italia Bistro</h3>
          <p className="text-sm text-gray-600 mb-3">+27 % weeknight foot‑traffic in 90 days</p>
          <a href="/case-studies/bella-italia" className="text-primary hover:underline">Read Story →</a>
        </article>

        {/* Service SMB Case */}
        <article 
          className={`bg-white rounded-2xl shadow-lg p-6 ${activeFilter !== 'all' && activeFilter !== 'services' ? 'hidden' : ''}`}
          data-segment="services"
        >
          <div className="h-12 mb-4 flex items-center">
            <span className="font-sans text-xl font-bold">Peak Performance</span>
          </div>
          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-sky-100 text-sky-800">Gym & Services</span>
          <h3 className="mt-2 font-semibold">Peak Performance Fitness</h3>
          <p className="text-sm text-gray-600 mb-3">3× trial membership sign‑ups</p>
          <a href="/case-studies/peakfit" className="text-primary hover:underline">Read Story →</a>
        </article>

        {/* Community Org Case */}
        <article 
          className={`bg-white rounded-2xl shadow-lg p-6 ${activeFilter !== 'all' && activeFilter !== 'community' ? 'hidden' : ''}`}
          data-segment="community"
        >
          <div className="h-12 mb-4 flex items-center">
            <span className="font-sans text-xl font-bold">GreenCity Initiative</span>
          </div>
          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">Community Org</span>
          <h3 className="mt-2 font-semibold">GreenCity Initiative</h3>
          <p className="text-sm text-gray-600 mb-3">1,200+ new volunteer sign-ups</p>
          <a href="/case-studies/greencity" className="text-primary hover:underline">Read Story →</a>
        </article>
      </section>

      {/* Sticky CTA */}
      <aside className="fixed bottom-4 right-4 md:sticky md:bottom-auto md:top-20 md:right-auto md:w-64 z-10">
        <div className="bg-white shadow-xl rounded-2xl p-4 flex flex-col gap-4">
          <Link to="/strategy-call" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded text-center">
            Talk to a strategist
          </Link>
          <a href="#" className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-center hover:bg-gray-50">
            Download all case studies
          </a>
        </div>
      </aside>

      {/* Exit-intent modal */}
      <div id="exit-modal" className="hidden fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center m-4">
          <h2 className="text-2xl font-semibold mb-2">Like these results?</h2>
          <p className="mb-4">Get the full PDF bundle & bonus tactics guide.</p>
          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            <input required className="w-full border rounded px-4 py-2" name="email" type="email" placeholder="Email" />
            <input className="w-full border rounded px-4 py-2" name="phone" type="tel" placeholder="Phone (optional)" />
            <button 
              className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded" 
              type="submit"
              onClick={() => {
                document.getElementById('exit-modal').classList.add('hidden');
                alert('Thank you! The PDF has been sent to your email.');
              }}
            >
              Send me the PDF
            </button>
          </form>
          <button 
            className="mt-4 text-sm text-gray-500"
            onClick={() => document.getElementById('exit-modal').classList.add('hidden')}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseStudiesPage;
