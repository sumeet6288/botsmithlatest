import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, AlertCircle, CheckCircle, XCircle, Scale, Users, CreditCard } from 'lucide-react';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Last updated: December 29, 2024
          </p>
          <p className="text-white/90 mt-4 max-w-4xl">
            Please read these terms carefully before using BotSmith. By accessing or using our service, you agree to be bound by these terms.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-12">
          
          {/* Section 1 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">1. Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing and using BotSmith ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our Service.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">2. User Accounts</h2>
              </div>
            </div>
            
            <div className="pl-0 lg:pl-12 space-y-4">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <h3 className="font-semibold text-gray-900 mb-2">Account Creation</h3>
                <p className="text-gray-600 text-sm mb-2">
                  You must provide accurate and complete information when creating an account. You are responsible for:
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="text-gray-600 text-sm flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    Maintaining the confidentiality of your password
                  </li>
                  <li className="text-gray-600 text-sm flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    All activities that occur under your account
                  </li>
                  <li className="text-gray-600 text-sm flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    Notifying us immediately of any unauthorized use
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-2">Eligibility</h3>
                <p className="text-gray-600 text-sm">
                  You must be at least 13 years old to use BotSmith. If you are under 18, you must have parental consent.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">3. Acceptable Use</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You agree to use BotSmith only for lawful purposes and in accordance with these Terms. You agree NOT to:
                </p>
              </div>
            </div>
            
            <div className="pl-0 lg:pl-12 space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Prohibited Activities</h4>
                  <p className="text-gray-600 text-sm">
                    Use the Service for any illegal, harmful, or abusive purposes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Spam or Harassment</h4>
                  <p className="text-gray-600 text-sm">
                    Send spam, unsolicited messages, or engage in harassment
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">System Interference</h4>
                  <p className="text-gray-600 text-sm">
                    Interfere with or disrupt the Service or servers
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Unauthorized Access</h4>
                  <p className="text-gray-600 text-sm">
                    Attempt to gain unauthorized access to any portion of the Service
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Intellectual Property Violation</h4>
                  <p className="text-gray-600 text-sm">
                    Violate any intellectual property rights or other proprietary rights
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                <Scale className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">4. Intellectual Property</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  The Service and its original content, features, and functionality are owned by BotSmith and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </div>
            </div>
            
            <div className="pl-0 lg:pl-12 space-y-4">
              <div className="border-l-4 border-purple-600 pl-4 py-2">
                <h3 className="font-semibold text-gray-900 mb-1">Your Content</h3>
                <p className="text-gray-600 text-sm">
                  You retain ownership of any content you create using BotSmith (chatbot configurations, training data, etc.). You grant us a license to use, store, and process your content to provide the Service.
                </p>
              </div>

              <div className="border-l-4 border-blue-600 pl-4 py-2">
                <h3 className="font-semibold text-gray-900 mb-1">Our Content</h3>
                <p className="text-gray-600 text-sm">
                  All BotSmith branding, logos, software, and service features remain our exclusive property. You may not use them without our explicit permission.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-rose-100 rounded-lg flex-shrink-0">
                <CreditCard className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">5. Subscription and Payments</h2>
              </div>
            </div>
            
            <div className="pl-0 lg:pl-12 space-y-4">
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-4 border border-rose-200">
                <h3 className="font-semibold text-gray-900 mb-2">Billing</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Subscription fees are billed in advance on a monthly or annual basis depending on your chosen plan. You agree to pay all fees associated with your subscription.
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-2">Refunds</h3>
                <p className="text-gray-600 text-sm">
                  Refunds are provided on a case-by-case basis. Please contact our support team if you have concerns about your subscription.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Auto-Renewal</h3>
                <p className="text-gray-600 text-sm">
                  Subscriptions automatically renew unless canceled before the renewal date. You can cancel anytime through your account settings.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                <h3 className="font-semibold text-gray-900 mb-2">Price Changes</h3>
                <p className="text-gray-600 text-sm">
                  We may change subscription fees with 30 days notice. Continued use after price changes constitutes acceptance of the new fees.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="mb-12">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">6. Termination</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including:
                </p>
              </div>
            </div>
            
            <div className="pl-0 lg:pl-12 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <p className="text-gray-700">Breach of these Terms of Service</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <p className="text-gray-700">Non-payment of fees</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <p className="text-gray-700">Violation of applicable laws or regulations</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <p className="text-gray-700">At our discretion for any other reason</p>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimer of Warranties</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <p className="text-gray-700 leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-gray-700 leading-relaxed mb-3">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, BOTSMITH SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
              </p>
              <p className="text-gray-700 leading-relaxed text-sm">
                Our total liability shall not exceed the amount you paid to us in the 12 months preceding the claim.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Indemnification</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree to indemnify and hold harmless BotSmith and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          {/* Section 10 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which BotSmith operates, without regard to its conflict of law provisions.
            </p>
          </section>

          {/* Section 11 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the Service. Your continued use of the Service after such modifications constitutes your acceptance of the updated Terms.
            </p>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2">
              <p className="text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <strong>Email:</strong> legal@botsmith.io
              </p>
              <p className="text-gray-700 flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-600" />
                <strong>Address:</strong> 123 AI Street, Tech Valley, CA 94000
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;