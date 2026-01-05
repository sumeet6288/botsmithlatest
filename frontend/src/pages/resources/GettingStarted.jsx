import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Rocket, Settings, Bot, Upload, CheckCircle } from 'lucide-react';

const GettingStarted = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "1. Create Your Account",
      description: "Sign up for free and get instant access to the BotSmith platform.",
      details: [
        "No credit card required for free plan",
        "Email verification in seconds",
        "Access to all core features immediately"
      ]
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "2. Create Your First Chatbot",
      description: "Start building your AI chatbot in just a few clicks.",
      details: [
        "Choose from OpenAI, Claude, or Gemini models",
        "Configure personality and instructions",
        "Set welcome message and appearance"
      ]
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: "3. Add Knowledge Sources",
      description: "Upload files, add websites, or paste text content.",
      details: [
        "Support for PDF, DOCX, TXT, XLSX, CSV",
        "Website scraping for live content",
        "Direct text input for quick setup",
        "Files up to 100MB supported"
      ]
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "4. Customize Appearance",
      description: "Brand your chatbot with custom colors, logo, and theme.",
      details: [
        "Custom color schemes",
        "Upload logo and avatar",
        "Choose widget position and theme",
        "Live preview of changes"
      ]
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "5. Test & Deploy",
      description: "Test your chatbot and share it with the world.",
      details: [
        "Test in public chat preview",
        "Get shareable public link",
        "Generate embed code for website",
        "Monitor analytics and insights"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-purple-200/50 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/resources')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Resources
            </Button>
          </div>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={() => navigate('/dashboard')}
          >
            Start Building
          </Button>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-4 md:px-8 lg:px-12">
        <div className="max-w-[85%] mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                Tutorial
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Getting Started with BotSmith
            </h1>
            <p className="text-xl text-gray-600">
              Follow this guide to create your first AI chatbot in less than 5 minutes
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-200/50 hover:border-purple-400 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 mb-4 text-lg">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Video Tutorial Section */}
          <div className="mt-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-1 shadow-2xl">
            <div className="bg-white rounded-xl p-8">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Watch the Video Tutorial
              </h2>
              <p className="text-gray-600 mb-6">
                Prefer video? Watch our comprehensive video guide that walks you through the entire process.
              </p>
              <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center border-2 border-purple-200">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p className="text-gray-500">Video tutorial coming soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-16 grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border-2 border-purple-200/50 hover:border-purple-400 transition-all cursor-pointer" onClick={() => navigate('/resources/api-docs')}>
              <h3 className="text-xl font-bold mb-2 text-gray-900">API Documentation</h3>
              <p className="text-gray-600">Learn how to integrate BotSmith with your applications</p>
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-purple-200/50 hover:border-purple-400 transition-all cursor-pointer" onClick={() => navigate('/resources/best-practices')}>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Best Practices</h3>
              <p className="text-gray-600">Tips and tricks for creating effective chatbots</p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 text-lg rounded-xl shadow-lg"
              onClick={() => navigate('/dashboard')}
            >
              Start Building Your Chatbot Now →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GettingStarted;
