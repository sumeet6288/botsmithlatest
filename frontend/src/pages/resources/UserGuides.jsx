import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowLeft, BookOpen, Settings, Bot, Upload, Palette, Share2, BarChart3, Users } from 'lucide-react';

const UserGuides = () => {
  const navigate = useNavigate();

  const guides = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: 'Creating Your First Chatbot',
      description: 'Step-by-step guide to creating and configuring your first AI chatbot',
      link: '/resources/articles/your-first-chatbot',
      color: 'from-purple-500 to-indigo-600',
      tags: ['Beginner', 'Setup']
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: 'Adding Knowledge Base',
      description: 'Learn how to train your chatbot with files, websites, and text content',
      link: '/resources/articles/adding-knowledge-base',
      color: 'from-blue-500 to-cyan-600',
      tags: ['Content', 'Training']
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: 'Customization Options',
      description: 'Brand your chatbot with custom colors, logos, and themes',
      link: '/resources/articles/customization-options',
      color: 'from-pink-500 to-rose-600',
      tags: ['Design', 'Branding']
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: 'Chatbot Management',
      description: 'Manage, edit, and organize your chatbots effectively',
      link: '/resources/articles/chatbot-management',
      color: 'from-green-500 to-emerald-600',
      tags: ['Management', 'Organization']
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: 'Sharing & Deployment',
      description: 'Deploy your chatbot to your website or share public links',
      link: '/resources/articles/sharing-deployment',
      color: 'from-orange-500 to-red-600',
      tags: ['Deployment', 'Integration']
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Analytics & Insights',
      description: 'Track performance, understand user behavior, and optimize responses',
      link: '/resources/articles/analytics-insights',
      color: 'from-purple-500 to-pink-600',
      tags: ['Analytics', 'Optimization']
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Account Settings',
      description: 'Manage your profile, security settings, and preferences',
      link: '/resources/articles/account-settings-guide',
      color: 'from-indigo-500 to-purple-600',
      tags: ['Account', 'Security']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
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
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Resources
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-8">
        <div className="max-w-[95%] mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6">
              <BookOpen className="w-4 h-4" />
              <span className="font-medium">Comprehensive Guides</span>
            </div>
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
              User Guides
            </h1>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              Master chatbot management and customization with our detailed step-by-step guides
            </p>
          </div>

          {/* Guides Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {guides.map((guide, index) => (
              <div
                key={index}
                onClick={() => navigate(guide.link)}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 hover:border-purple-400 p-8 cursor-pointer transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${guide.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  {guide.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">
                  {guide.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {guide.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {guide.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-1 shadow-2xl">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-12">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Need More Help?
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Explore our complete documentation, join the community, or check out the help center
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div
                  onClick={() => navigate('/resources/documentation')}
                  className="p-6 bg-purple-50 hover:bg-purple-100 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all cursor-pointer"
                >
                  <BookOpen className="w-8 h-8 text-purple-600 mb-3" />
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Documentation</h3>
                  <p className="text-sm text-gray-600">Complete API references and guides</p>
                </div>
                <div
                  onClick={() => navigate('/resources/help-center')}
                  className="p-6 bg-green-50 hover:bg-green-100 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all cursor-pointer"
                >
                  <Settings className="w-8 h-8 text-green-600 mb-3" />
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Help Center</h3>
                  <p className="text-sm text-gray-600">Get answers to common questions</p>
                </div>
                <div
                  onClick={() => navigate('/resources/community')}
                  className="p-6 bg-blue-50 hover:bg-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer"
                >
                  <Users className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Community</h3>
                  <p className="text-sm text-gray-600">Connect with other users</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuides;
