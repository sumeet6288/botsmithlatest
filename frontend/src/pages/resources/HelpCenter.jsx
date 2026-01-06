import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { HelpCircle, Search, ChevronDown, ChevronRight, Home, MessageCircle, Mail } from 'lucide-react';

const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);

  const faqCategories = [
    {
      category: 'Getting Started',
      questions: [
        { q: 'How do I create my first chatbot?', a: 'Click "Create New" on your dashboard. A chatbot is automatically created. Then customize it in the Chatbot Builder by adding knowledge sources, customizing appearance, and testing it.' },
        { q: 'What AI models are supported?', a: 'We support 3 optimized AI models: OpenAI GPT-4o Mini, Anthropic Claude 3.5 Haiku, and Google Gemini Flash Lite.' },
        { q: 'Do I need an API key?', a: 'You can use our Emergent LLM Key which works across all providers, or use your own API keys from OpenAI, Anthropic, or Google.' },
        { q: 'How long does it take to set up?', a: 'You can create and deploy your first chatbot in about 5-10 minutes following our Quick Start guide.' },
      ]
    },
    {
      category: 'Knowledge Base',
      questions: [
        { q: 'What file types can I upload?', a: 'We support PDF, DOCX, TXT, XLSX, and CSV files up to 100MB each.' },
        { q: 'Can I add website content?', a: 'Yes! You can scrape any public website by providing the URL. Our system will extract and process the content automatically.' },
        { q: 'How many sources can I add?', a: 'It depends on your plan. Free plan allows 5 file uploads, 2 websites, and 5 text sources. Higher plans have increased limits.' },
        { q: 'How does the chatbot use my sources?', a: 'The AI reads your sources and uses them as context to answer questions. It will only provide information based on what you\'ve uploaded.' },
      ]
    },
    {
      category: 'Customization',
      questions: [
        { q: 'Can I customize the chatbot appearance?', a: 'Yes! You can customize colors, logos, avatars, welcome messages, widget position, and theme (light/dark/auto).' },
        { q: 'How do I change the chatbot colors?', a: 'Go to the Appearance tab in Chatbot Builder, select your primary and secondary colors, and click Save. Use "View Live Preview" to see changes immediately.' },
        { q: 'Can I add my company logo?', a: 'Yes, provide your logo URL in the Appearance tab. Recommended size is 200x50px.' },
        { q: 'Is white-labeling available?', a: 'White-labeling is available with Enterprise plans. Contact our sales team for details.' },
      ]
    },
    {
      category: 'Deployment & Sharing',
      questions: [
        { q: 'How do I share my chatbot?', a: 'Go to the Share tab and enable Public Access. You\'ll get a shareable link. You can also get embed codes for your website.' },
        { q: 'Can I embed the chatbot on my website?', a: 'Yes! Copy the embed code from the Share tab and paste it into your website\'s HTML.' },
        { q: 'Is the chatbot mobile-responsive?', a: 'Yes, the chatbot works perfectly on all devices - desktop, tablet, and mobile.' },
        { q: 'Can I customize the chat widget position?', a: 'Yes, you can choose from 4 positions: bottom-right, bottom-left, top-right, or top-left.' },
      ]
    },
    {
      category: 'Analytics',
      questions: [
        { q: 'What analytics are available?', a: 'You get conversation counts, message volumes, response times, hourly activity, top questions, satisfaction ratings, and complete chat logs.' },
        { q: 'Can I see individual conversations?', a: 'Yes! Go to the Analytics tab and click "Load Chat Logs" to view all conversations with full message history.' },
        { q: 'How do I export chat data?', a: 'Go to the Share tab and use the "Export Conversations" feature to download data in JSON or CSV format.' },
        { q: 'What is the satisfaction rating?', a: 'Users can rate conversations from 1-5 stars. This helps you track chatbot quality and identify areas for improvement.' },
      ]
    },
    {
      category: 'Billing & Plans',
      questions: [
        { q: 'What does the Free plan include?', a: 'Free plan includes 1 chatbot, 100 messages/month, 5 file uploads, 2 website sources, and basic analytics.' },
        { q: 'How do I upgrade my plan?', a: 'Go to Subscription page, click "Upgrade Plan", select your desired plan, and complete the payment.' },
        { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription anytime from the Subscription page. No questions asked.' },
        { q: 'Do you offer refunds?', a: 'Yes, we offer full refunds within 30 days of purchase if you\'re not satisfied.' },
      ]
    },
    {
      category: 'Troubleshooting',
      questions: [
        { q: 'Why isn\'t my chatbot responding?', a: 'Check: 1) Chatbot is active (toggle in Settings), 2) API key is configured, 3) Sources are fully processed, 4) System message doesn\'t have conflicts.' },
        { q: 'File upload failed - what should I do?', a: 'Ensure: 1) File is under 100MB, 2) File format is supported (PDF, DOCX, TXT, XLSX, CSV), 3) File isn\'t corrupted or password-protected.' },
        { q: 'Changes aren\'t showing in public chat', a: 'After saving appearance changes, click "View Live Preview" to refresh. Clear your browser cache if needed (Ctrl+Shift+Delete).' },
        { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the sign-in page. You\'ll receive a reset link via email.' },
      ]
    },
  ];

  const contactOptions = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Live Chat',
      description: '24/7 support for Pro & Enterprise',
      action: 'Start Chat',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Support',
      description: 'support@botsmith.io',
      action: 'Send Email',
      gradient: 'from-purple-500 to-pink-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-purple-200/50 z-50 shadow-sm">
        <div className="max-w-[95%] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/30">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">BotSmith</span>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/resources')} className="hover:bg-purple-50">
              <Home className="w-4 h-4 mr-2" />
              Resources Home
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4 md:px-8 lg:px-12 relative z-10">
        <div className="max-w-[90%] mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full mb-4">
              <HelpCircle className="w-4 h-4" />
              <span className="font-medium">Help Center</span>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-green-900 to-purple-900 bg-clip-text text-transparent">
              How can we help you?
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Find answers to frequently asked questions</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none shadow-lg"
              />
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-4 mb-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 overflow-hidden hover:shadow-xl transition-all duration-300">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === categoryIndex ? null : categoryIndex)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-purple-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <h3 className="text-lg font-bold">{category.category}</h3>
                    <span className="text-sm text-gray-500">({category.questions.length})</span>
                  </div>
                  {expandedCategory === categoryIndex ? 
                    <ChevronDown className="w-5 h-5 text-purple-600" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  }
                </button>
                {expandedCategory === categoryIndex && (
                  <div className="px-6 pb-4 space-y-4 animate-fade-in">
                    {category.questions.map((faq, faqIndex) => (
                      <div key={faqIndex} className="pl-4 border-l-2 border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-2">{faq.q}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Options */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Still need help?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {contactOptions.map((option, index) => (
                <div key={index} className="group p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200/50 hover:border-purple-400 hover:shadow-lg transition-all duration-300">
                  <div className={`w-12 h-12 bg-gradient-to-br ${option.gradient} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                    {option.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-1">{option.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    onClick={() => {
                      if (option.title === 'Email Support') {
                        window.location.href = 'mailto:support@botsmith.io';
                      }
                    }}
                  >
                    {option.action}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;