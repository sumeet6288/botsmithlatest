import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, User, Mail, Lock, Trash2, CheckCircle2, Shield } from 'lucide-react';

const AccountSettingsGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-purple-200/50 z-50 shadow-sm">
        <div className="max-w-[95%] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/30">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">BotSmith</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/resources/documentation')} className="hover:bg-purple-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documentation
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4 md:px-8 lg:px-12">
        <div className="max-w-[85%] mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full mb-6">
            <User className="w-4 h-4" />
            <span className="font-medium">Account Management</span>
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
            Account Settings Guide
          </h1>
          <p className="text-xl text-gray-600 mb-8">Manage your account, security, and preferences</p>

          <div className="bg-white rounded-2xl border-2 border-purple-200/50 p-8 shadow-lg">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Managing Your Account</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Your BotSmith account settings allow you to manage your profile, security, and preferences. 
                This guide will walk you through all available options.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8 flex items-center gap-2">
                <User className="w-6 h-6 text-purple-600" />
                Profile Information
              </h3>
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
                <p className="text-gray-700 mb-3">
                  <strong>Update your profile details:</strong>
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Name:</strong> Your display name shown throughout the platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Avatar:</strong> Automatically generated from your name initial</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>How to update:</strong> Navigate to Account Settings → Profile Information → Enter new name → Save changes</span>
                  </li>
                </ul>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8 flex items-center gap-2">
                <Mail className="w-6 h-6 text-blue-600" />
                Email Settings
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your email address is used for:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Signing in to your account</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Receiving important notifications and updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span>Password recovery and security alerts</span>
                </li>
              </ul>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-gray-700">
                  <strong>To change your email:</strong> Go to Account Settings → Email → Enter new email → Save. 
                  You may need to verify the new email address.
                </p>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8 flex items-center gap-2">
                <Lock className="w-6 h-6 text-orange-600" />
                Password Security
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Keep your account secure by maintaining a strong password:
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                  <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Strong Password Tips
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Include uppercase & lowercase letters</li>
                    <li>• Add numbers and special characters</li>
                    <li>• Avoid common words or patterns</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border-2 border-orange-200">
                  <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Password Steps
                  </h4>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Go to Account Settings</li>
                    <li>Find Password section</li>
                    <li>Enter current password</li>
                    <li>Enter new password (twice)</li>
                    <li>Click Save to update</li>
                  </ol>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8 flex items-center gap-2">
                <Trash2 className="w-6 h-6 text-red-600" />
                Delete Account
              </h3>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-gray-700 mb-3">
                  <strong className="text-red-700">⚠️ Warning:</strong> Deleting your account is permanent and cannot be undone.
                </p>
                <p className="text-gray-700 mb-3">
                  <strong>What gets deleted:</strong>
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span>All your chatbots and their configurations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span>All uploaded files and knowledge sources</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span>All conversation history and analytics data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span>Your profile and account information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">•</span>
                    <span>Your subscription (will be cancelled immediately)</span>
                  </li>
                </ul>
                <p className="text-gray-700 mt-3">
                  <strong>How to delete:</strong> Go to Account Settings → scroll to Delete Account section → 
                  Click "Delete Account" button → Confirm in the dialog.
                </p>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Best Practices</h3>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 mb-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-900">Keep your email updated</strong>
                      <p className="text-gray-700 text-sm">Ensure you can receive important account notifications</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-900">Use a strong, unique password</strong>
                      <p className="text-gray-700 text-sm">Don't reuse passwords from other services</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-900">Change password regularly</strong>
                      <p className="text-gray-700 text-sm">Update your password every 3-6 months for better security</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-900">Export data before deletion</strong>
                      <p className="text-gray-700 text-sm">Use the export features to save your data before deleting your account</p>
                    </div>
                  </li>
                </ul>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-8">Need More Help?</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you're experiencing issues with your account settings or need assistance:
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => navigate('/resources/help-center')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Visit Help Center
                </Button>
                <Button 
                  onClick={() => navigate('/resources/community')}
                  variant="outline"
                  className="border-purple-300 hover:bg-purple-50"
                >
                  Join Community
                </Button>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div 
                onClick={() => navigate('/resources/articles/quick-start-guide')}
                className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-purple-400 transition-all duration-300 cursor-pointer hover:shadow-lg"
              >
                <h4 className="font-bold text-gray-900 mb-2">Quick Start Guide</h4>
                <p className="text-sm text-gray-700">Get started with BotSmith in minutes</p>
              </div>
              <div 
                onClick={() => navigate('/resources/articles/customization-options')}
                className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-purple-400 transition-all duration-300 cursor-pointer hover:shadow-lg"
              >
                <h4 className="font-bold text-gray-900 mb-2">Customization Options</h4>
                <p className="text-sm text-gray-700">Customize your chatbot appearance and behavior</p>
              </div>
              <div 
                onClick={() => navigate('/subscription')}
                className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-purple-400 transition-all duration-300 cursor-pointer hover:shadow-lg"
              >
                <h4 className="font-bold text-gray-900 mb-2">Subscription Plans</h4>
                <p className="text-sm text-gray-700">View and manage your subscription</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsGuide;
