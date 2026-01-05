import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { isSupabaseConfigured, resetPasswordForEmail } from '../lib/supabaseClient';
import api from '../utils/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const useSupabase = isSupabaseConfigured;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      if (useSupabase) {
        // Use Supabase password reset
        await resetPasswordForEmail(email);
        setEmailSent(true);
        toast.success('Password reset email sent! Check your inbox.');
      } else {
        // Use legacy password reset
        await api.post('/auth/forgot-password', { email });
        setEmailSent(true);
        toast.success('Password reset instructions sent to your email!');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to send reset email. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                <Bot className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-600">
              {emailSent 
                ? "Check your email for reset instructions"
                : "No worries! Enter your email and we'll send you reset instructions"
              }
            </p>
          </div>

          {/* Supabase Info Banner */}
          {useSupabase && !emailSent && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">Secure Password Reset</p>
                <p>You'll receive a secure password reset link via email from Supabase Auth.</p>
              </div>
            </div>
          )}

          {emailSent ? (
            /* Success State */
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Sent!</h3>
                <p className="text-gray-600 text-sm">
                  We've sent password reset instructions to <strong>{email}</strong>
                </p>
                <p className="text-gray-500 text-xs mt-3">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                {useSupabase && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-green-100">
                    <p className="text-xs text-gray-500">
                      📧 The email will contain a secure link that expires in 1 hour.
                      Click the link to set your new password.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/signin')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                >
                  Back to Sign In
                </button>
                <button
                  onClick={() => setEmailSent(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                >
                  Try Different Email
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-600" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 shadow-lg disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>

              {/* Back to Sign In */}
              <button
                type="button"
                onClick={() => navigate('/signin')}
                className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-purple-600 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </form>
          )}
        </div>

        {/* Additional Help */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Need help? <a href="mailto:support@botsmith.io" className="text-purple-600 hover:text-pink-600 font-semibold">Contact Support</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
