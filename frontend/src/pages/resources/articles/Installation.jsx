import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Download, CheckCircle2, Copy, Terminal, Globe, Database, Server } from 'lucide-react';

const Installation = () => {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6">
            <Download className="w-4 h-4" />
            <span className="font-medium">Installation</span>
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
            Installation Guide
          </h1>
          <p className="text-xl text-gray-600 mb-8">Step-by-step instructions to set up BotSmith</p>

          <div className="bg-white rounded-2xl border-2 border-purple-200/50 p-8 shadow-lg">
            <div className="prose prose-lg max-w-none">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  Good News! No Installation Required
                </h3>
                <p className="text-gray-700 mb-0">
                  BotSmith is a <strong>cloud-based platform</strong>, which means there's nothing to install! 
                  Simply sign up and start building chatbots instantly from your web browser.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8">Getting Started (3 Simple Steps)</h2>
              
              <div className="space-y-6 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">1</div>
                    <div>
                      <h3 className="text-xl font-bold text-purple-900 mb-2">Create Your Account</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Visit <strong>botsmith.io</strong> (or your BotSmith URL)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Click <strong>"Try for Free"</strong> or <strong>"Sign Up"</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Enter your email and create a password</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Verify your email (check your inbox)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">2</div>
                    <div>
                      <h3 className="text-xl font-bold text-blue-900 mb-2">Access Your Dashboard</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>After signing up, you'll be redirected to your dashboard</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Your dashboard shows all chatbots, analytics, and usage stats</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Start with a Free plan (no credit card required)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">3</div>
                    <div>
                      <h3 className="text-xl font-bold text-green-900 mb-2">Create Your First Chatbot</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Click the <strong>"Create New"</strong> button</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Name your chatbot and choose an AI provider</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>You're ready to start building!</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8">System Requirements</h2>
              
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Minimum Requirements</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-purple-600" />
                      Web Browser
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>✅ Google Chrome (latest version)</li>
                      <li>✅ Mozilla Firefox (latest version)</li>
                      <li>✅ Safari 14 or later</li>
                      <li>✅ Microsoft Edge (latest version)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Server className="w-5 h-5 text-blue-600" />
                      Internet Connection
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>✅ Stable internet connection</li>
                      <li>✅ Recommended: 5 Mbps or faster</li>
                      <li>✅ Works on mobile and desktop</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8">For Developers: Embedding on Your Site</h2>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                If you want to embed BotSmith chatbots on your website, here's what you need:
              </p>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-200 mb-6">
                <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <Terminal className="w-6 h-6" />
                  Website Requirements
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Any website platform:</strong> WordPress, Shopify, Wix, Squarespace, custom HTML</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>HTML access:</strong> Ability to add custom HTML/JavaScript code</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>No coding required:</strong> Just copy and paste the embed code</span>
                  </li>
                </ul>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Quick Embed Code Example</h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-sm mb-6 overflow-x-auto">
                <code>
                  {`<!-- Paste this before </body> tag -->
<iframe
  src="https://your-botsmith.com/public-chat/YOUR-BOT-ID"
  style="position:fixed; bottom:20px; right:20px;
         width:400px; height:600px; border:none;"
></iframe>`}
                </code>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
                <p className="text-sm text-blue-900">
                  <strong>💡 Tip:</strong> Get your unique embed code from the Share tab in your chatbot builder. 
                  It's customized with your chatbot ID and settings!
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8">Mobile Access</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                  <h3 className="font-bold text-purple-900 mb-3 text-lg">📱 Mobile Browser</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Access BotSmith from any mobile browser - fully responsive and optimized for mobile.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• iOS Safari</li>
                    <li>• Chrome for Android</li>
                    <li>• Samsung Internet</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-3 text-lg">💻 Desktop App</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    No desktop app needed! Access via browser for the best experience across all devices.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Windows</li>
                    <li>• macOS</li>
                    <li>• Linux</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8">Need Help?</h2>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-purple-900 mb-3">Get Support</h3>
                <p className="text-gray-700 mb-4">
                  If you encounter any issues during setup or have questions:
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => navigate('/resources/help-center')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  >
                    Visit Help Center
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/resources/articles/quick-start-guide')}
                  >
                    Quick Start Guide
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
            <Button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              Get Started Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Installation;