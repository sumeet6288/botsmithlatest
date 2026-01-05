import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Bot, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { isSupabaseConfigured, updatePassword, supabase } from '../lib/supabaseClient';
import api from '../utils/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // For legacy auth
  const legacyToken = searchParams.get('token');
  
  // For Supabase auth - check for hash parameters
  const [isSupabaseReset, setIsSupabaseReset] = useState(false);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const useSupabase = isSupabaseConfigured;

  useEffect(() => {
    checkResetMethod();
  }, [location]);

  const checkResetMethod = async () => {
    if (useSupabase) {
      // Check if this is a Supabase password reset
      // Supabase sends the recovery token in the URL hash
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const type = hashParams.get('type');
      
      if (type === 'recovery') {
        setIsSupabaseReset(true);
        setTokenValid(true);
        
        // Supabase automatically handles the token exchange
        // We just need to wait for the user to set a new password
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log('✅ Supabase recovery session established');
          }
        } catch (error) {
          console.error('Error checking Supabase session:', error);
        }
      } else if (!legacyToken) {
        setTokenValid(false);
        toast.error('Invalid or missing reset token');
      }
    } else {
      // Legacy auth - check for token parameter
      if (!legacyToken) {
        setTokenValid(false);
        toast.error('Invalid or missing reset token');
      }
    }
  };

  const validatePassword = () => {
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) return;

    setIsLoading(true);

    try {
      if (useSupabase && isSupabaseReset) {
        // Use Supabase to update password
        await updatePassword(password);
        
        setResetSuccess(true);
        toast.success('Password updated successfully!');
        
        // Redirect to sign in after 2 seconds
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      } else {
        // Use legacy password reset
        await api.post('/auth/reset-password', { 
          token: legacyToken, 
          new_password: password 
        });
        
        setResetSuccess(true);
        toast.success('Password reset successfully!');
        
        // Redirect to sign in after 2 seconds
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to reset password. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h1>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              Reset Your Password
            </h1>
            <p className="text-gray-600">
              {resetSuccess 
                ? "Your password has been updated successfully"
                : "Enter your new password below"
              }
            </p>
          </div>

          {/* Supabase Info Banner */}
          {useSupabase && isSupabaseReset && !resetSuccess && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">Secure Password Reset</p>
                <p>Your password will be updated securely via Supabase Auth.</p>
              </div>
            </div>
          )}

          {resetSuccess ? (
            /* Success State */
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Reset Successful!</h3>
                <p className="text-gray-600 text-sm">
                  Your password has been updated. You can now sign in with your new password.
                </p>
              </div>

              <button
                onClick={() => navigate('/signin')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Must be at least 8 characters long</p>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
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
                    Resetting Password...
                  </span>
                ) : (
                  'Reset Password'
                )}
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

export default ResetPassword;
