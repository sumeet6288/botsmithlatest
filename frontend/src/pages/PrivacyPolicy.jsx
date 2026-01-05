import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, FileText, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-purple-100 text-lg">
            Last updated: December 29, 2024
          </p>
          <p className="text-white/90 mt-4 max-w-4xl">
            At BotSmith, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-12">
          {/* Section 1 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">1. Information We Collect</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We collect information that you provide directly to us when you use BotSmith:
                </p>
              </div>
            </div>
            
            <div className="pl-0 lg:pl-12 space-y-4">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <h3 className="font-semibold text-gray-900 mb-2">Account Information</h3>
                <p className="text-gray-600 text-sm">
                  Name, email address, password, and profile information you provide during registration.
                </p>
              </div>

              <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
                <h3 className="font-semibold text-gray-900 mb-2">Chatbot Data</h3>
                <p className="text-gray-600 text-sm">
                  Information about your chatbots including names, configurations, training data, conversation logs, and analytics.
                </p>
              </div>

              <div className="bg-rose-50 rounded-lg p-4 border border-rose-100">
                <h3 className="font-semibold text-gray-900 mb-2">Usage Information</h3>
                <p className="text-gray-600 text-sm">
                  Information about how you use our service, including access times, pages viewed, IP address, and browser information.
                </p>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <h3 className="font-semibold text-gray-900 mb-2">Payment Information</h3>
                <p className="text-gray-600 text-sm">
                  Billing information and payment details when you subscribe to our paid plans (processed securely through our payment processors).
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">2. How We Use Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use the information we collect for the following purposes:
                </p>
              </div>
            </div>
            
            <div className="pl-0 lg:pl-12">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">To provide, maintain, and improve BotSmith services</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">To process your transactions and send transaction notifications</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">To send technical notices, updates, security alerts, and support messages</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">To respond to your comments, questions, and provide customer service</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">To monitor and analyze trends, usage, and activities in connection with our services</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">To detect, prevent, and address technical issues and security threats</p>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                <Database className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">3. Information Sharing and Disclosure</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We do not sell your personal information. We may share your information only in the following circumstances:
                </p>
              </div>
            </div>
            
            <div className="pl-0 lg:pl-12 space-y-4">
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">With Your Consent</h3>
                <p className="text-gray-600 text-sm">
                  We share information when you explicitly authorize us to do so.
                </p>
              </div>

              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Service Providers</h3>
                <p className="text-gray-600 text-sm">
                  We work with third-party service providers who help us operate our service (e.g., hosting, analytics, payment processing).
                </p>
              </div>

              <div className="border-l-4 border-emerald-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Legal Requirements</h3>
                <p className="text-gray-600 text-sm">
                  We may disclose information if required by law or in response to valid legal requests.
                </p>
              </div>

              <div className="border-l-4 border-rose-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Business Transfers</h3>
                <p className="text-gray-600 text-sm">
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-rose-100 rounded-lg flex-shrink-0">
                <Lock className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">4. Data Security</h2>
                <p className="text-gray-600 leading-relaxed">
                  We implement industry-standard security measures to protect your information:
                </p>
              </div>
            </div>
            
            <div className="pl-0 lg:pl-12 grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  Encryption
                </h4>
                <p className="text-gray-600 text-sm">
                  All data transmitted is encrypted using SSL/TLS protocols.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Access Control
                </h4>
                <p className="text-gray-600 text-sm">
                  Strict access controls and authentication mechanisms.
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  Secure Storage
                </h4>
                <p className="text-gray-600 text-sm">
                  Data stored in secure, encrypted databases.
                </p>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-4 border border-rose-200">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-rose-600" />
                  Monitoring
                </h4>
                <p className="text-gray-600 text-sm">
                  24/7 security monitoring and incident response.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                <UserCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">5. Your Rights and Choices</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You have the following rights regarding your personal information:
                </p>
              </div>
            </div>
            
            <div className="pl-0 lg:pl-12 space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-purple-600 min-w-[80px] flex-shrink-0">Access</span>
                <p className="text-gray-700 text-sm">Request access to your personal information we hold</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-purple-600 min-w-[80px] flex-shrink-0">Correction</span>
                <p className="text-gray-700 text-sm">Request correction of inaccurate information</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-purple-600 min-w-[80px] flex-shrink-0">Deletion</span>
                <p className="text-gray-700 text-sm">Request deletion of your personal information</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-purple-600 min-w-[80px] flex-shrink-0">Export</span>
                <p className="text-gray-700 text-sm">Request a copy of your data in a portable format</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-purple-600 min-w-[80px] flex-shrink-0">Opt-out</span>
                <p className="text-gray-700 text-sm">Opt-out of marketing communications</p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We retain your information for as long as your account is active or as needed to provide you services. You may request deletion of your account at any time through your account settings.
            </p>
          </section>

          {/* Section 7 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Children's Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              BotSmith is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.
            </p>
          </section>

          {/* Section 8 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="space-y-2">
              <p className="text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-600" />
                <strong>Email:</strong> privacy@botsmith.io
              </p>
              <p className="text-gray-700 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <strong>Data Protection Officer:</strong> dpo@botsmith.io
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;