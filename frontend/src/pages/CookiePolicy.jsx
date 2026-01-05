import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cookie, Settings, BarChart3, Shield, X, Check, Info, Clock } from 'lucide-react';

const CookiePolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-rose-600 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <Cookie className="w-8 h-8" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold">Cookie Policy</h1>
          </div>
          <p className="text-orange-100 text-lg">
            Last updated: December 29, 2024
          </p>
          <p className="text-white/90 mt-4 max-w-4xl">
            This Cookie Policy explains how BotSmith uses cookies and similar tracking technologies on our website and services.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-12">
          
          {/* Section 1 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                <Info className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">1. What Are Cookies?</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Cookies are small text files that are stored on your device when you visit a website. They help websites remember your preferences and improve your user experience.
                </p>
              </div>
            </div>
            
            <div className="pl-0 lg:pl-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Cookie className="w-5 h-5 text-orange-600" />
                Types of Data Stored
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Session information</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">User preferences</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Authentication status</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Analytics data</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">2. Types of Cookies We Use</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use different types of cookies to provide and improve BotSmith:
                </p>
              </div>
            </div>
            
            <div className="pl-0 lg:pl-12 space-y-4">
              {/* Essential Cookies */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <h3 className="font-bold text-gray-900">Essential Cookies</h3>
                      <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                        Required
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and session management.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm"><strong>auth_token</strong> - Authentication and login sessions</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm"><strong>session_id</strong> - User session tracking</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm"><strong>csrf_token</strong> - Security protection</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <h3 className="font-bold text-gray-900">Functional Cookies</h3>
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                        Optional
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm"><strong>theme_preference</strong> - UI theme settings</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm"><strong>language</strong> - Language preferences</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm"><strong>timezone</strong> - Timezone settings</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <h3 className="font-bold text-gray-900">Analytics Cookies</h3>
                      <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                        Optional
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm"><strong>_ga</strong> - Google Analytics visitor tracking</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm"><strong>_gid</strong> - Google Analytics session tracking</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm"><strong>analytics_session</strong> - Usage analytics</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-lg p-5 border border-rose-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-rose-100 rounded-lg flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <h3 className="font-bold text-gray-900">Marketing Cookies</h3>
                      <span className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-full">
                        Optional
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      These cookies track your online activity to help advertisers deliver more relevant advertising or to limit how many times you see an ad.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm"><strong>_fbp</strong> - Facebook pixel tracking</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm"><strong>ads_preferences</strong> - Ad personalization</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                <Settings className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">3. Managing Your Cookie Preferences</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You have control over which cookies you accept. Here's how you can manage your preferences:
                </p>
              </div>
            </div>
            
            <div className="pl-0 lg:pl-12 space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Browser Settings
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Most web browsers allow you to control cookies through their settings. You can typically:
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span className="text-gray-700 text-sm">Delete all cookies from your browser</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span className="text-gray-700 text-sm">Block all cookies from being set</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span className="text-gray-700 text-sm">Allow cookies only from trusted websites</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span className="text-gray-700 text-sm">Delete cookies when you close your browser</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-5 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  BotSmith Cookie Settings
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  You can also manage your cookie preferences directly through BotSmith:
                </p>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm hover:shadow-md">
                  Manage Cookie Preferences
                </button>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Important Note</h4>
                    <p className="text-gray-700 text-sm">
                      Blocking or deleting cookies may impact your experience on BotSmith. Some features may not work correctly without essential cookies.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">4. Third-Party Cookies</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Some cookies on our site are set by third-party services we use:
                </p>
              </div>
            </div>
            
            <div className="pl-0 lg:pl-12 grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-purple-300 transition-colors">
                <h4 className="font-semibold text-gray-900 mb-2">Google Analytics</h4>
                <p className="text-gray-600 text-sm mb-2">Used for website analytics and performance tracking.</p>
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 text-xs font-medium">
                  Privacy Policy →
                </a>
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-purple-300 transition-colors">
                <h4 className="font-semibold text-gray-900 mb-2">Stripe</h4>
                <p className="text-gray-600 text-sm mb-2">Payment processing and fraud prevention.</p>
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 text-xs font-medium">
                  Privacy Policy →
                </a>
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-purple-300 transition-colors">
                <h4 className="font-semibold text-gray-900 mb-2">OpenAI</h4>
                <p className="text-gray-600 text-sm mb-2">AI model integration for chatbot functionality.</p>
                <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 text-xs font-medium">
                  Privacy Policy →
                </a>
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-purple-300 transition-colors">
                <h4 className="font-semibold text-gray-900 mb-2">CDN Services</h4>
                <p className="text-gray-600 text-sm mb-2">Content delivery and performance optimization.</p>
                <span className="text-gray-400 text-xs">Various providers</span>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookie Duration</h2>
            <div className="pl-0 lg:pl-0">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Session Cookies</h4>
                    <p className="text-gray-600 text-sm">Temporary cookies that expire when you close your browser</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Persistent Cookies</h4>
                    <p className="text-gray-600 text-sm">Remain on your device for a set period (from days to years) or until you delete them</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Updates to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically to stay informed about our use of cookies.
            </p>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-6 border border-orange-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Cookies?</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about our use of cookies, please contact us:
            </p>
            <div className="space-y-2">
              <p className="text-gray-700 flex items-center gap-2">
                <Cookie className="w-4 h-4 text-orange-600" />
                <strong>Email:</strong> privacy@botsmith.io
              </p>
              <p className="text-gray-700 flex items-center gap-2">
                <Info className="w-4 h-4 text-orange-600" />
                <strong>Support:</strong> support@botsmith.io
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;