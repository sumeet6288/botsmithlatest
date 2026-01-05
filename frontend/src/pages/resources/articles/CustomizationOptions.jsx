import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Palette, Image, MessageSquare, Layout, Eye, CheckCircle2 } from 'lucide-react';

const CustomizationOptions = () => {
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
            Customization Options
          </h1>
          <p className="text-xl text-gray-600 mb-8">Brand your chatbot with colors, logos, and themes</p>

          <div className="bg-white rounded-2xl border-2 border-purple-200/50 p-8 shadow-lg">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                Make your chatbot truly yours! BotSmith offers extensive customization options to match your brand identity 
                and provide a seamless user experience.
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <Palette className="w-8 h-8 text-purple-600" />
                Color Themes
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Navigate to the <strong>Appearance</strong> tab in your chatbot builder to customize colors:
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Primary Color</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Used for buttons, headers, and interactive elements</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Click the color picker to choose your brand color</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Enter hex code directly for precise matching (e.g., #7C3AED)</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Secondary Color</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Used for accents and hover states</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Should complement your primary color</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>See live preview before saving</span>
                </li>
              </ul>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
                <p className="text-sm text-purple-900">
                  <strong>🎨 Design Tip:</strong> Use your brand's primary color and a complementary shade for the best visual harmony. 
                  Tools like Adobe Color or Coolors can help you find perfect color combinations.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <Image className="w-8 h-8 text-pink-600" />
                Branding Assets
              </h2>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Logo & Avatar</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Add your company logo and chatbot avatar for professional branding:
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-3 text-lg">🎭 Logo</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Appears in chat widget header</li>
                    <li>• Enter direct image URL</li>
                    <li>• Recommended: 200x200px PNG</li>
                    <li>• Transparent background works best</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-3 text-lg">🤖 Avatar</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Shows next to bot messages</li>
                    <li>• Enter direct image URL</li>
                    <li>• Recommended: 100x100px, circular</li>
                    <li>• Use a friendly, recognizable icon</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-sm text-blue-900">
                  <strong>💡 Pro Tip:</strong> Host images on reliable CDN services like Imgur, Cloudinary, or your own website. 
                  Make sure URLs are direct image links ending in .png, .jpg, or .svg.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-green-600" />
                Welcome Message
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Customize the first message users see when they open your chatbot:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Keep it friendly and concise (1-2 sentences)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Tell users what your bot can help with</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Include a call-to-action (e.g., "Ask me anything!")</span>
                </li>
              </ul>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2"><strong>Example Welcome Messages:</strong></p>
                <ul className="space-y-2 text-sm">
                  <li className="p-3 bg-white rounded-lg">👋 "Hi! I'm here to help you with your questions. How can I assist you today?"</li>
                  <li className="p-3 bg-white rounded-lg">🚀 "Welcome! Ask me anything about our products, pricing, or support. Let's get started!"</li>
                  <li className="p-3 bg-white rounded-lg">💬 "Hello! I can answer questions about our services 24/7. What would you like to know?"</li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <Layout className="w-8 h-8 text-orange-600" />
                Widget Settings
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Configure how your chat widget appears on your website in the <strong>Widget</strong> tab:
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Widget Position</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl text-center">
                  <p className="font-bold text-purple-900 mb-2">Bottom Right</p>
                  <p className="text-xs text-gray-600">Most popular</p>
                </div>
                <div className="p-4 bg-pink-50 border-2 border-pink-200 rounded-xl text-center">
                  <p className="font-bold text-pink-900 mb-2">Bottom Left</p>
                  <p className="text-xs text-gray-600">Alternative placement</p>
                </div>
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl text-center">
                  <p className="font-bold text-blue-900 mb-2">Top Right</p>
                  <p className="text-xs text-gray-600">Prominent position</p>
                </div>
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl text-center">
                  <p className="font-bold text-green-900 mb-2">Top Left</p>
                  <p className="text-xs text-gray-600">Unique placement</p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Theme Mode</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Light:</strong> Bright, clean appearance (default)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Dark:</strong> Sleek, modern dark theme</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Auto:</strong> Adapts to user's system preference</span>
                </li>
              </ul>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <Eye className="w-8 h-8 text-indigo-600" />
                Live Preview
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                See your changes in real-time:
              </p>
              <ol className="space-y-3 mb-6">
                <li>Make changes in the Appearance or Widget tabs</li>
                <li>Click <strong>"Save"</strong> to apply changes</li>
                <li>Click <strong>"View Live Preview"</strong> button</li>
                <li>Your chatbot opens in a new tab with all customizations applied</li>
                <li>Test the look and feel before deploying</li>
              </ol>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
                <h4 className="font-bold text-yellow-900 mb-2">⚠️ Important Note</h4>
                <p className="text-sm text-gray-700">
                  Changes take effect immediately for the public chat link. If you've embedded the widget on your website, 
                  users may need to refresh their browser to see updates.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8">Customization Checklist</h2>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <span>☐ Set primary and secondary colors matching your brand</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <span>☐ Upload logo and avatar images</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <span>☐ Write a welcoming, helpful welcome message</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <span>☐ Choose optimal widget position for your website</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <span>☐ Select appropriate theme (light/dark/auto)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <span>☐ Test with live preview before deployment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <span>☐ Get feedback from team members</span>
                  </li>
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
              Customize Your Bot
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationOptions;