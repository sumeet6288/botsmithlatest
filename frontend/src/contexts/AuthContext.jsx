import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  supabase, 
  isSupabaseConfigured, 
  signOut as supabaseSignOut,
  onAuthStateChange 
} from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize authentication on mount
    if (isSupabaseConfigured) {
      initializeSupabaseAuth();
    } else {
      initializeLegacyAuth();
    }
  }, []);

  const initializeSupabaseAuth = () => {
    // Set up Supabase auth state listener for Google OAuth
    const unsubscribe = onAuthStateChange(async (event, session) => {
      console.log('Supabase auth event:', event);
      
      if (session?.user) {
        // User is signed in with Google OAuth
        await syncSupabaseUser(session.access_token);
      } else {
        // User is signed out
        setUser(null);
        setLoading(false);
      }
    });

    // Check current session
    checkSupabaseSession();

    return unsubscribe;
  };

  const initializeLegacyAuth = () => {
    // Check if user is already logged in (admin or legacy users)
    const token = localStorage.getItem('botsmith_token');
    if (token && token !== 'mock-token-for-development') {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  };

  const checkSupabaseSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await syncSupabaseUser(session.access_token);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking Supabase session:', error);
      setLoading(false);
    }
  };

  const syncSupabaseUser = async (supabaseToken) => {
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      
      // Call backend to sync Supabase user with MongoDB
      const response = await fetch(`${backendUrl}/api/auth/supabase/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_token: supabaseToken
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store our app's token
        localStorage.setItem('botsmith_token', data.access_token);
        
        // Set user data
        setUser(data.user);
        localStorage.setItem('botsmith_user', JSON.stringify(data.user));
        
        console.log('✅ User synced from Supabase:', data.user.email);
      } else {
        console.error('Failed to sync Supabase user with backend');
        // Clear local storage on error
        localStorage.removeItem('botsmith_token');
        localStorage.removeItem('botsmith_user');
        setUser(null);
      }
    } catch (error) {
      console.error('Error syncing Supabase user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const token = localStorage.getItem('botsmith_token');
      
      if (!token || token === 'mock-token-for-development') {
        setUser(null);
        setLoading(false);
        return null;
      }
      
      const response = await fetch(`${backendUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('botsmith_user', JSON.stringify(userData));
        setLoading(false);
        return userData;
      } else if (response.status === 401) {
        // Token is invalid/expired (401 Unauthorized), clear it
        console.warn('Token expired or invalid (401), clearing authentication');
        localStorage.removeItem('botsmith_token');
        localStorage.removeItem('botsmith_user');
        setUser(null);
        setLoading(false);
        return null;
      } else {
        // Other error (500, 503, etc.) - keep token, just log error
        console.error('Error fetching user (status ' + response.status + '), keeping token for retry');
        setLoading(false);
        return null;
      }
    } catch (error) {
      // Network error or timeout - keep token, don't log user out
      console.error('Network error fetching user (keeping token for retry):', error);
      setLoading(false);
      return null;
    }
  };

  // Legacy login for admin users only (via DirectLogin page)
  const loginLegacy = async (email, password) => {
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('botsmith_token', data.access_token);
      
      // Fetch user data
      await fetchCurrentUser();
      setLoading(false);
      return { data };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        // Sign out from Supabase (Google OAuth)
        await supabaseSignOut();
      } else {
        // Legacy logout
        const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        const token = localStorage.getItem('botsmith_token');
        
        if (token) {
          await fetch(`${backendUrl}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('botsmith_token');
      localStorage.removeItem('botsmith_user');
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('botsmith_user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    // Force refresh user data from API
    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await syncSupabaseUser(session.access_token);
      }
    } else {
      return await fetchCurrentUser();
    }
  };

  const value = {
    user,
    loading,
    loginLegacy, // For admin login only
    logout,
    updateUser,
    fetchCurrentUser,
    refreshUser,
    isSupabaseConfigured, // Expose Supabase configuration status
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
