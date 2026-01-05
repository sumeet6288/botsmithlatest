import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { BookOpen, ChevronRight, Search, Download, ExternalLink, Home, Rocket, Shield, Code } from 'lucide-react';

const Documentation = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const docs = [
    {
      category: 'Getting Started',
      icon: <Rocket className="w-5 h-5" />,
      gradient: 'from-blue-500 to-cyan-600',
      articles: [
        { title: 'Quick Start Guide', time: '5 min read', description: 'Get up and running in 5 minutes', slug: 'quick-start-guide' },
        { title: 'Installation', time: '10 min read', description: 'Step-by-step installation instructions', slug: 'installation' },
        { title: 'Your First Chatbot', time: '15 min read', description: 'Create your first AI chatbot', slug: 'your-first-chatbot' },
        { title: 'Adding Knowledge Base', time: '8 min read', description: 'Upload files and websites as sources', slug: 'adding-knowledge-base' },
      ]
    },
    {
      category: 'User Guide',
      icon: <BookOpen className="w-5 h-5" />,
      gradient: 'from-purple-500 to-pink-600',
      articles: [
        { title: 'Chatbot Management', time: '12 min read', description: 'Create, update, and manage chatbots', slug: 'chatbot-management' },
        { title: 'Customization Options', time: '10 min read', description: 'Brand colors, logos, and themes', slug: 'customization-options' },
        { title: 'Analytics & Insights', time: '15 min read', description: 'Track performance and user engagement', slug: 'analytics-insights' },
        { title: 'Sharing & Deployment', time: '8 min read', description: 'Embed codes and public links', slug: 'sharing-deployment' },
        { title: 'Account Settings', time: '5 min read', description: 'Manage your profile and preferences', slug: 'account-settings-guide' },
      ]
    },
    {
      category: 'Security',
      icon: <Shield className="w-5 h-5" />,
      gradient: 'from-red-500 to-rose-600',
      articles: [
        { title: 'Authentication & Authorization', time: '12 min read', description: 'JWT tokens and user roles', slug: 'security-overview' },
        { title: 'Data Protection', time: '10 min read', description: 'Encryption and privacy', slug: 'security-overview' },
        { title: 'API Security', time: '15 min read', description: 'Rate limiting and validation', slug: 'security-overview' },
        { title: 'Best Practices', time: '8 min read', description: 'Security guidelines', slug: 'security-overview' },
      ]
    },
  ];

  const downloadableDocs = [
    { name: 'Complete Documentation', size: '15 MB', format: 'PDF', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Quick Start Guide', size: '2 MB', format: 'PDF', icon: <Rocket className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/resources')} className="hover:bg-purple-50">
              <Home className="w-4 h-4 mr-2" />
              Resources Home
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4 md:px-8 lg:px-12 relative z-10">
        <div className="max-w-[95%] mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full mb-4">
              <BookOpen className="w-4 h-4" />
              <span className="font-medium">Documentation</span>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
              Complete Documentation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Everything you need to build amazing AI chatbots</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none shadow-lg"
              />
            </div>
          </div>

          {/* Downloadable Docs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-6 mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-purple-600" />
              Download Documentation
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {downloadableDocs.map((doc, index) => (
                <div key={index} className="group p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200/50 hover:border-purple-400 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white">
                      {doc.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 group-hover:text-purple-600 transition-colors">{doc.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{doc.format}</span>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documentation Sections */}
          <div className="space-y-8">
            {docs.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-6 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${section.gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold">{section.category}</h2>
                  <span className="ml-auto text-sm text-gray-500">{section.articles.length} articles</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {section.articles.map((article, articleIndex) => (
                    <div 
                      key={articleIndex} 
                      className="group p-4 bg-gradient-to-br from-gray-50 to-purple-50/50 rounded-xl border-2 border-transparent hover:border-purple-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => article.slug && navigate(`/resources/articles/${article.slug}`)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1 group-hover:text-purple-600 transition-colors">{article.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{article.description}</p>
                          <span className="text-xs text-gray-500">{article.time}</span>
                          {!article.slug && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Coming Soon</span>}
                        </div>
                        {article.slug && <ChevronRight className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
            <p className="text-lg mb-6 opacity-90">Our support team is here to help you</p>
            <div className="flex gap-4 justify-center">
              <Button 
                variant="secondary" 
                className="bg-white text-purple-600 hover:bg-gray-100"
                onClick={() => navigate('/resources/help-center')}
              >
                Visit Help Center
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white/10"
                onClick={() => window.location.href = 'mailto:support@botsmith.io'}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;