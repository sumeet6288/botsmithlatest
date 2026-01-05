/**
 * Google OAuth Authentication Button Component
 * 
 * This component provides a button for signing in with Google via Supabase.
 */

import React, { useState } from 'react';
import { signInWithGoogle, isSupabaseConfigured } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';

const GoogleAuthButton = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured) {
      toast.error('Google authentication is not configured');
      return;
    }

    setLoading(true);

    try {
      await signInWithGoogle();
      // The user will be redirected to Google OAuth page
      // After successful authentication, they'll be redirected to /auth/callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          Google authentication is not configured.
          <br />
          Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      <span className="text-gray-700 font-medium">
        {loading ? 'Signing in...' : 'Continue with Google'}
      </span>
    </button>
  );
};

export default GoogleAuthButton;
