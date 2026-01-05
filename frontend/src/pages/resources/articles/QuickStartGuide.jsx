import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Home, ArrowLeft, Rocket, CheckCircle2 } from 'lucide-react';

const QuickStartGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-purple-200/50 z-50 shadow-sm">
        <div className="max-w-[95%] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/30">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">BotSmith</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/resources/documentation')} className="hover:bg-purple-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documentation
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4 md:px-8 lg:px-12">
        <div className="max-w-[85%] mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6">
            <Rocket className="w-4 h-4" />
            <span className="font-medium">Getting Started</span>
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
            Quick Start Guide
          </h1>
          <p className="text-xl text-gray-600 mb-8">Get up and running with BotSmith in just 5 minutes</p>

          <div className="bg-white rounded-2xl border-2 border-purple-200/50 p-8 shadow-lg">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to BotSmith!</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                BotSmith is an AI-powered chatbot platform that lets you create intelligent chatbots trained on your own data. 
                This guide will help you create your first chatbot in minutes.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Step 1: Create Your Account</h3>
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
                <p className="text-gray-700">
                  Click the <strong>"Try for Free"</strong> button on the homepage and sign up with your email. 
                  No credit card required to get started!
                </p>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Step 2: Create Your First Chatbot</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Navigate to your Dashboard and click <strong>"Create New"</strong> or <strong>"Create Chatbot"</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Give your chatbot a name (e.g., "Customer Support Bot")</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Choose your AI provider (OpenAI GPT-4o Mini, Claude 3.5 Haiku, or Gemini Flash Lite)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Click <strong>"Create"</strong> and you're ready to go!</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Step 3: Add Knowledge Sources</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Train your chatbot by adding knowledge sources. You have three options:
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-2">📄 Files</h4>
                  <p className="text-sm text-gray-700">Upload PDF, DOCX, TXT, CSV, or XLSX files (up to 100MB)</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-2">🌐 Websites</h4>
                  <p className="text-sm text-gray-700">Add any website URL to scrape its content</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                  <h4 className="font-bold text-green-900 mb-2">✍️ Text</h4>
                  <p className="text-sm text-gray-700">Paste text content directly (FAQs, product info, etc.)</p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Step 4: Test Your Chatbot</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Click the <strong>"Preview"</strong> button in the top right corner</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Start chatting to test how your bot responds</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>The chatbot will use your knowledge sources to provide accurate answers</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Step 5: Customize & Deploy</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Once you're happy with your chatbot's responses:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Go to the <strong>Appearance</strong> tab to customize colors, logo, and branding</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Configure widget settings (position, theme) in the <strong>Widget</strong> tab</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Go to <strong>Share</strong> tab to get your embed code or public link</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Copy the embed code and paste it into your website's HTML</span>
                </li>
              </ul>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mt-8">
                <h3 className="text-xl font-bold text-green-900 mb-3">🎉 Congratulations!</h3>
                <p className="text-gray-700 mb-4">
                  You've successfully created your first AI chatbot! Your chatbot is now ready to engage with your visitors 
                  and provide intelligent, context-aware responses based on your knowledge sources.
                </p>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Next Steps</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate('/resources/articles/adding-knowledge-base')}
                  className="text-left p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-xl transition-all"
                >
                  <h4 className="font-bold text-purple-900 mb-1">📚 Adding Knowledge Base</h4>
                  <p className="text-sm text-gray-700">Learn advanced techniques for training your chatbot</p>
                </button>
                <button 
                  onClick={() => navigate('/resources/articles/customization-options')}
                  className="text-left p-4 bg-pink-50 hover:bg-pink-100 border-2 border-pink-200 rounded-xl transition-all"
                >
                  <h4 className="font-bold text-pink-900 mb-1">🎨 Customization Options</h4>
                  <p className="text-sm text-gray-700">Brand your chatbot with colors, logos, and themes</p>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => navigate('/resources/documentation')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documentation
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStartGuide;