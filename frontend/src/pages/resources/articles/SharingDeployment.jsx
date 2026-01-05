import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Share2, Link2, Code, Download, Webhook, Eye, CheckCircle2, Copy } from 'lucide-react';

const SharingDeployment = () => {
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
            Sharing & Deployment
          </h1>
          <p className="text-xl text-gray-600 mb-8">Get your chatbot live with embed codes and public links</p>

          <div className="bg-white rounded-2xl border-2 border-purple-200/50 p-8 shadow-lg">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                Once your chatbot is trained and customized, it's time to deploy it! BotSmith offers multiple deployment 
                options to fit your needs. All deployment options are accessible from the <strong>Share</strong> tab in your chatbot builder.
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <Link2 className="w-8 h-8 text-blue-600" />
                Public Chat Link
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                The fastest way to share your chatbot is through a public link:
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">How to Use Public Links</h3>
              <ol className="space-y-3 mb-6">
                <li>Navigate to the <strong>Share</strong> tab</li>
                <li>Toggle <strong>"Enable Public Access"</strong> to ON</li>
                <li>Your public link appears (e.g., https://yourapp.com/public-chat/abc123)</li>
                <li>Click the <strong>Copy icon</strong> to copy the link</li>
                <li>Share via email, social media, or anywhere else</li>
              </ol>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200 mb-6">
                <h4 className="font-bold text-blue-900 mb-3">🌐 Perfect For:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Social media sharing (Twitter, LinkedIn, Facebook)</li>
                  <li>• Email signatures and newsletters</li>
                  <li>• QR codes for physical locations</li>
                  <li>• Testing before embedding on your site</li>
                  <li>• Sharing with team members for feedback</li>
                </ul>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8">
                <p className="text-sm text-green-900">
                  <strong>🔒 Privacy Note:</strong> Public links are accessible to anyone with the URL. 
                  You can disable public access anytime by toggling it OFF in the Share tab.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <Code className="w-8 h-8 text-purple-600" />
                Website Embed Code
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Embed your chatbot directly on your website as a floating widget:
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Step-by-Step Embedding</h3>
              <ol className="space-y-4 mb-6">
                <li>
                  <strong>Get Your Embed Code</strong>
                  <ul className="ml-6 mt-2 space-y-1 text-gray-600">
                    <li>• Go to Share tab in your chatbot builder</li>
                    <li>• Find the "Embed Code" section</li>
                    <li>• Click <strong>"Copy Embed Code"</strong></li>
                  </ul>
                </li>
                <li>
                  <strong>Add to Your Website</strong>
                  <ul className="ml-6 mt-2 space-y-1 text-gray-600">
                    <li>• Open your website's HTML file</li>
                    <li>• Paste the code just before the closing &lt;/body&gt; tag</li>
                    <li>• Save and publish your changes</li>
                  </ul>
                </li>
                <li>
                  <strong>Test It!</strong>
                  <ul className="ml-6 mt-2 space-y-1 text-gray-600">
                    <li>• Visit your website</li>
                    <li>• You should see the chat widget in your chosen position</li>
                    <li>• Click to open and test functionality</li>
                  </ul>
                </li>
              </ol>

              <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-4 mb-6 font-mono text-sm">
                <p className="text-gray-500 mb-2">&lt;!-- Example embed code --&gt;</p>
                <p className="text-gray-800">&lt;iframe</p>
                <p className="text-gray-800 ml-4">src="https://yourapp.com/public-chat/abc123"</p>
                <p className="text-gray-800 ml-4">style="position:fixed; bottom:20px; right:20px; width:400px; height:600px;"</p>
                <p className="text-gray-800 ml-4">frameborder="0"</p>
                <p className="text-gray-800">&gt;&lt;/iframe&gt;</p>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Platform-Specific Instructions</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-2">WordPress</h4>
                  <p className="text-sm text-gray-700">Use "Custom HTML" block or paste in theme's footer.php file</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-2">Shopify</h4>
                  <p className="text-sm text-gray-700">Theme → Edit Code → theme.liquid → paste before &lt;/body&gt;</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                  <h4 className="font-bold text-green-900 mb-2">Wix</h4>
                  <p className="text-sm text-gray-700">Add → Embed → Custom Embeds → paste code</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-xl border-2 border-pink-200">
                  <h4 className="font-bold text-pink-900 mb-2">Squarespace</h4>
                  <p className="text-sm text-gray-700">Settings → Advanced → Code Injection → Footer</p>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
                <p className="text-sm text-blue-900">
                  <strong>💡 Pro Tip:</strong> The widget respects your Widget tab settings (position, theme) automatically. 
                  Change settings in BotSmith, and they'll update on your site instantly!
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <Download className="w-8 h-8 text-green-600" />
                Export Conversations
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Download conversation data for analysis, reporting, or backup:
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Available Formats</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                  <h4 className="font-bold text-green-900 mb-3 text-lg">📊 CSV Export</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Spreadsheet-friendly format</li>
                    <li>• Perfect for Excel or Google Sheets</li>
                    <li>• Includes user, message, timestamp</li>
                    <li>• Easy sorting and filtering</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-3 text-lg">📦 JSON Export</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Developer-friendly format</li>
                    <li>• Complete conversation structure</li>
                    <li>• Easy integration with tools</li>
                    <li>• Preserves all metadata</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">How to Export</h3>
              <ol className="space-y-2 mb-8">
                <li>Go to <strong>Share</strong> tab</li>
                <li>Find the "Export Conversations" section</li>
                <li>Choose your format (CSV or JSON)</li>
                <li>Click <strong>"Download"</strong></li>
                <li>File downloads to your computer</li>
              </ol>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <Webhook className="w-8 h-8 text-orange-600" />
                Webhooks (Advanced)
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Get real-time notifications when users interact with your chatbot:
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">What are Webhooks?</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Webhooks send HTTP POST requests to your specified URL whenever certain events occur. This lets you:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Integrate with your CRM or helpdesk</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Trigger automated workflows</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Log conversations to your database</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Send notifications to Slack or Discord</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">Setting Up Webhooks</h3>
              <ol className="space-y-3 mb-6">
                <li>Navigate to <strong>Share</strong> tab</li>
                <li>Find "Webhook Configuration" section</li>
                <li>Enter your webhook URL (e.g., https://your-api.com/webhook)</li>
                <li>Select events you want to track:
                  <ul className="ml-6 mt-2 space-y-1 text-gray-600">
                    <li>• New conversation started</li>
                    <li>• Message received</li>
                    <li>• Conversation ended</li>
                  </ul>
                </li>
                <li>Click <strong>"Save Webhook"</strong></li>
                <li>Test the webhook to ensure it's working</li>
              </ol>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8">
                <p className="text-sm text-yellow-900">
                  <strong>🛠️ Technical Note:</strong> Your webhook endpoint must accept POST requests and return a 200 status code. 
                  Requests include conversation data in JSON format.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8">Deployment Best Practices</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                  <h4 className="font-bold text-green-900 mb-3 text-lg">✅ Do This</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Test thoroughly before deploying</li>
                    <li>• Start with public link, then embed</li>
                    <li>• Monitor analytics after deployment</li>
                    <li>• Keep knowledge base updated</li>
                    <li>• Gather user feedback regularly</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-xl border-2 border-red-200">
                  <h4 className="font-bold text-red-900 mb-3 text-lg">❌ Avoid This</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Don't deploy without testing</li>
                    <li>• Don't ignore error reports</li>
                    <li>• Don't forget mobile testing</li>
                    <li>• Don't leave empty knowledge base</li>
                    <li>• Don't skip customization</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mt-8">
                <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <Eye className="w-6 h-6" />
                  Pre-Launch Checklist
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>☐ Knowledge sources added and tested</li>
                  <li>☐ Branding and colors match your website</li>
                  <li>☐ Welcome message is welcoming and clear</li>
                  <li>☐ Widget position doesn't block content</li>
                  <li>☐ Tested on desktop and mobile</li>
                  <li>☐ Team members have reviewed responses</li>
                  <li>☐ Analytics are being tracked</li>
                  <li>☐ Backup export created</li>
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
              Deploy Your Bot
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharingDeployment;