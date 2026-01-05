import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Shield, Lock, Database, CheckCircle, AlertTriangle } from 'lucide-react';

const SecurityOverview = () => {
  const navigate = useNavigate();

  const securityArticles = [
    {
      id: 1,
      title: 'Authentication & Authorization',
      description: 'JWT tokens and user roles',
      time: '12 min read',
      icon: <Lock className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-600',
      anchor: 'auth'
    },
    {
      id: 2,
      title: 'Data Protection',
      description: 'Encryption and privacy',
      time: '10 min read',
      icon: <Database className="w-6 h-6" />,
      gradient: 'from-purple-500 to-pink-600',
      anchor: 'data'
    },
    {
      id: 3,
      title: 'API Security',
      description: 'Rate limiting and validation',
      time: '15 min read',
      icon: <Shield className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-600',
      anchor: 'api'
    },
    {
      id: 4,
      title: 'Best Practices',
      description: 'Security guidelines',
      time: '8 min read',
      icon: <CheckCircle className="w-6 h-6" />,
      gradient: 'from-orange-500 to-red-600',
      anchor: 'practices'
    }
  ];

  const handleArticleClick = (anchor) => {
    // Navigate to security docs page with anchor
    navigate(`/resources/articles/security-docs#${anchor}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-purple-200/50 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-semibold">BotSmith</span>
          </div>
          <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            Dashboard
          </Button>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-8 max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/resources/documentation')}
          className="mb-8 hover:bg-purple-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Documentation
        </Button>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full mb-6">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Security Documentation</span>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent">
            🔒 Security
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive security documentation for the BotSmith platform. Protect your chatbots, data, and users with industry-leading security practices.
          </p>
          <div className="mt-6">
            <span className="text-sm text-gray-500">4 articles • 45 min total read time</span>
          </div>
        </div>

        {/* Security Articles Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {securityArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => handleArticleClick(article.anchor)}
              className="group bg-white rounded-2xl border-2 border-purple-200/50 p-8 hover:border-purple-400 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${article.gradient} rounded-xl flex items-center justify-center text-white mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                {article.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-gray-600 mb-4">{article.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{article.time}</span>
                <span className="text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Read Article →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Security Metrics */}
        <div className="bg-white rounded-2xl border-2 border-purple-200/50 p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-600" />
            Current Security Posture
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">A+</div>
              <div className="text-sm text-gray-600">TLS/SSL Grade</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">10/10</div>
              <div className="text-sm text-gray-600">OWASP Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">0</div>
              <div className="text-sm text-gray-600">Critical Vulnerabilities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">✓</div>
              <div className="text-sm text-gray-600">GDPR Compliant</div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200/50 p-8">
          <h2 className="text-xl font-bold mb-6">Quick Links</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-purple-600">Getting Started</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Authentication Setup</li>
                <li>• Environment Configuration</li>
                <li>• Security Checklist</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-purple-600">Security Features</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Rate Limiting (200 req/min)</li>
                <li>• Input Validation</li>
                <li>• Audit Logging</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Security Contact */}
        <div className="mt-12 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-8 text-white">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-bold mb-3">Report Security Vulnerabilities</h3>
              <p className="mb-4 opacity-90">
                Found a security issue? Please report it privately to our security team.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  className="bg-white text-red-600 hover:bg-gray-100"
                  onClick={() => window.location.href = 'mailto:security@botsmith.com'}
                >
                  📧 security@botsmith.com
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10"
                  onClick={() => window.open('https://github.com/botsmith/security', '_blank')}
                >
                  View Bug Bounty Program
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityOverview;
