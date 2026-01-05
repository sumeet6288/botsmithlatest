import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(formData.name, formData.email, formData.password);
      toast({
        title: 'Account created!',
        description: 'Welcome to BotSmith'
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create account',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-blob top-0 -left-20"></div>
        <div className="absolute w-96 h-96 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl animate-blob animation-delay-2000 top-20 right-0"></div>
        <div className="absolute w-96 h-96 bg-gradient-to-br from-pink-300/25 to-orange-300/25 rounded-full blur-3xl animate-blob animation-delay-4000 bottom-0 left-1/3"></div>
      </div>

      {/* Left Side - Animated Gradient */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-400 to-orange-400">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/50 via-transparent to-pink-500/50 animate-pulse-slow"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <h2 className="text-4xl font-bold mb-4">Join BotSmith today</h2>
              <p className="text-xl opacity-90">Start building AI agents that delight customers</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
          <div className="flex items-center gap-3 mb-8 group cursor-pointer" onClick={() => navigate('/')}>
            {/* Premium 3D Logo - Compact Version */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              
              <div className="relative w-10 h-10 bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 shadow-lg border border-white/20">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent opacity-50"></div>
                
                <svg className="w-6 h-6 text-white relative z-10 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C11.45 2 11 2.45 11 3V4H7C5.89 4 5 4.89 5 6V18C5 19.11 5.89 20 7 20H17C18.11 20 19 19.11 19 18V6C19 4.89 18.11 4 17 4H13V3C13 2.45 12.55 2 12 2M7 6H17V18H7V6Z"/>
                  <circle cx="9" cy="10" r="1.5"/>
                  <circle cx="15" cy="10" r="1.5"/>
                  <path d="M9 14C9 14 10 15.5 12 15.5S15 14 15 14" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round"/>
                  <circle cx="12" cy="3" r="1"/>
                </svg>
              </div>
            </div>
            
            <div className="flex flex-col -space-y-0.5">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                  BotSmith
                </span>
                <span className="text-[8px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">AI</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">Create your account</h1>
          <p className="text-gray-600 mb-8">Start building your AI agents today</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-2"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="mt-2"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="mt-2"
                required
              />
            </div>
            
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 shadow-lg shadow-purple-500/30 transform hover:scale-[1.02] transition-all duration-300" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons (Mock) */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
              <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">GitHub</span>
              </button>
            </div>
          </form>
          
          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <button onClick={() => navigate('/signin')} className="text-purple-600 font-semibold hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
