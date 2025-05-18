
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-blue-100 to-white py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                AI-Powered Price Negotiation for Business
              </h1>
              <p className="text-xl text-gray-700">
                NEGO Bot helps businesses close more deals by negotiating with customers automatically, 24/7.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg"
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  Log In
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=2070&auto=format&fit=crop" 
                alt="AI Negotiation" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-blue-700 font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Set Your Limits</h3>
              <p className="text-gray-700">
                Define how much flexibility our AI negotiator has with pricing, up to a maximum 25% discount.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-blue-700 font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Customers Negotiate</h3>
              <p className="text-gray-700">
                Visitors interact with your negotiation bot in natural language to bargain for better prices.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-blue-700 font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Close More Deals</h3>
              <p className="text-gray-700">
                Increase conversion rates with personalized deals while maintaining your profit margins.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-700 mb-4 italic">
                "NEGO Bot has revolutionized how we handle pricing discussions. Our sales have increased by 22% since implementation."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full"></div>
                <div className="ml-3">
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-gray-500">CEO, TechSolve Inc.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-700 mb-4 italic">
                "The wholesale pricing feature is brilliant. It's helped us scale our B2B sales with minimal effort."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full"></div>
                <div className="ml-3">
                  <p className="font-medium">Michael Chang</p>
                  <p className="text-sm text-gray-500">Sales Director, Global Supplies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to transform your business?</h2>
          <p className="text-xl mb-8">
            Join thousands of businesses using AI negotiation to boost sales and customer satisfaction.
          </p>
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => navigate('/signup')}
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 mt-auto">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-2xl font-bold text-white mb-4">NEGO Bot</h3>
              <p className="max-w-xs">
                AI-powered price negotiation to help your business grow.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-white font-medium mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white">Features</a></li>
                  <li><a href="#" className="hover:text-white">Pricing</a></li>
                  <li><a href="#" className="hover:text-white">Integrations</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white">About</a></li>
                  <li><a href="#" className="hover:text-white">Blog</a></li>
                  <li><a href="#" className="hover:text-white">Careers</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4">Support</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white">Help Center</a></li>
                  <li><a href="#" className="hover:text-white">Contact</a></li>
                  <li><a href="#" className="hover:text-white">Privacy</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} NEGO Bot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
