import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Shield, Lock, Database, CheckCircle, BookOpen, Download } from 'lucide-react';

const SecurityDocs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Scroll to anchor if present
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const downloadSecurityPDF = () => {
    // In a real implementation, this would download the PDF
    alert('Security documentation PDF download coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-purple-200/50 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-semibold">BotSmith</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={downloadSecurityPDF}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-8 max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/resources/articles/security-overview')}
          className="mb-8 hover:bg-purple-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Security Overview
        </Button>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full mb-6">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Security Documentation</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent">
            🔒 Security Documentation
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive security practices, implementation details, and best practices for the BotSmith chatbot platform.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-2xl border-2 border-purple-200/50 p-6 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            Table of Contents
          </h2>
          <div className="space-y-2">
            <a href="#auth" className="block text-purple-600 hover:text-purple-800 hover:underline">
              1. Authentication & Authorization (12 min read)
            </a>
            <a href="#data" className="block text-purple-600 hover:text-purple-800 hover:underline">
              2. Data Protection (10 min read)
            </a>
            <a href="#api" className="block text-purple-600 hover:text-purple-800 hover:underline">
              3. API Security (15 min read)
            </a>
            <a href="#practices" className="block text-purple-600 hover:text-purple-800 hover:underline">
              4. Best Practices (8 min read)
            </a>
          </div>
        </div>

        {/* Article 1: Authentication & Authorization */}
        <div id="auth" className="bg-white rounded-2xl border-2 border-purple-200/50 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">1. Authentication & Authorization</h2>
              <p className="text-gray-600">JWT tokens and user roles • 12 min read</p>
            </div>
          </div>

          <div className="prose max-w-none space-y-4 text-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 mt-6">Overview</h3>
            <p>
              BotSmith implements a robust JWT (JSON Web Token) based authentication system with role-based access control (RBAC) to ensure secure user authentication and authorization.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-6">JWT Token-Based Authentication</h3>
            <h4 className="text-xl font-semibold text-gray-900 mt-4">How It Works</h4>
            <ol className="list-decimal list-inside space-y-2">
              <li><strong>User Registration/Login:</strong> User provides credentials (email + password)</li>
              <li><strong>Token Generation:</strong> Server validates credentials and generates a JWT token</li>
              <li><strong>Token Storage:</strong> Client stores token securely (localStorage/sessionStorage)</li>
              <li><strong>Authenticated Requests:</strong> Client includes token in Authorization header</li>
              <li><strong>Token Validation:</strong> Server validates token for each protected endpoint</li>
            </ol>

            <h4 className="text-xl font-semibold text-gray-900 mt-4">Implementation Details</h4>
            <div className="bg-gray-900 rounded-lg p-4 my-4">
              <pre className="text-green-400 text-sm overflow-x-auto"><code>{`# Security configuration
SECRET_KEY = os.environ.get('SECRET_KEY')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Password hashing using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")`}</code></pre>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mt-6">Password Security</h3>
            <p>
              BotSmith uses <strong>bcrypt</strong> algorithm for password hashing, which provides:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Salting:</strong> Automatic salt generation for each password</li>
              <li><strong>Cost Factor:</strong> Configurable computational cost to resist brute-force attacks</li>
              <li><strong>One-way Hashing:</strong> Passwords cannot be reversed or decrypted</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-900 mt-6">Role-Based Access Control (RBAC)</h3>
            <p>BotSmith implements three distinct user roles:</p>
            <div className="grid md:grid-cols-3 gap-4 my-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-2">User (Standard)</h4>
                <ul className="text-sm space-y-1">
                  <li>• Create and manage chatbots</li>
                  <li>• Access personal analytics</li>
                  <li>• Manage integrations</li>
                </ul>
              </div>
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <h4 className="font-bold text-purple-900 mb-2">Moderator</h4>
                <ul className="text-sm space-y-1">
                  <li>• All user permissions</li>
                  <li>• View system analytics</li>
                  <li>• Moderation tools</li>
                </ul>
              </div>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <h4 className="font-bold text-red-900 mb-2">Admin</h4>
                <ul className="text-sm space-y-1">
                  <li>• Full user management</li>
                  <li>• System configuration</li>
                  <li>• Security audit access</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 my-4">
              <p className="font-semibold text-blue-900">📚 Full Documentation:</p>
              <p className="text-sm text-blue-800">
                For complete implementation details, code examples, and best practices, visit: 
                <a href="https://github.com/botsmith/docs/blob/main/SECURITY.md#1-authentication--authorization" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                  GitHub Documentation
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Article 2: Data Protection */}
        <div id="data" className="bg-white rounded-2xl border-2 border-purple-200/50 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">2. Data Protection</h2>
              <p className="text-gray-600">Encryption and privacy • 10 min read</p>
            </div>
          </div>

          <div className="prose max-w-none space-y-4 text-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 mt-6">Overview</h3>
            <p>
              BotSmith implements comprehensive data protection measures to ensure privacy, confidentiality, and integrity of user data across all system components.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-6">Data Encryption</h3>
            <h4 className="text-xl font-semibold text-gray-900 mt-4">Encryption at Rest</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>MongoDB encryption enabled for production environments</li>
              <li>Field-level encryption for sensitive data</li>
              <li>Encrypted backups with AES-256 encryption</li>
            </ul>

            <h4 className="text-xl font-semibold text-gray-900 mt-4">Encryption in Transit</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>All API communications use HTTPS (TLS 1.2+)</li>
              <li>WebSocket connections use WSS (secure WebSocket)</li>
              <li>Certificate management via Let's Encrypt</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-900 mt-6">GDPR Compliance</h3>
            <p>We implement all GDPR requirements including:</p>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <h4 className="font-bold text-green-900 mb-2">✓ Right to Access</h4>
                <p className="text-sm">Users can export all their data in JSON/CSV format</p>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <h4 className="font-bold text-green-900 mb-2">✓ Right to Deletion</h4>
                <p className="text-sm">Users can delete their account and all associated data</p>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <h4 className="font-bold text-green-900 mb-2">✓ Right to Rectification</h4>
                <p className="text-sm">Users can update their personal information anytime</p>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <h4 className="font-bold text-green-900 mb-2">✓ Data Portability</h4>
                <p className="text-sm">Export data in machine-readable formats</p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mt-6">Data Retention</h3>
            <div className="bg-gray-50 rounded-lg p-4 my-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2">Data Type</th>
                    <th className="text-left py-2">Retention Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2">User Accounts</td>
                    <td className="py-2">Active + 30 days after deletion</td>
                  </tr>
                  <tr>
                    <td className="py-2">Conversations</td>
                    <td className="py-2">90 days (configurable)</td>
                  </tr>
                  <tr>
                    <td className="py-2">Login History</td>
                    <td className="py-2">365 days</td>
                  </tr>
                  <tr>
                    <td className="py-2">Audit Logs</td>
                    <td className="py-2">7 years (compliance)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-600 p-4 my-4">
              <p className="font-semibold text-purple-900">📚 Full Documentation:</p>
              <p className="text-sm text-purple-800">
                For complete implementation details, code examples, and best practices, visit: 
                <a href="https://github.com/botsmith/docs/blob/main/SECURITY.md#2-data-protection" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                  GitHub Documentation
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Article 3: API Security */}
        <div id="api" className="bg-white rounded-2xl border-2 border-purple-200/50 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">3. API Security</h2>
              <p className="text-gray-600">Rate limiting and validation • 15 min read</p>
            </div>
          </div>

          <div className="prose max-w-none space-y-4 text-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 mt-6">Overview</h3>
            <p>
              BotSmith implements multiple layers of API security to protect against common vulnerabilities, abuse, and unauthorized access.
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mt-6">Rate Limiting</h3>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 my-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-yellow-900 mb-2">Per Minute Limit</h4>
                  <p className="text-2xl font-bold text-yellow-700">200 requests</p>
                </div>
                <div>
                  <h4 className="font-bold text-yellow-900 mb-2">Per Hour Limit</h4>
                  <p className="text-2xl font-bold text-yellow-700">5,000 requests</p>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mt-6">Input Validation</h3>
            <p>All API endpoints use Pydantic models for validation:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Type checking and validation</li>
              <li>Length constraints</li>
              <li>Pattern matching (regex)</li>
              <li>Custom validation logic</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-900 mt-6">Security Headers</h3>
            <div className="bg-gray-50 rounded-lg p-4 my-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2">Header</th>
                    <th className="text-left py-2">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 font-mono text-xs">X-Content-Type-Options</td>
                    <td className="py-2">Prevent MIME-sniffing</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-xs">X-Frame-Options</td>
                    <td className="py-2">Prevent clickjacking</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-xs">Strict-Transport-Security</td>
                    <td className="py-2">Force HTTPS</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-xs">Content-Security-Policy</td>
                    <td className="py-2">Control resource loading</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mt-6">Protection Against</h3>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                <p className="font-semibold text-red-900">✓ SQL/NoSQL Injection</p>
              </div>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                <p className="font-semibold text-red-900">✓ Cross-Site Scripting (XSS)</p>
              </div>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                <p className="font-semibold text-red-900">✓ CSRF Attacks</p>
              </div>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                <p className="font-semibold text-red-900">✓ DDoS Attacks</p>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 p-4 my-4">
              <p className="font-semibold text-green-900">📚 Full Documentation:</p>
              <p className="text-sm text-green-800">
                For complete implementation details, code examples, and best practices, visit: 
                <a href="https://github.com/botsmith/docs/blob/main/SECURITY.md#3-api-security" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                  GitHub Documentation
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Article 4: Best Practices */}
        <div id="practices" className="bg-white rounded-2xl border-2 border-purple-200/50 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">4. Best Practices</h2>
              <p className="text-gray-600">Security guidelines • 8 min read</p>
            </div>
          </div>

          <div className="prose max-w-none space-y-4 text-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 mt-6">Development Security Guidelines</h3>
            
            <h4 className="text-xl font-semibold text-gray-900 mt-4">✅ DO:</h4>
            <ul className="list-disc list-inside space-y-2 bg-green-50 border-l-4 border-green-600 p-4">
              <li>Always validate and sanitize user input</li>
              <li>Use environment variables for secrets</li>
              <li>Log errors internally, return generic messages</li>
              <li>Use parameterized database queries</li>
              <li>Keep dependencies updated regularly</li>
            </ul>

            <h4 className="text-xl font-semibold text-gray-900 mt-4">❌ DON'T:</h4>
            <ul className="list-disc list-inside space-y-2 bg-red-50 border-l-4 border-red-600 p-4">
              <li>Never hardcode API keys or secrets</li>
              <li>Don't expose internal errors to users</li>
              <li>Never use string concatenation for queries</li>
              <li>Don't trust user input without validation</li>
              <li>Never commit secrets to version control</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-900 mt-6">User Security Guidelines</h3>
            <div className="grid md:grid-cols-2 gap-6 my-4">
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Account Security</h4>
                <ul className="text-sm space-y-2">
                  <li>✓ Use strong, unique passwords (12+ chars)</li>
                  <li>✓ Enable 2FA when available</li>
                  <li>✓ Review login history regularly</li>
                  <li>✓ Log out from shared devices</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-3">API Key Management</h4>
                <ul className="text-sm space-y-2">
                  <li>✓ Store keys in environment variables</li>
                  <li>✓ Rotate keys every 90 days</li>
                  <li>✓ Use different keys for dev/prod</li>
                  <li>✓ Revoke compromised keys immediately</li>
                </ul>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mt-6">Compliance Frameworks</h3>
            <div className="grid md:grid-cols-3 gap-4 my-4">
              <div className="text-center bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-2">GDPR</h4>
                <p className="text-sm text-blue-700">Data Protection Regulation</p>
              </div>
              <div className="text-center bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <h4 className="font-bold text-purple-900 mb-2">SOC 2</h4>
                <p className="text-sm text-purple-700">Service Organization Control</p>
              </div>
              <div className="text-center bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <h4 className="font-bold text-red-900 mb-2">OWASP Top 10</h4>
                <p className="text-sm text-red-700">Security Best Practices</p>
              </div>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-600 p-4 my-4">
              <p className="font-semibold text-orange-900">📚 Full Documentation:</p>
              <p className="text-sm text-orange-800">
                For complete implementation details, code examples, and best practices, visit: 
                <a href="https://github.com/botsmith/docs/blob/main/SECURITY.md#4-best-practices" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                  GitHub Documentation
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Security Contact */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-8 text-white text-center">
          <Shield className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Report Security Vulnerabilities</h2>
          <p className="text-lg mb-6 opacity-90">
            Found a security issue? Please report it privately to our security team.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="secondary"
              className="bg-white text-red-600 hover:bg-gray-100"
              onClick={() => window.location.href = 'mailto:security@botsmith.com'}
            >
              📧 security@botsmith.com
            </Button>
            <Button
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10"
              onClick={() => window.open('https://github.com/botsmith/security', '_blank')}
            >
              View Bug Bounty Program
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDocs;
