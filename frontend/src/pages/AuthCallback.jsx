/**
 * Supabase OAuth Callback Handler
 * 
 * This page handles the OAuth redirect after successful Google authentication.
 * It verifies the Supabase session and syncs the user to the local database.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Get Supabase session
      const session = await getSession();

      if (!session) {
        setStatus('error');
        toast.error('No session found. Please try signing in again.');
        setTimeout(() => navigate('/signin'), 2000);
        return;
      }

      // Verify and sync user with backend
      const response = await axios.post(
        `${API_URL}/api/auth/supabase/callback`,
        { access_token: session.access_token },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.access_token) {
        // Store our app's JWT token
        localStorage.setItem('botsmith_token', response.data.access_token);
        localStorage.setItem('botsmith_user', JSON.stringify(response.data.user));

        setStatus('success');
        toast.success('Successfully signed in!');

        // Redirect to dashboard
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        throw new Error('Failed to sync user data');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      toast.error(error.response?.data?.detail || 'Authentication failed');
      setTimeout(() => navigate('/signin'), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Completing Sign In
              </h2>
              <p className="text-gray-600">
                Please wait while we set up your account...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Success!
              </h2>
              <p className="text-gray-600">
                Redirecting to your dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600">
                Redirecting to sign in page...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
