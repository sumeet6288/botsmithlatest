import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Twitter, Linkedin, Github, Mail, MapPin, Phone, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const Footer = ({ variant = 'landing' }) => {
  const currentYear = new Date().getFullYear();

  if (variant === 'dashboard') {
    return (
      <footer className="mt-auto border-t border-gray-200 bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30">
        <div className="max-w-[95%] mx-auto px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  BotSmith
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Build intelligent chatbots powered by AI
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/dashboard" className="text-gray-600 hover:text-purple-600 transition-colors text-sm flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/analytics" className="text-gray-600 hover:text-purple-600 transition-colors text-sm flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link to="/subscription" className="text-gray-600 hover:text-purple-600 transition-colors text-sm flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Subscription
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Learn</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/resources" className="text-gray-600 hover:text-purple-600 transition-colors text-sm flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="/resources" className="text-gray-600 hover:text-purple-600 transition-colors text-sm flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link to="/resources" className="text-gray-600 hover:text-purple-600 transition-colors text-sm flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/resources" className="text-gray-600 hover:text-purple-600 transition-colors text-sm flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-start text-gray-600 text-sm">
                  <Mail className="w-4 h-4 mr-2 mt-0.5 text-purple-600" />
                  <span>support@botsmith.io</span>
                </li>
                <li className="flex items-start text-gray-600 text-sm">
                  <Phone className="w-4 h-4 mr-2 mt-0.5 text-purple-600" />
                  <span>+917410521746</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600">
              &copy; {currentYear} BotSmith. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <Link to="/privacy-policy" className="text-gray-600 hover:text-purple-600 transition-colors text-sm">
                Privacy Policy
              </Link>
              <span className="text-gray-300">|</span>
              <Link to="/terms-of-service" className="text-gray-600 hover:text-purple-600 transition-colors text-sm">
                Terms of Service
              </Link>
              <span className="text-gray-300">|</span>
              <Link to="/cookie-policy" className="text-gray-600 hover:text-purple-600 transition-colors text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Landing page footer (more extensive)
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-[95%] mx-auto px-8 pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl transform hover:scale-110 transition-transform">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold">BotSmith</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Create intelligent, context-aware chatbots with advanced AI capabilities. Transform customer engagement with our powerful platform.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/resources" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/enterprise" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  Scale Up
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Support */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Learn</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/resources" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  API Reference
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-gray-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  Community
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Copyright */}
          <div className="text-gray-400 text-sm">
            &copy; {currentYear} BotSmith. All rights reserved. Made with ❤️ for better conversations.
          </div>

          {/* Legal Links */}
          <div className="flex items-center space-x-6 text-sm">
            <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
              Privacy
            </Link>
            <span className="text-gray-600">•</span>
            <Link to="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">
              Terms
            </Link>
            <span className="text-gray-600">•</span>
            <Link to="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            <div className="text-xs text-gray-500 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>99.9% Uptime</span>
            </div>
            <div className="text-xs text-gray-500">GDPR Compliant</div>
            <div className="text-xs text-gray-500">SOC 2 Type II</div>
            <div className="text-xs text-gray-500">ISO 27001</div>
            <div className="text-xs text-gray-500">Enterprise Grade Security</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
