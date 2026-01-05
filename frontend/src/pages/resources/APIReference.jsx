import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Code, ChevronRight, Copy, Check, Home, Terminal, Lock, Zap } from 'lucide-react';

const APIReference = () => {
  const navigate = useNavigate();
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const apiCategories = [
    {
      category: 'Authentication',
      icon: <Lock className="w-5 h-5" />,
      gradient: 'from-red-500 to-rose-600',
      endpoints: [
        { method: 'POST', path: '/api/auth/signin', description: 'Sign in with email and password' },
        { method: 'POST', path: '/api/auth/signup', description: 'Create a new account' },
        { method: 'GET', path: '/api/auth/me', description: 'Get current user info' },
      ]
    },
    {
      category: 'Chatbots',
      icon: <Terminal className="w-5 h-5" />,
      gradient: 'from-purple-500 to-pink-600',
      endpoints: [
        { method: 'GET', path: '/api/chatbots', description: 'List all chatbots' },
        { method: 'POST', path: '/api/chatbots', description: 'Create new chatbot' },
        { method: 'GET', path: '/api/chatbots/{id}', description: 'Get chatbot by ID' },
        { method: 'PUT', path: '/api/chatbots/{id}', description: 'Update chatbot' },
        { method: 'DELETE', path: '/api/chatbots/{id}', description: 'Delete chatbot' },
      ]
    },
    {
      category: 'Sources',
      icon: <Code className="w-5 h-5" />,
      gradient: 'from-blue-500 to-cyan-600',
      endpoints: [
        { method: 'GET', path: '/api/sources/{chatbot_id}', description: 'List all sources' },
        { method: 'POST', path: '/api/sources/file', description: 'Upload file source' },
        { method: 'POST', path: '/api/sources/website', description: 'Add website source' },
        { method: 'POST', path: '/api/sources/text', description: 'Add text source' },
        { method: 'DELETE', path: '/api/sources/{id}', description: 'Delete source' },
      ]
    },
    {
      category: 'Chat',
      icon: <Zap className="w-5 h-5" />,
      gradient: 'from-orange-500 to-red-600',
      endpoints: [
        { method: 'POST', path: '/api/chat', description: 'Send chat message' },
        { method: 'GET', path: '/api/chat/conversations/{chatbot_id}', description: 'Get conversations' },
        { method: 'GET', path: '/api/chat/messages/{conversation_id}', description: 'Get messages' },
      ]
    },
    {
      category: 'Analytics',
      icon: <Terminal className="w-5 h-5" />,
      gradient: 'from-green-500 to-emerald-600',
      endpoints: [
        { method: 'GET', path: '/api/analytics/dashboard', description: 'Dashboard analytics' },
        { method: 'GET', path: '/api/analytics/chatbot/{id}', description: 'Chatbot analytics' },
        { method: 'GET', path: '/api/analytics/response-time-trend/{id}', description: 'Response time trends' },
        { method: 'GET', path: '/api/analytics/hourly-activity/{id}', description: 'Hourly activity' },
      ]
    },
  ];

  const codeExamples = [
    {
      language: 'cURL',
      code: `curl -X POST "http://localhost:8001/api/chatbots" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Customer Support Bot",
    "model": "gpt-4o-mini",
    "provider": "openai"
  }'`
    },
    {
      language: 'JavaScript',
      code: `const response = await fetch('http://localhost:8001/api/chatbots', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Customer Support Bot',
    model: 'gpt-4o-mini',
    provider: 'openai'
  })
});
const data = await response.json();`
    },
    {
      language: 'Python',
      code: `import requests

response = requests.post(
    'http://localhost:8001/api/chatbots',
    headers={
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
    },
    json={
        'name': 'Customer Support Bot',
        'model': 'gpt-4o-mini',
        'provider': 'openai'
    }
)
data = response.json()`
    },
  ];

  const methodColors = {
    GET: 'bg-green-500',
    POST: 'bg-blue-500',
    PUT: 'bg-yellow-500',
    DELETE: 'bg-red-500',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
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
        <div className="max-w-[90%] mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4">
              <Code className="w-4 h-4" />
              <span className="font-medium">API Reference</span>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              REST API Documentation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Complete reference for BotSmith REST API</p>
          </div>

          {/* Base URL */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-6 mb-12">
            <h2 className="text-lg font-bold mb-3">Base URL</h2>
            <div className="flex items-center gap-3 bg-gray-900 text-white p-4 rounded-xl font-mono text-sm">
              <code className="flex-1">http://localhost:8001</code>
              <button 
                onClick={() => copyToClipboard('http://localhost:8001', 'base-url')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {copiedEndpoint === 'base-url' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Code Examples */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-6 mb-12">
            <h2 className="text-xl font-bold mb-4">Quick Start Example</h2>
            <div className="space-y-4">
              {codeExamples.map((example, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{example.language}</span>
                    <button 
                      onClick={() => copyToClipboard(example.code, `code-${index}`)}
                      className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      {copiedEndpoint === `code-${index}` ? (
                        <><Check className="w-4 h-4" /> Copied!</>
                      ) : (
                        <><Copy className="w-4 h-4" /> Copy</>
                      )}
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
                    <code>{example.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* API Endpoints */}
          <div className="space-y-8">
            {apiCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-6 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${category.gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-bold">{category.category}</h2>
                  <span className="ml-auto text-sm text-gray-500">{category.endpoints.length} endpoints</span>
                </div>
                <div className="space-y-2">
                  {category.endpoints.map((endpoint, endpointIndex) => (
                    <div 
                      key={endpointIndex} 
                      className="group p-4 bg-gradient-to-br from-gray-50 to-purple-50/50 rounded-xl border-2 border-transparent hover:border-purple-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <span className={`${methodColors[endpoint.method]} text-white px-3 py-1 rounded-lg text-xs font-bold`}>
                          {endpoint.method}
                        </span>
                        <code className="flex-1 text-sm font-mono text-gray-700">{endpoint.path}</code>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(endpoint.path, `endpoint-${categoryIndex}-${endpointIndex}`);
                          }}
                          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white rounded-lg transition-all"
                        >
                          {copiedEndpoint === `endpoint-${categoryIndex}-${endpointIndex}` ? 
                            <Check className="w-4 h-4 text-green-600" /> : 
                            <Copy className="w-4 h-4 text-purple-600" />
                          }
                        </button>
                        <ChevronRight className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-sm text-gray-600 mt-2 ml-20">{endpoint.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to integrate?</h2>
            <p className="text-lg mb-6 opacity-90">Check out our complete API documentation for detailed examples</p>
            <div className="flex gap-4 justify-center">
              <Button 
                variant="secondary" 
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => navigate('/resources/documentation')}
              >
                View Full Documentation
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white/10"
                onClick={() => window.open('http://localhost:8001/docs', '_blank')}
              >
                Interactive API Docs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIReference;