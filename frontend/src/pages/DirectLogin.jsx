import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const DirectLogin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying login token...');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('No login token provided');
      setTimeout(() => navigate('/signin'), 3000);
      return;
    }

    verifyAndLogin(token);
  }, [searchParams, navigate]);

  const verifyAndLogin = async (token) => {
    try {
      // Verify the token
      const response = await axios.post(
        `${backendUrl}/api/admin/direct-login/verify-token`,
        null,
        {
          params: { token }
        }
      );

      if (response.data.success && response.data.user) {
        const user = response.data.user;
        
        // Clear any existing session first
        localStorage.removeItem('botsmith_token');
        localStorage.removeItem('botsmith_user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        
        // Store user data in localStorage using correct keys for AuthContext
        localStorage.setItem('botsmith_token', token);
        localStorage.setItem('botsmith_user', JSON.stringify(user));
        
        setUserData(user);
        setStatus('success');
        setMessage(`Successfully logged in as ${user.name || user.email}`);
        
        toast.success(
          `🔐 Direct Login Successful\nLogged in as: ${user.name || user.email}\nRole: ${user.role || 'user'}`,
          { duration: 4000 }
        );
        
        // Redirect based on user role after 2 seconds
        setTimeout(() => {
          // Force page reload to ensure AuthContext picks up new user
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Direct login error:', error);
      setStatus('error');
      setMessage(
        error.response?.data?.detail || 
        error.message || 
        'Failed to verify login token'
      );
      
      toast.error('Failed to login');
      
      // Redirect to signin after 3 seconds
      setTimeout(() => navigate('/signin'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-4">
            <Shield className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Direct Login
          </h1>
          <p className="text-gray-600">
            Secure admin access
          </p>
        </div>

        {/* Status Card */}
        <div className={`p-6 rounded-xl border-2 ${
          status === 'verifying' ? 'bg-blue-50 border-blue-200' :
          status === 'success' ? 'bg-green-50 border-green-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {status === 'verifying' && (
                <Loader className="w-6 h-6 text-blue-600 animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
              {status === 'error' && (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className={`font-semibold mb-1 ${
                status === 'verifying' ? 'text-blue-900' :
                status === 'success' ? 'text-green-900' :
                'text-red-900'
              }`}>
                {status === 'verifying' && 'Verifying Token...'}
                {status === 'success' && 'Login Successful!'}
                {status === 'error' && 'Login Failed'}
              </h3>
              <p className={`text-sm ${
                status === 'verifying' ? 'text-blue-700' :
                status === 'success' ? 'text-green-700' :
                'text-red-700'
              }`}>
                {message}
              </p>
            </div>
          </div>

          {/* User Info (on success) */}
          {status === 'success' && userData && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold text-gray-900">{userData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-gray-900">{userData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    {userData.role || 'user'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Redirecting message */}
        {status === 'success' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Redirecting to dashboard in 2 seconds...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Redirecting to sign in page in 3 seconds...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectLogin;
