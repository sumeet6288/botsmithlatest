/**
 * Supabase OAuth Callback Page
 * 
 * This page handles the redirect after successful Google OAuth authentication.
 * It extracts the session from URL, syncs with backend, and redirects to dashboard.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const SupabaseCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing authentication...');
  const [error, setError] = useState(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured');
      toast.error('Authentication service not configured');
      setTimeout(() => navigate('/signin'), 2000);
      return;
    }

    try {
      setStatus('Verifying your credentials...');

      // Get the session from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }

      if (!session) {
        throw new Error('No session found. Please try signing in again.');
      }

      const token = session.access_token;
      const user = session.user;

      console.log('✅ Supabase session obtained:', {
        userId: user.id,
        email: user.email,
        provider: user.app_metadata?.provider
      });

      setStatus('Syncing with backend...');

      // Sync user with backend
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await axios.post(
        `${backendUrl}/api/auth/supabase/verify`,
        { token },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        console.log('✅ User synced with backend:', response.data.user);

        // Store token and user data in localStorage
        localStorage.setItem('supabase_token', token);
        localStorage.setItem('supabase_user', JSON.stringify(response.data.user));
        localStorage.setItem('token', token); // For compatibility with existing auth
        localStorage.setItem('user', JSON.stringify(response.data.user));

        setStatus('Success! Redirecting to dashboard...');
        toast.success('Successfully signed in!');

        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        throw new Error(response.data.message || 'Backend sync failed');
      }
    } catch (err) {
      console.error('❌ Authentication callback error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Authentication failed';
      setError(errorMessage);
      toast.error(errorMessage);

      // Redirect to signin after error
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            BotSmith AI
          </h1>

          {/* Status or Error */}
          {error ? (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-red-900 mb-1">
                      Authentication Failed
                    </h3>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center">
                Redirecting to sign in page...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Loading Spinner */}
              <div className="flex justify-center">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
                </div>
              </div>

              {/* Status Message */}
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-gray-900">{status}</p>
                <p className="text-sm text-gray-600">
                  Please wait while we complete the sign-in process
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Google authentication</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${status.includes('backend') || status.includes('Success') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm text-gray-600">Account verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${status.includes('Success') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm text-gray-600">Setting up your dashboard</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Secured by Supabase Authentication
        </p>
      </div>
    </div>
  );
};

export default SupabaseCallback;
