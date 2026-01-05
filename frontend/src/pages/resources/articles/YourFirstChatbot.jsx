import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Bot, Sparkles, FileText, MessageSquare, Settings as SettingsIcon, Eye, CheckCircle2, Lightbulb } from 'lucide-react';

const YourFirstChatbot = () => {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full mb-6">
            <Bot className="w-4 h-4" />
            <span className="font-medium">Your First Chatbot</span>
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
            Create Your First AI Chatbot
          </h1>
          <p className="text-xl text-gray-600 mb-8">A complete walkthrough from creation to deployment</p>

          <div className="bg-white rounded-2xl border-2 border-purple-200/50 p-8 shadow-lg">
            <div className="prose prose-lg max-w-none">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  What You'll Build
                </h3>
                <p className="text-gray-700 mb-0">
                  In this tutorial, you'll create a fully functional AI chatbot that can answer questions based on 
                  your custom knowledge base, customize its appearance, and deploy it on your website - all in under 15 minutes!
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <Bot className="w-8 h-8 text-purple-600" />
                Step 1: Create Your Chatbot
              </h2>
              
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-200 mb-6">
                <h3 className="text-xl font-bold text-purple-900 mb-3">Getting Started</h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                    <span>Log in to your BotSmith dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                    <span>Click the <strong>"Create New"</strong> or <strong>"Create Chatbot"</strong> button (big purple button at the top)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                    <span>A modal will appear asking for chatbot details</span>
                  </li>
                </ol>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Choosing Your Settings</h3>
              
              <div className="space-y-4 mb-8">
                <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-2">📝 Chatbot Name</h4>
                  <p className="text-sm text-gray-700 mb-2">Give your chatbot a descriptive name:</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-mono text-gray-800"><strong>Examples:</strong></p>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• "Customer Support Bot"</li>
                      <li>• "Product Advisor"</li>
                      <li>• "FAQ Assistant"</li>
                      <li>• "Sales Helper"</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-200 p-4 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-2">🤖 Choose Your AI Provider</h4>
                  <p className="text-sm text-gray-700 mb-3">Select the AI model that powers your chatbot:</p>
                  
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                      <p className="font-bold text-green-900 mb-1">OpenAI GPT-4o Mini</p>
                      <p className="text-xs text-gray-600 mb-2">Fast, reliable, and excellent for most use cases</p>
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">Recommended</span>
                    </div>
                    <div className="p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
                      <p className="font-bold text-purple-900 mb-1">Claude 3.5 Haiku</p>
                      <p className="text-xs text-gray-600 mb-2">Efficient and cost-effective responses</p>
                      <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">Efficient</span>
                    </div>
                    <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <p className="font-bold text-blue-900 mb-1">Gemini Flash Lite</p>
                      <p className="text-xs text-gray-600 mb-2">Ultra-fast for simple interactions</p>
                      <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Fastest</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
                <p className="text-sm text-blue-900">
                  <strong>💡 First-Time Tip:</strong> Start with <strong>OpenAI GPT-4o Mini</strong> - it's the perfect 
                  balance of speed, quality, and cost. You can always change it later in Settings!
                </p>
              </div>

              <Button 
                className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                onClick={() => {}}
              >
                Click "Create" and Let's Continue! →
              </Button>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                Step 2: Add Your First Knowledge Source
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Now your chatbot is created! But it needs knowledge to answer questions. Let's add some content.
              </p>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200 mb-6">
                <h3 className="text-xl font-bold text-blue-900 mb-4">Choose Your Training Method</h3>
                
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      📄 Option 1: Upload a File (Easiest)
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">Upload your existing documents:</p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• Click <strong>"Add Source"</strong> button</li>
                      <li>• Select <strong>"Upload File"</strong></li>
                      <li>• Choose a PDF, Word doc, or text file (up to 100MB)</li>
                      <li>• Click Upload and wait for processing</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      🌐 Option 2: Add a Website
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">Scrape content from your website:</p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• Click <strong>"Add Source"</strong></li>
                      <li>• Select <strong>"Add Website"</strong></li>
                      <li>• Enter your website URL (e.g., https://yoursite.com/help)</li>
                      <li>• Click Add to start scraping</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      ✍️ Option 3: Paste Text (Fastest)
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">Type or paste content directly:</p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• Click <strong>"Add Source"</strong></li>
                      <li>• Select <strong>"Add Text"</strong></li>
                      <li>• Give it a title (e.g., "Company FAQs")</li>
                      <li>• Paste your content and click Add</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8">
                <p className="text-sm text-yellow-900">
                  <strong>⚡ Quick Start Suggestion:</strong> For your first chatbot, paste 5-10 frequently asked 
                  questions with answers using the "Add Text" option. It takes 2 minutes and gives immediate results!
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-green-600" />
                Step 3: Test Your Chatbot
              </h2>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 mb-6">
                <h3 className="text-xl font-bold text-green-900 mb-4">Time to Chat!</h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Look for the <strong>"Preview"</strong> button in the top-right corner</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Click it to open a chat window</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Ask questions related to your knowledge sources</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>The chatbot will use your content to provide accurate answers</span>
                  </li>
                </ol>
              </div>

              <div className="bg-white border-2 border-gray-300 p-4 rounded-xl mb-8">
                <h4 className="font-bold text-gray-900 mb-3">💬 Example Test Conversation</h4>
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[80%]">
                      <p className="text-sm">What are your business hours?</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
                      <p className="text-sm text-gray-800">We're open Monday through Friday, 9 AM to 6 PM EST. Our support team is also available via email 24/7!</p>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <SettingsIcon className="w-8 h-8 text-orange-600" />
                Step 4: Customize the Look
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Make your chatbot match your brand! Head to the <strong>Appearance</strong> tab:
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-3">🎨 Colors & Branding</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✓ Set primary and secondary colors</li>
                    <li>✓ Upload your logo</li>
                    <li>✓ Add a chatbot avatar</li>
                    <li>✓ Customize welcome message</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border-2 border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-3">📱 Widget Settings</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>✓ Choose position (bottom-right/left)</li>
                    <li>✓ Select theme (light/dark/auto)</li>
                    <li>✓ Preview changes live</li>
                    <li>✓ Adjust size and behavior</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <Eye className="w-8 h-8 text-pink-600" />
                Step 5: Deploy Your Chatbot
              </h2>
              
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border-2 border-pink-200 mb-8">
                <h3 className="text-xl font-bold text-pink-900 mb-4">Ready to Go Live?</h3>
                <p className="text-gray-700 mb-4">Go to the <strong>Share</strong> tab for deployment options:</p>
                
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-bold text-pink-900 mb-2">🔗 Option 1: Public Link (Fastest)</h4>
                    <ol className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>1. Toggle "Enable Public Access" to ON</li>
                      <li>2. Copy the public link</li>
                      <li>3. Share it anywhere (email, social media, QR code)</li>
                    </ol>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-bold text-pink-900 mb-2">💻 Option 2: Website Embed (Most Popular)</h4>
                    <ol className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>1. Copy the embed code from Share tab</li>
                      <li>2. Paste it in your website's HTML (before &lt;/body&gt; tag)</li>
                      <li>3. Save and publish your site</li>
                      <li>4. Your chatbot widget appears automatically!</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-8">
                <h3 className="text-2xl font-bold text-green-900 mb-3 flex items-center gap-2">
                  🎉 Congratulations!
                </h3>
                <p className="text-gray-700 mb-4">
                  You've just created your first AI chatbot! It can now:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Answer questions based on your knowledge</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Engage visitors 24/7 automatically</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Match your brand perfectly</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Work on any website or share link</span>
                  </li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <Lightbulb className="w-8 h-8 text-yellow-600" />
                What's Next?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => navigate('/resources/articles/adding-knowledge-base')}
                  className="text-left p-5 bg-gradient-to-br from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border-2 border-purple-200 rounded-xl transition-all transform hover:-translate-y-1"
                >
                  <h4 className="font-bold text-purple-900 mb-2 text-lg">📚 Expand Your Knowledge Base</h4>
                  <p className="text-sm text-gray-700">Learn advanced techniques for training your chatbot with more sources</p>
                </button>

                <button 
                  onClick={() => navigate('/resources/articles/analytics-insights')}
                  className="text-left p-5 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-2 border-blue-200 rounded-xl transition-all transform hover:-translate-y-1"
                >
                  <h4 className="font-bold text-blue-900 mb-2 text-lg">📊 Monitor Performance</h4>
                  <p className="text-sm text-gray-700">Track conversations, user engagement, and chatbot effectiveness</p>
                </button>

                <button 
                  onClick={() => navigate('/resources/articles/customization-options')}
                  className="text-left p-5 bg-gradient-to-br from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 border-2 border-pink-200 rounded-xl transition-all transform hover:-translate-y-1"
                >
                  <h4 className="font-bold text-pink-900 mb-2 text-lg">🎨 Advanced Customization</h4>
                  <p className="text-sm text-gray-700">Deep dive into branding, themes, and widget customization options</p>
                </button>

                <button 
                  onClick={() => navigate('/resources/articles/chatbot-management')}
                  className="text-left p-5 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200 rounded-xl transition-all transform hover:-translate-y-1"
                >
                  <h4 className="font-bold text-green-900 mb-2 text-lg">⚙️ Manage Multiple Bots</h4>
                  <p className="text-sm text-gray-700">Create and manage different chatbots for different purposes</p>
                </button>
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-3">Need Help?</h3>
                <p className="mb-4 opacity-90">Our support team is here to assist you at every step!</p>
                <div className="flex flex-col sm:flex-row gap-3">
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
                    onClick={() => navigate('/resources/community')}
                  >
                    Join Community
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => navigate('/resources/documentation')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documentation
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourFirstChatbot;
