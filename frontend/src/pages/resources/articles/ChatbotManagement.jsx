import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Bot, Edit, Trash2, Copy, Settings as SettingsIcon, CheckCircle2, AlertCircle } from 'lucide-react';

const ChatbotManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-purple-200/50 z-50 shadow-sm">
        <div className="max-w-[95%] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-semibold">BotSmith</span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/resources/documentation')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documentation
          </Button>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4 md:px-8 lg:px-12">
        <div className="max-w-[85%] mx-auto">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
            Chatbot Management
          </h1>
          <p className="text-xl text-gray-600 mb-8">Create, update, and manage your AI chatbots</p>

          <div className="bg-white rounded-2xl border-2 border-purple-200/50 p-8 shadow-lg">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                BotSmith makes it easy to manage multiple chatbots from one central dashboard. Whether you need different 
                bots for different websites, departments, or use cases, you have complete control.
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <Bot className="w-8 h-8 text-purple-600" />
                Creating Chatbots
              </h2>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Step-by-Step Creation</h3>
              <ol className="space-y-4 mb-6">
                <li>
                  <strong>Access the Dashboard</strong>
                  <p className="text-gray-600 mt-1">Navigate to your main dashboard after logging in</p>
                </li>
                <li>
                  <strong>Click "Create New" or "Create Chatbot"</strong>
                  <p className="text-gray-600 mt-1">Button appears prominently at the top of your dashboard</p>
                </li>
                <li>
                  <strong>Enter Chatbot Details</strong>
                  <ul className="ml-6 mt-2 space-y-1 text-gray-600">
                    <li>• <strong>Name:</strong> Give it a descriptive name (e.g., "Customer Support Bot", "Sales Assistant")</li>
                    <li>• <strong>Description:</strong> Optional brief description for your reference</li>
                  </ul>
                </li>
                <li>
                  <strong>Select AI Provider & Model</strong>
                  <div className="mt-3 grid md:grid-cols-3 gap-3">
                    <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                      <p className="font-bold text-green-900 text-sm">OpenAI</p>
                      <p className="text-xs text-gray-600">GPT-4o Mini</p>
                      <p className="text-xs text-gray-500">Fast & reliable</p>
                    </div>
                    <div className="p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
                      <p className="font-bold text-purple-900 text-sm">Claude</p>
                      <p className="text-xs text-gray-600">3.5 Haiku</p>
                      <p className="text-xs text-gray-500">Efficient & cost-effective</p>
                    </div>
                    <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <p className="font-bold text-blue-900 text-sm">Gemini</p>
                      <p className="text-xs text-gray-600">Flash Lite</p>
                      <p className="text-xs text-gray-500">Ultra-fast</p>
                    </div>
                  </div>
                </li>
                <li>
                  <strong>Click "Create"</strong>
                  <p className="text-gray-600 mt-1">Your chatbot is instantly created and opens in the builder</p>
                </li>
              </ol>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
                <p className="text-sm text-blue-900">
                  <strong>💡 Pro Tip:</strong> Choose your AI provider based on your needs. GPT-4o Mini is great for general use, 
                  Claude 3.5 Haiku is efficient and cost-effective, and Gemini Flash Lite is ultra-fast for simple interactions.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <SettingsIcon className="w-8 h-8 text-blue-600" />
                Chatbot Settings
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                The <strong>Settings</strong> tab in your chatbot builder contains core configuration:
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Basic Information</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Name:</strong> Update your chatbot's name anytime</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Description:</strong> Add or edit internal notes</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Status:</strong> Active or Inactive (pauses the bot without deleting)</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Configuration</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Provider:</strong> Switch between OpenAI, Claude, or Gemini</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Model:</strong> Change the specific model version</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>System Message:</strong> Set the bot's personality and instructions</span>
                </li>
              </ul>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-8">
                <p className="text-sm text-purple-900">
                  <strong>System Message Example:</strong> "You are a helpful customer support assistant for TechCo. 
                  Be friendly, professional, and always provide accurate information from the knowledge base. 
                  If you don't know something, admit it and offer to connect them with a human agent."
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <Edit className="w-8 h-8 text-green-600" />
                Editing Chatbots
              </h2>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Quick Edits from Dashboard</h3>
              <ol className="space-y-3 mb-6">
                <li>Find your chatbot in the dashboard list</li>
                <li>Click on the chatbot card to open the builder</li>
                <li>Navigate to any tab (Sources, Settings, Appearance, etc.)</li>
                <li>Make your changes</li>
                <li>Changes save automatically or click "Save" button</li>
              </ol>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">What You Can Edit</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-2">Content & Training</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Add/remove knowledge sources</li>
                    <li>• Update system messages</li>
                    <li>• Change AI provider/model</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-2">Appearance & Behavior</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Colors, logo, and avatar</li>
                    <li>• Welcome message</li>
                    <li>• Widget position and theme</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                  <h4 className="font-bold text-green-900 mb-2">Deployment Settings</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Public access toggle</li>
                    <li>• Embed code configuration</li>
                    <li>• Webhook URLs</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border-2 border-orange-200">
                  <h4 className="font-bold text-orange-900 mb-2">Basic Settings</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Chatbot name</li>
                    <li>• Description/notes</li>
                    <li>• Active/inactive status</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <Copy className="w-8 h-8 text-cyan-600" />
                Duplicating Chatbots
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Need a similar bot for a different use case? Duplicate saves time:
              </p>
              <ol className="space-y-2 mb-6">
                <li>Find the chatbot you want to duplicate</li>
                <li>Click the menu icon (three dots) on the chatbot card</li>
                <li>Select "Duplicate"</li>
                <li>A copy is created with "(Copy)" added to the name</li>
                <li>Edit the duplicate as needed</li>
              </ol>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8">
                <p className="text-sm text-green-900">
                  <strong>Use Case:</strong> Create a master template bot with your branding and common sources, 
                  then duplicate it for different departments or websites.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <Trash2 className="w-8 h-8 text-red-600" />
                Deleting Chatbots
              </h2>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                <p className="text-sm text-yellow-900 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span><strong>Warning:</strong> Deleting a chatbot is permanent and cannot be undone. 
                  All sources, conversations, and analytics will be lost.</span>
                </p>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">How to Delete</h3>
              <ol className="space-y-2 mb-6">
                <li>Find the chatbot you want to delete</li>
                <li>Click the menu icon (three dots)</li>
                <li>Select "Delete"</li>
                <li>Confirm deletion in the popup dialog</li>
                <li>Chatbot is immediately removed</li>
              </ol>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Before You Delete</h3>
              <ul className="space-y-2 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Export conversations if you need them for records</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Remove embed code from your website</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Consider setting to "Inactive" instead as a temporary solution</span>
                </li>
              </ul>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8">Organization Tips</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-3 text-lg">📂 Naming Conventions</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Use descriptive names ("Support Bot" not "Bot 1")</li>
                    <li>• Include department/website ("Marketing - Website Bot")</li>
                    <li>• Add version if testing ("Support v2")</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-3 text-lg">📈 Usage Monitoring</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Check analytics weekly</li>
                    <li>• Review conversation quality</li>
                    <li>• Update knowledge regularly</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mt-8">
                <h3 className="text-xl font-bold text-green-900 mb-3">🎯 Management Best Practices</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✅ Keep your bot list organized with clear names</li>
                  <li>✅ Regularly review and update knowledge sources</li>
                  <li>✅ Monitor analytics to identify improvement opportunities</li>
                  <li>✅ Set inactive bots to "Inactive" instead of deleting</li>
                  <li>✅ Create templates for common bot types</li>
                  <li>✅ Document which bot is used where</li>
                  <li>✅ Export conversations periodically for backup</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => navigate('/resources/documentation')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documentation
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              Manage Chatbots
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotManagement;