import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Code, Copy, CheckCircle } from 'lucide-react';

const ApiDocs = () => {
  const navigate = useNavigate();
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);

  const copyToClipboard = (text, endpoint) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/api/chatbots',
      description: 'List all chatbots',
      auth: 'Required',
      example: `curl -X GET 'https://api.botsmith.io/api/chatbots' \\
  -H 'Authorization: Bearer YOUR_API_KEY'`,
      response: `{
  "chatbots": [
    {
      "id": "chatbot-123",
      "name": "Customer Support Bot",
      "status": "active",
      "model": "gpt-4o-mini",
      "provider": "openai"
    }
  ]
}`
    },
    {
      method: 'POST',
      path: '/api/chatbots',
      description: 'Create a new chatbot',
      auth: 'Required',
      example: `curl -X POST 'https://api.botsmith.io/api/chatbots' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "name": "My New Bot",
    "model": "gpt-4o-mini",
    "provider": "openai",
    "instructions": "You are a helpful assistant."
  }'`,
      response: `{
  "id": "chatbot-456",
  "name": "My New Bot",
  "status": "active",
  "created_at": "2025-10-27T10:00:00Z"
}`
    },
    {
      method: 'POST',
      path: '/api/chat/send',
      description: 'Send a message to a chatbot',
      auth: 'Public',
      example: `curl -X POST 'https://api.botsmith.io/api/chat/send' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "chatbot_id": "chatbot-123",
    "message": "Hello, how can you help me?",
    "session_id": "session-abc123"
  }'`,
      response: `{
  "message": "Hello! I'm here to help. How can I assist you today?",
  "conversation_id": "conv-789",
  "session_id": "session-abc123"
}`
    },
    {
      method: 'POST',
      path: '/api/sources/upload',
      description: 'Upload a file as knowledge source',
      auth: 'Required',
      example: `curl -X POST 'https://api.botsmith.io/api/sources/upload' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -F 'file=@/path/to/document.pdf' \\
  -F 'chatbot_id=chatbot-123'`,
      response: `{
  "id": "source-321",
  "type": "file",
  "name": "document.pdf",
  "status": "processing"
}`
    },
    {
      method: 'GET',
      path: '/api/analytics/chatbot/{id}',
      description: 'Get chatbot analytics',
      auth: 'Required',
      example: `curl -X GET 'https://api.botsmith.io/api/analytics/chatbot/chatbot-123?days=30' \\
  -H 'Authorization: Bearer YOUR_API_KEY'`,
      response: `{
  "total_conversations": 150,
  "total_messages": 890,
  "avg_response_time": 1.2,
  "satisfaction_rate": 4.5
}`
    }
  ];

  const sdks = [
    {
      language: 'JavaScript',
      code: `import { BotSmithClient } from 'botsmith-sdk';

const client = new BotSmithClient({
  apiKey: 'YOUR_API_KEY'
});

// Create a chatbot
const bot = await client.chatbots.create({
  name: 'My Bot',
  model: 'gpt-4o-mini',
  provider: 'openai'
});

// Send a message
const response = await client.chat.send({
  chatbotId: bot.id,
  message: 'Hello!',
  sessionId: 'user-session-123'
});

console.log(response.message);`
    },
    {
      language: 'Python',
      code: `from botsmith import BotSmithClient

client = BotSmithClient(api_key='YOUR_API_KEY')

# Create a chatbot
bot = client.chatbots.create(
    name='My Bot',
    model='gpt-4o-mini',
    provider='openai'
)

# Send a message
response = client.chat.send(
    chatbot_id=bot.id,
    message='Hello!',
    session_id='user-session-123'
)

print(response.message)`
    },
    {
      language: 'cURL',
      code: `# Create a chatbot
curl -X POST 'https://api.botsmith.io/api/chatbots' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{"name": "My Bot", "model": "gpt-4o-mini"}'

# Send a message
curl -X POST 'https://api.botsmith.io/api/chat/send' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "chatbot_id": "chatbot-123",
    "message": "Hello!",
    "session_id": "session-abc"
  }'`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-purple-200/50 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/resources')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </Button>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={() => navigate('/dashboard')}
          >
            Get API Key
          </Button>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-4 md:px-8 lg:px-12">
        <div className="max-w-[90%] mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                API Reference
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              API Documentation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Integrate BotSmith into your applications with our comprehensive REST API
            </p>
          </div>

          {/* Authentication */}
          <div className="mb-16 bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-200/50">
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              Authentication
            </h2>
            <p className="text-gray-600 mb-4">
              All API requests require authentication using an API key. Include your API key in the Authorization header:
            </p>
            <div className="bg-gray-900 rounded-xl p-6 text-gray-100 font-mono text-sm relative group">
              <button
                onClick={() => copyToClipboard("Authorization: Bearer YOUR_API_KEY", "auth")}
                className="absolute top-4 right-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                {copiedEndpoint === 'auth' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <pre>Authorization: Bearer YOUR_API_KEY</pre>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              💡 Get your API key from your account settings in the dashboard
            </p>
          </div>

          {/* Base URL */}
          <div className="mb-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-1 shadow-lg">
            <div className="bg-white rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Base URL</h3>
              <div className="bg-gray-100 rounded-lg p-4 font-mono text-purple-600 font-semibold">
                https://api.botsmith.io
              </div>
            </div>
          </div>

          {/* Endpoints */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">API Endpoints</h2>
            <div className="space-y-6">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-200/50">
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`px-4 py-1 rounded-lg font-bold text-sm ${
                      endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                      endpoint.method === 'POST' ? 'bg-green-100 text-green-700' :
                      endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-purple-600 font-mono font-semibold text-lg">{endpoint.path}</code>
                    <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                      endpoint.auth === 'Required' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {endpoint.auth === 'Required' ? '🔒 Auth Required' : '🌐 Public'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-6">{endpoint.description}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Example Request:</h4>
                      <div className="bg-gray-900 rounded-xl p-4 text-gray-100 font-mono text-xs relative group">
                        <button
                          onClick={() => copyToClipboard(endpoint.example, `endpoint-${index}`)}
                          className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          {copiedEndpoint === `endpoint-${index}` ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <pre className="overflow-x-auto">{endpoint.example}</pre>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Response:</h4>
                      <div className="bg-gray-900 rounded-xl p-4 text-gray-100 font-mono text-xs">
                        <pre className="overflow-x-auto">{endpoint.response}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SDK Examples */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">SDK Examples</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {sdks.map((sdk, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200/50">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">{sdk.language}</h3>
                  <div className="bg-gray-900 rounded-xl p-4 text-gray-100 font-mono text-xs">
                    <pre className="overflow-x-auto">{sdk.code}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rate Limits */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-yellow-900">⚡ Rate Limits</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>Free Plan:</strong> 100 requests/hour</li>
              <li>• <strong>Starter Plan:</strong> 1,000 requests/hour</li>
              <li>• <strong>Professional Plan:</strong> 10,000 requests/hour</li>
              <li>• <strong>Enterprise Plan:</strong> Custom limits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;
