import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { MessageSquare, Zap, BarChart3, Globe, Shield, Sparkles, ChevronRight, Menu, X, Star, ArrowRight, Check, Upload, Brain, Palette, Rocket, ShoppingCart, GraduationCap, Heart, Briefcase, Users, TrendingUp, Clock, Award } from 'lucide-react';
import Footer from '../components/Footer';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import BotSmithLogo from '../components/BotSmithLogo';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll animation hooks for different sections - removed for performance
  const featuresRef = React.useRef(null);
  const howItWorksRef = React.useRef(null);
  const useCasesRef = React.useRef(null);
  const testimonialsRef = React.useRef(null);
  
  // Set all to visible for instant load
  const featuresVisible = true;
  const howItWorksVisible = true;
  const useCasesVisible = true;
  const testimonialsVisible = true;

  // Scroll to top on mount to fix reload issue
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Custom AI Agents',
      description: 'Train chatbots on your own content and data sources',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'AI Actions',
      description: 'Execute real-world actions like bookings and payments',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Smart Analytics',
      description: 'Monitor performance with actionable insights',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Multi-Channel',
      description: 'Deploy on website, Slack, WhatsApp, and more',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Enterprise Security',
      description: 'Built with robust encryption and compliance',
      gradient: 'from-red-500 to-rose-500'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'No-Code Setup',
      description: 'Build and deploy without technical expertise',
      gradient: 'from-indigo-500 to-purple-500'
    }
  ];

  const howItWorksSteps = [
    {
      step: '01',
      icon: <Upload className="w-8 h-8" />,
      title: 'Connect Your Data',
      description: 'Upload documents, add websites, or paste text content. Support for PDF, DOCX, TXT, and more.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      step: '02',
      icon: <Brain className="w-8 h-8" />,
      title: 'Train Your AI',
      description: 'Our intelligent system automatically processes and learns from your content using advanced RAG technology.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      step: '03',
      icon: <Palette className="w-8 h-8" />,
      title: 'Customize & Brand',
      description: 'Choose colors, upload your logo, set personality, and configure widget appearance to match your brand.',
      gradient: 'from-orange-500 to-rose-500'
    },
    {
      step: '04',
      icon: <Rocket className="w-8 h-8" />,
      title: 'Deploy Anywhere',
      description: 'Get embed code for your website or share a public chat link. Go live in minutes, not weeks.',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const useCases = [
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: 'E-commerce Support',
      description: 'Handle orders, track shipments, and manage returns 24/7',
      stats: '3x faster resolution',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: 'SaaS Onboarding',
      description: 'Guide new users through features and answer product questions',
      stats: '60% less support tickets',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Healthcare FAQ',
      description: 'Answer patient questions about services, hours, and procedures',
      stats: '85% satisfaction rate',
      gradient: 'from-rose-500 to-red-500'
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: 'Education Assistant',
      description: 'Help students with course materials, assignments, and schedules',
      stats: '24/7 availability',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CEO, TechFlow',
      avatar: '👩‍💼',
      rating: 5,
      text: 'BotSmith reduced our support tickets by 60% in the first month. The AI understands our products perfectly!',
      company: 'SaaS Company'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Customer Success Manager',
      avatar: '👨‍💻',
      rating: 5,
      text: 'The multi-provider AI support is game-changing. We can switch between GPT-4 and Claude based on our needs.',
      company: 'E-commerce Platform'
    },
    {
      name: 'Emily Watson',
      role: 'Operations Director',
      avatar: '👩‍🔬',
      rating: 5,
      text: 'Setup took 15 minutes. Our patients love the instant responses. This is the future of healthcare communication.',
      company: 'Healthcare Provider'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 overflow-hidden relative">
      {/* Simplified Static background - No animations for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Static gradient blobs - no animation */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]"></div>
      </div>

      {/* Navigation with Glassmorphism - Highest z-index */}
      <nav className="fixed top-0 left-0 right-0 glass-strong backdrop-blur-xl border-b border-white/30 z-[100] shadow-lg shadow-purple-500/10">
        <div className="max-w-[95%] mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            {/* Premium "B" Logo */}
            <BotSmithLogo size="md" showGlow={false} animate={false} />
            
            {/* Premium Brand Typography */}
            <div className="flex flex-col -space-y-0.5">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent group-hover:from-purple-800 group-hover:via-fuchsia-700 group-hover:to-pink-700 transition-all duration-300 drop-shadow-sm">
                  BotSmith
                </span>
                <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-md">AI</span>
              </div>
              <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
                Powered by Jyosha Solutions
              </span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/pricing')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Pricing</button>
            <button onClick={() => navigate('/enterprise')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Scale Up</button>
            <button onClick={() => navigate('/resources')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Learn</button>
          </div>
          
          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" onClick={() => navigate('/signin')} className="hover:bg-purple-50 transition-colors text-sm sm:text-base px-2 sm:px-4">Sign in</Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-all duration-300 text-sm sm:text-base px-3 sm:px-4" onClick={() => navigate('/signup')}>
              Try for Free
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-gray-700 hover:text-purple-600 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <button onClick={() => { navigate('/pricing'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors font-medium">
                Pricing
              </button>
              <button onClick={() => { navigate('/enterprise'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors font-medium">
                Scale Up
              </button>
              <button onClick={() => { navigate('/resources'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors font-medium">
                Learn
              </button>
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <Button variant="ghost" onClick={() => { navigate('/signin'); setMobileMenuOpen(false); }} className="w-full hover:bg-purple-50 transition-colors">
                  Sign in
                </Button>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg shadow-lg shadow-purple-500/30" onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}>
                  Try for Free
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 sm:pt-40 pb-12 sm:pb-20 px-4 sm:px-8 relative z-10">
        <div className="max-w-[95%] mx-auto grid md:grid-cols-2 gap-8 sm:gap-16 items-center">
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-block">
              <span className="px-3 sm:px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-xs sm:text-sm font-medium inline-flex items-center gap-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                AI-Powered Customer Support
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight animate-slide-in-left">
              <span className="bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent animate-gradient">
                AI that listens,<br />learns, and delights<br />every customer
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
              BotSmith helps you design and deploy smart AI agents that enhance customer support.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-xl shadow-xl transition-colors duration-300 group"
                onClick={() => navigate('/signup')}
              >
                Build your agent
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <span className="text-gray-500 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                No credit card required
              </span>
            </div>
          </div>
          <div className="relative animate-fade-in-right">
            {/* Animated glow effect for the card */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20 animate-pulse-slow"></div>
            
            {/* Card preview with animations */}
            <div 
              onClick={() => navigate('/signup')}
              className="relative w-full h-[500px] rounded-3xl bg-gradient-to-br from-pink-400 via-purple-400 to-orange-400 p-8 flex items-center justify-center transform hover:scale-105 transition-transform duration-500 shadow-2xl cursor-pointer animate-float"
            >
              {/* Shine effect overlay */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-40 pointer-events-none"></div>
              <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent"></div>
              </div>
              
              {/* Floating decorative elements */}
              <div className="absolute top-8 right-8 w-4 h-4 bg-white/30 rounded-full animate-ping pointer-events-none"></div>
              <div className="absolute bottom-12 left-12 w-3 h-3 bg-yellow-300/40 rounded-full animate-ping animation-delay-1000 pointer-events-none"></div>
              
              <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl w-full max-w-md transition-shadow duration-300 border border-white/50 pointer-events-none">
                <div className="relative">
                  {/* Chatbot Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">BotSmith AI</h3>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="text-xs text-gray-500">Online</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Chat Messages */}
                  <div className="space-y-4 mb-4 max-h-[280px] overflow-hidden">
                    {/* AI Message */}
                    <div className="flex items-start gap-2 animate-slide-in-left">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[75%] shadow-sm">
                        <p className="text-sm text-gray-800">👋 Hi! I'm your AI assistant. How can I help you today?</p>
                      </div>
                    </div>
                    
                    {/* User Message */}
                    <div className="flex items-start gap-2 justify-end animate-slide-in-right animation-delay-300">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%] shadow-md">
                        <p className="text-sm text-white">What services do you offer?</p>
                      </div>
                    </div>
                    
                    {/* AI Response */}
                    <div className="flex items-start gap-2 animate-slide-in-left animation-delay-600">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[75%] shadow-sm">
                        <p className="text-sm text-gray-800">I can help with customer support, answer questions, and provide 24/7 assistance! 🚀</p>
                      </div>
                    </div>
                    
                    {/* Typing Indicator */}
                    <div className="flex items-start gap-2 animate-slide-in-left animation-delay-900">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-100"></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Input */}
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200">
                    <input 
                      type="text" 
                      placeholder="Type your message..."
                      className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none"
                      disabled
                    />
                    <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agency Value Proposition */}
      <section className="py-12 border-y border-gray-200 bg-white/50 backdrop-blur-sm relative z-10">
        <div className="max-w-5xl mx-auto px-8">
          <p className="text-center text-xl sm:text-2xl font-semibold text-gray-800 leading-relaxed">
            Run an AI Agency Without Coding — <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">launch, manage, and sell</span> custom AI chatbots and automations under your own brand in minutes.
          </p>
        </div>
      </section>

      {/* Agency Pricing Comparison Table */}
      <section className="py-8 sm:py-16 px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        <div className="max-w-[1600px] mx-auto relative z-10 w-full">
          <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl">
            {/* Table Title */}
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Agency Profitability Calculator
            </h3>
            
            {/* Responsive Table Container */}
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-50 to-pink-50">
                        <th className="text-left py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base font-bold text-gray-900 border-b-2 border-purple-200 whitespace-nowrap">Plan</th>
                        <th className="text-right py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base font-bold text-gray-900 border-b-2 border-purple-200 whitespace-nowrap">Agency Cost</th>
                        <th className="text-center py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base font-bold text-gray-900 border-b-2 border-purple-200 whitespace-nowrap">Bots</th>
                        <th className="text-right py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base font-bold text-gray-900 border-b-2 border-purple-200 whitespace-nowrap">Client Price</th>
                        <th className="text-right py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base font-bold text-gray-900 border-b-2 border-purple-200 whitespace-nowrap">Revenue</th>
                        <th className="text-right py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base font-bold text-gray-900 border-b-2 border-purple-200 whitespace-nowrap">Profit</th>
                        <th className="text-right py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base font-bold text-gray-900 border-b-2 border-purple-200 whitespace-nowrap">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Starter Plan */}
                      <tr className="hover:bg-purple-50/50 transition-colors duration-200">
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base font-semibold text-gray-900 border-b border-gray-200 whitespace-nowrap">Starter</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right text-gray-700 border-b border-gray-200 whitespace-nowrap">₹7,999</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-center text-gray-700 border-b border-gray-200">5</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right text-gray-700 border-b border-gray-200 whitespace-nowrap">₹3,500</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right font-semibold text-gray-900 border-b border-gray-200 whitespace-nowrap">₹17,500</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right font-semibold text-green-600 border-b border-gray-200 whitespace-nowrap">₹9,501</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right font-bold text-purple-600 border-b border-gray-200 whitespace-nowrap">54%</td>
                      </tr>
                      
                      {/* Starter High Price */}
                      <tr className="hover:bg-purple-50/50 transition-colors duration-200">
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base font-semibold text-gray-900 border-b border-gray-200 whitespace-nowrap">Starter (high)</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right text-gray-700 border-b border-gray-200 whitespace-nowrap">₹7,999</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-center text-gray-700 border-b border-gray-200">5</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right text-gray-700 border-b border-gray-200 whitespace-nowrap">₹4,000</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right font-semibold text-gray-900 border-b border-gray-200 whitespace-nowrap">₹20,000</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right font-semibold text-green-600 border-b border-gray-200 whitespace-nowrap">₹12,001</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right font-bold text-purple-600 border-b border-gray-200 whitespace-nowrap">60%</td>
                      </tr>
                      
                      {/* Professional Plan */}
                      <tr className="hover:bg-purple-50/50 transition-colors duration-200">
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base font-semibold text-gray-900 border-b border-gray-200 whitespace-nowrap">Professional</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right text-gray-700 border-b border-gray-200 whitespace-nowrap">₹24,999</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-center text-gray-700 border-b border-gray-200">25</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right text-gray-700 border-b border-gray-200 whitespace-nowrap">₹3,500</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right font-semibold text-gray-900 border-b border-gray-200 whitespace-nowrap">₹87,500</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right font-semibold text-green-600 border-b border-gray-200 whitespace-nowrap">₹62,501</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right font-bold text-purple-600 border-b border-gray-200 whitespace-nowrap">71%</td>
                      </tr>
                      
                      {/* Professional High Price */}
                      <tr className="hover:bg-purple-50/50 transition-colors duration-200 bg-gradient-to-r from-purple-50/30 to-pink-50/30">
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base font-semibold text-gray-900 whitespace-nowrap">Professional (high)</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right text-gray-700 whitespace-nowrap">₹24,999</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-center text-gray-700">25</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right text-gray-700 whitespace-nowrap">₹4,000</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right font-semibold text-gray-900 whitespace-nowrap">₹1,00,000</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right font-semibold text-green-600 whitespace-nowrap">₹75,001</td>
                        <td className="py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm lg:text-base text-right font-bold text-purple-600 whitespace-nowrap">75%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Bottom Note */}
            <div className="mt-4 sm:mt-6 text-center px-2">
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
                💡 <span className="font-semibold">Scale your agency profits</span> by reselling chatbots to multiple clients with attractive margins
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Streamlined Premium */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10" ref={featuresRef}>
        <div className="max-w-[1600px] mx-auto relative z-10 w-full">
          {/* Header */}
          <div className={`text-center mb-12 `}>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent">
              Build Smarter, Support Better, Grow Faster
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A complete platform to craft, deploy and refine your AI-Powered agent ecosystem.
            </p>
          </div>

          {/* Feature Cards - Simplified */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative transition-all duration-300"
              >
                {/* Card */}
                <div className="relative h-full glass-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:translate-y-[-4px]">
                  {/* Icon */}
                  <div className={`relative w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-white mb-4 transition-transform duration-300 group-hover:scale-105 shadow-lg`}>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent"></div>
                    <div className="relative z-10">{feature.icon}</div>
                  </div>

                  {/* Title */}
                  <h3 className="relative text-xl font-bold mb-2 text-gray-900 transition-colors duration-300 z-10">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="relative text-gray-600 leading-relaxed z-10">
                    {feature.description}
                  </p>
                  
                  {/* Hover indicator */}
                  <div className="absolute bottom-4 right-4 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ChevronRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Trust Badge */}
          <div className="mt-12 text-center">
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-gray-700 font-medium">4.9/5 from 150+ customers</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 xl:px-12 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden" ref={howItWorksRef}>
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-[1600px] mx-auto relative z-10 w-full">
          {/* Header */}
          <div className={`text-center mb-16 `}>
            <span className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium inline-flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4" />
              Launch in Minutes
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-900 via-pink-900 to-orange-900 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Four simple steps to transform your customer support with AI
            </p>
          </div>

          {/* Steps with Premium Glassmorphism and Scroll Animation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {howItWorksSteps.map((step, index) => (
              <div 
                key={index}
                className={`relative group transform-3d transition-all duration-800 ${
                  howItWorksVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-20'
                }`}
                style={{ 
                  transitionDelay: howItWorksVisible ? `${index * 150}ms` : '0ms'
                }}
              >
                {/* Connecting Arrow with glow (hidden on last item and mobile) */}
                {index < howItWorksSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 -right-4 z-10">
                    <div className="relative">
                      <div className="absolute inset-0 blur-md bg-purple-500/50 rounded-full"></div>
                      <ArrowRight className="relative w-8 h-8 text-purple-400 group-hover:text-purple-600 transition-colors animate-bounce-subtle" />
                    </div>
                  </div>
                )}

                {/* Card with Advanced Glassmorphism */}
                <div className="relative glass-strong rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px] hover-3d overflow-hidden group">
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-xy"></div>
                  
                  {/* Glowing border effect */}
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-40 blur-sm transition-opacity duration-500 animate-gradient-x"></div>
                  
                  {/* Step Number with 3D effect */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 z-10 animate-gradient-xy">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                    <span className="relative z-10">{step.step}</span>
                  </div>

                  {/* Icon with enhanced animation */}
                  <div className={`relative w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-xl flex items-center justify-center text-white mb-4 mt-2 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-xl z-10 animate-glow-pulse`}>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 to-transparent"></div>
                    <div className="relative z-10 transform group-hover:scale-110 transition-transform">{step.icon}</div>
                  </div>

                  {/* Content */}
                  <h3 className="relative text-xl font-bold mb-2 text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300 z-10">
                    {step.title}
                  </h3>
                  <p className="relative text-gray-600 leading-relaxed text-sm z-10">
                    {step.description}
                  </p>
                  
                  {/* Floating particles in card */}
                  <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full opacity-50 group-hover:opacity-100 animate-bounce-rotate"></div>
                  <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-50 group-hover:opacity-100 animate-bounce-rotate animation-delay-1000"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12 animate-fade-in-up">
            <Button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 group"
              onClick={() => navigate('/signup')}
            >
              Start Building Now
              <Rocket className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10 bg-white" ref={useCasesRef}>
        <div className="max-w-[1600px] mx-auto w-full">
          {/* Header */}
          <div className={`text-center mb-16 `}>
            <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium inline-flex items-center gap-2 mb-4">
              <Award className="w-4 h-4" />
              Trusted Across Industries
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent">
              Built for Every Business
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From startups to enterprises, see how teams use BotSmith to revolutionize customer experience
            </p>
          </div>

          {/* Use Case Cards with Glassmorphism and Scroll Animation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <div 
                key={index}
                className={`group relative transform-3d transition-all duration-800 ${
                  useCasesVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-20'
                }`}
                style={{ 
                  transitionDelay: useCasesVisible ? `${index * 100}ms` : '0ms'
                }}
              >
                {/* Animated Glow Effect */}
                <div className="absolute -inset-px bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500 animate-gradient-x"></div>
                
                {/* Card with Premium Glassmorphism */}
                <div className="relative h-full glass-card rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:translate-y-[-8px] hover-3d overflow-hidden">
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-xy"></div>
                  
                  {/* Icon with 3D effect and glow */}
                  <div className={`relative w-16 h-16 bg-gradient-to-br ${useCase.gradient} rounded-2xl flex items-center justify-center text-white mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl animate-glow-pulse z-10`}>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent"></div>
                    <div className="relative z-10 transform group-hover:scale-110 transition-transform">{useCase.icon}</div>
                  </div>

                  {/* Title */}
                  <h3 className="relative text-xl font-bold mb-2 text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300 z-10">
                    {useCase.title}
                  </h3>

                  {/* Description */}
                  <p className="relative text-gray-600 leading-relaxed text-sm mb-4 z-10">
                    {useCase.description}
                  </p>

                  {/* Stats Badge with glassmorphism */}
                  <div className="relative inline-flex items-center gap-2 px-3 py-1 glass rounded-full text-xs font-semibold text-purple-700 z-10 group-hover:scale-105 transition-transform">
                    <TrendingUp className="w-3 h-3 animate-bounce-subtle" />
                    {useCase.stats}
                  </div>
                  
                  {/* Decorative element */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 xl:px-12 bg-white relative z-10" ref={testimonialsRef}>
        <div className="max-w-[1600px] mx-auto w-full">
          {/* Header */}
          <div className={`text-center mb-16 `}>
            <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium inline-flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 fill-yellow-700" />
              Loved by Teams Worldwide
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of happy customers who transformed their support with BotSmith
            </p>
          </div>

          {/* Testimonial Cards with Glassmorphism and Scroll Animation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={`group relative transform-3d transition-all duration-800 ${
                  testimonialsVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-20'
                }`}
                style={{ 
                  transitionDelay: testimonialsVisible ? `${index * 150}ms` : '0ms'
                }}
              >
                {/* Animated glow border */}
                <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 animate-gradient-x"></div>
                
                {/* Card with Premium Glassmorphism */}
                <div className="relative h-full glass-strong rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px] hover-3d overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-xy"></div>
                  
                  {/* Quote Mark with glow */}
                  <div className="absolute top-6 right-6 text-6xl text-purple-300 font-serif opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">"</div>
                  
                  {/* Stars with animation */}
                  <div className="relative flex gap-1 mb-4 z-10">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-5 h-5 fill-yellow-400 text-yellow-400 animate-bounce-subtle" 
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className="relative text-gray-700 leading-relaxed mb-6 z-10 italic font-medium">
                    {testimonial.text}
                  </p>

                  {/* Author with glassmorphism */}
                  <div className="relative flex items-center gap-4 pt-4 border-t border-purple-200/50 z-10">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 animate-glow-pulse">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
                      <span className="relative z-10">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-xs text-purple-600 font-semibold">{testimonial.company}</p>
                    </div>
                  </div>
                  
                  {/* Decorative particles */}
                  <div className="absolute top-1/4 left-4 w-2 h-2 bg-purple-400 rounded-full opacity-50 group-hover:opacity-100 animate-float-rotate"></div>
                  <div className="absolute bottom-1/3 right-6 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-50 group-hover:opacity-100 animate-float-rotate animation-delay-1000"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Stats with Scroll Animation */}
          <div className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center transition-all duration-800 ${
            testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
          style={{ transitionDelay: testimonialsVisible ? '500ms' : '0ms' }}
          >
            <div>
              <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text mb-2">150+</div>
              <div className="text-gray-600 font-medium">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text mb-2">500K+</div>
              <div className="text-gray-600 font-medium">Conversations/Day</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text mb-2">98%</div>
              <div className="text-gray-600 font-medium">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text mb-2">4.9/5</div>
              <div className="text-gray-600 font-medium">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8 bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        <div className="max-w-[80%] mx-auto text-center relative z-10 animate-fade-in-up">
          <h2 className="text-5xl font-bold mb-6">Take your customer service to the next level.</h2>
          <p className="text-xl text-purple-200 mb-8">Let AI agents create seamless experiences that keep clients coming back</p>
          <Button 
            className="bg-white hover:bg-gray-100 text-purple-900 px-8 py-6 text-lg rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 group"
            onClick={() => navigate('/signup')}
          >
            Get Started Free
            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="landing" />
    </div>
  );
};

export default LandingPage;