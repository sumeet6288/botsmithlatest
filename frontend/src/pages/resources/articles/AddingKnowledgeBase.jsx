import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, FileText, Globe, Type, AlertCircle, CheckCircle2 } from 'lucide-react';

const AddingKnowledgeBase = () => {
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
            Adding Knowledge Base
          </h1>
          <p className="text-xl text-gray-600 mb-8">Upload files, websites, and text to train your chatbot</p>

          <div className="bg-white rounded-2xl border-2 border-purple-200/50 p-8 shadow-lg">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                Your chatbot's knowledge base is the foundation of intelligent conversations. The more quality data you provide, 
                the better your chatbot will perform. BotSmith supports three types of knowledge sources.
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <FileText className="w-8 h-8 text-purple-600" />
                File Uploads
              </h2>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Supported File Types</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>PDF files</strong> - Product manuals, documentation, reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Word documents (.docx)</strong> - Company policies, procedures</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Text files (.txt)</strong> - FAQs, knowledge articles</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Excel files (.xlsx)</strong> - Product catalogs, pricing sheets</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>CSV files</strong> - Data tables, lists</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">How to Upload Files</h3>
              <ol className="space-y-3 mb-6">
                <li>Open your chatbot in the builder</li>
                <li>Navigate to the <strong>Sources</strong> tab</li>
                <li>Click <strong>"Add Source"</strong> button</li>
                <li>Select <strong>"Upload File"</strong> option</li>
                <li>Choose your file (up to 100MB)</li>
                <li>Click <strong>"Upload"</strong> and wait for processing</li>
              </ol>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-sm text-blue-900">
                  <strong>💡 Pro Tip:</strong> Files are processed asynchronously. Large files may take a few minutes to process. 
                  You'll see a success notification when it's ready.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <Globe className="w-8 h-8 text-blue-600" />
                Website Scraping
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Import content from any public website to train your chatbot. Perfect for:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Company websites and blogs</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Product documentation sites</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Knowledge bases and help centers</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>News articles and press releases</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">How to Add Websites</h3>
              <ol className="space-y-3 mb-6">
                <li>Click <strong>"Add Source"</strong> in the Sources tab</li>
                <li>Select <strong>"Add Website"</strong></li>
                <li>Enter the full URL (e.g., https://example.com/help)</li>
                <li>Click <strong>"Add"</strong> to start scraping</li>
                <li>Wait for content extraction to complete</li>
              </ol>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                <p className="text-sm text-yellow-900">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  <strong>Note:</strong> Only publicly accessible content can be scraped. Password-protected or dynamically 
                  loaded content may not be fully captured.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8 flex items-center gap-3">
                <Type className="w-8 h-8 text-green-600" />
                Text Content
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Paste text content directly for quick training. Ideal for:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Frequently Asked Questions (FAQs)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Product descriptions and features</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Company information and policies</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Quick updates and announcements</span>
                </li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">How to Add Text</h3>
              <ol className="space-y-3 mb-6">
                <li>Click <strong>"Add Source"</strong></li>
                <li>Select <strong>"Add Text"</strong></li>
                <li>Give your content a descriptive title</li>
                <li>Paste or type your content in the text area</li>
                <li>Click <strong>"Add"</strong> to save</li>
              </ol>

              <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-8">Best Practices</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                  <h4 className="font-bold text-green-900 mb-3 text-lg">✅ Do This</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Use clear, well-structured content</li>
                    <li>• Keep information up-to-date</li>
                    <li>• Organize content by topic</li>
                    <li>• Include comprehensive FAQs</li>
                    <li>• Test chatbot after adding sources</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-xl border-2 border-red-200">
                  <h4 className="font-bold text-red-900 mb-3 text-lg">❌ Avoid This</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Don't upload duplicate content</li>
                    <li>• Avoid outdated information</li>
                    <li>• Don't include irrelevant data</li>
                    <li>• Skip overly technical jargon</li>
                    <li>• Don't forget to delete old sources</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4 mt-8">Managing Your Sources</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All your sources are listed in the Sources tab. You can:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>View all sources with their types and upload dates</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Delete sources you no longer need</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Monitor your usage limits (Free plan: 5 files, 2 websites, 5 text sources)</span>
                </li>
              </ul>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mt-8">
                <h3 className="text-xl font-bold text-purple-900 mb-3">🎯 Pro Tip</h3>
                <p className="text-gray-700">
                  Start with your most frequently asked questions and core product information. As you monitor conversations 
                  in the Analytics tab, you'll identify knowledge gaps and can add more sources accordingly.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => navigate('/resources/documentation')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documentation
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              Create Chatbot
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddingKnowledgeBase;