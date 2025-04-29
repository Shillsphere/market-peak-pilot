import React from "react";
import Navbar from "@/components/Navbar";
import { DiscoButton } from "@/components/ui/disco-button";
import { Link } from "react-router-dom";
const MeetTheFounders = () => {
  return <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Banner */}
      <section className="pt-40 pb-20 bg-[#FFFBF6]">
        <div className="container px-6 mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Meet the Founders</h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">The team behind Market Peak's mission to transform local marketing through AI automation. Read up on the three founders, all from Libertyville, IL.</p>
        </div>
      </section>
      
      {/* Founders Grid */}
      <section className="py-20 bg-white">
        <div className="container px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Founder 1 */}
            <div className="flex flex-col items-center">
              <div className="rounded-lg overflow-hidden shadow-lg mb-6 w-64 h-64">
                <img src="/lovable-uploads/6fa44a85-2488-40e1-a969-e1f63f5dd950.png" alt="Harry Thomas, CEO & Co-Founder" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-bold">Parker Nuttall</h3>
              <p className="text-lg text-gray-600 mb-4">CEO & Co-Founder</p>
              <p className="text-center text-gray-700 leading-relaxed">Parker is an engineering leader with expertise in AI and computer science. He will be attending UW-Madison with plans to study computer science. He previously architected e-commerce stores, notably The Angler's Outfitter, where he automated the entire side of marketing operations, helping Angler's grow to over 6 figures in revenue. Parker is passionate about making advanced AI agents available for all businesses who are willing to evolve, with his main goal of having mktpk overtake the entire marketing workflow of businesses.</p>
            </div>
            
            {/* Founder 2 */}
            <div className="flex flex-col items-center">
              <div className="rounded-lg overflow-hidden shadow-lg mb-6 w-64 h-64">
                <img src="/lovable-uploads/4a8112d9-5772-45ce-a60e-17406cf7f3fd.png" alt="Parker Wilson, CTO & Co-Founder" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-bold">Parker Wilson</h3>
              <p className="text-lg text-gray-600 mb-4">CTO & Co-Founder</p>
              <p className="text-center text-gray-700 leading-relaxed">
                Parker is an engineering leader with expertise in AI systems and distributed computing. 
                He previously architected machine learning platforms at a Fortune 500 tech company. 
                Parker is passionate about making advanced AI tools accessible to businesses of all sizes, 
                especially those that have been traditionally overlooked by tech innovation.
              </p>
            </div>
            
            {/* Founder 3 */}
            <div className="flex flex-col items-center">
              <div className="rounded-lg overflow-hidden shadow-lg mb-6 w-64 h-64">
                <img src="/lovable-uploads/e581a9ae-1779-4c6e-b674-f148c99abe6b.png" alt="Sarah Chen, COO & Co-Founder" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-bold">Sarah Chen</h3>
              <p className="text-lg text-gray-600 mb-4">COO & Co-Founder</p>
              <p className="text-center text-gray-700 leading-relaxed">
                Sarah brings over a decade of operational expertise from scaling tech startups. 
                Her focus on customer success and process optimization ensures that Market Peak delivers 
                exceptional value from day one. Sarah is committed to helping local businesses thrive in 
                increasingly competitive markets by giving them access to enterprise-grade marketing tools.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container px-6 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to transform your local marketing?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using Market Peak to automate their marketing and grow their local presence.
          </p>
          <Link to="/sign-up">
            <DiscoButton size="lg" className="text-lg">
              Get Started Today
            </DiscoButton>
          </Link>
        </div>
      </section>
      
      {/* Footer from Index page */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img src="/lovable-uploads/8b96431b-d832-42d1-aaf7-1caaf5e13c2e.png" alt="mktpk logo" className="h-10 invert" />
              <p className="mt-4 text-gray-400 text-sm">
                Market Peak helps businesses automate their marketing with AI-powered competitor research, content generation, and local distribution.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="/#features" className="text-gray-400 hover:text-white text-sm color-transition">Features</a></li>
                <li><a href="/#pricing" className="text-gray-400 hover:text-white text-sm color-transition">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm color-transition">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm color-transition">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white text-sm color-transition">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm color-transition">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm color-transition">Case Studies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm color-transition">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white text-sm color-transition">About</a></li>
                <li><Link to="/meet-the-founders" className="text-gray-400 hover:text-white text-sm color-transition">Meet the Founders</Link></li>
                <li><a href="/#contact" className="text-gray-400 hover:text-white text-sm color-transition">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm color-transition">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm color-transition">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm color-transition">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 Market Peak. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white color-transition">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white color-transition">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white color-transition">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default MeetTheFounders;