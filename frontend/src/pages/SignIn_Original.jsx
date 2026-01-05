import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

const SignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [particles, setParticles] = useState([]);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 15 + Math.random() * 20,
      animationDelay: Math.random() * 10,
      size: 4 + Math.random() * 8
    }));
    setParticles(newParticles);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      toast({
        title: 'Welcome back!',
        description: 'Successfully signed in'
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to sign in',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex relative overflow-hidden">
      {/* Enhanced Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient blobs */}
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-blob top-0 -left-40"></div>
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-blob animation-delay-2000 top-32 -right-32"></div>
        <div className="absolute w-[550px] h-[550px] bg-gradient-to-br from-pink-400/25 to-orange-400/25 rounded-full blur-3xl animate-blob animation-delay-4000 -bottom-40 left-1/4"></div>
        
        {/* Floating particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-white/40 rounded-full animate-float"
            style={{
              left: `${particle.left}%`,
              bottom: '-20px',
              animationDuration: `${particle.animationDuration}s`,
              animationDelay: `${particle.animationDelay}s`,
              width: `${particle.size}px`,
              height: `${particle.size}px`
            }}
          />
        ))}
      </div>

      {/* Left Side - Enhanced Form with Glass Morphism */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Premium Glass Card */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-3xl opacity-20 group-hover:opacity-30 blur-xl transition-all duration-500"></div>
            
            {/* Main card */}
            <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 transform transition-all duration-500 hover:shadow-purple-500/20">
              {/* Logo Section with Animation */}
              <div className="flex items-center gap-3 mb-8 group/logo cursor-pointer" onClick={() => navigate('/')}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur-md opacity-40 group-hover/logo:opacity-70 transition-opacity duration-500 animate-pulse-slow"></div>
                  
                  <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-600 rounded-xl flex items-center justify-center transform group-hover/logo:scale-110 group-hover/logo:rotate-6 transition-all duration-500 shadow-lg border border-white/30">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 to-transparent opacity-60"></div>
                    
                    <Sparkles className="w-6 h-6 text-white relative z-10 drop-shadow-md" />
                  </div>
                </div>
                
                <div className="flex flex-col -space-y-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black tracking-tight bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                      BotSmith
                    </span>
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">AI</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 via-pink-600 to-orange-600 bg-clip-text text-transparent animate-gradient">
                  Welcome back
                </h1>
                <p className="text-gray-600 text-lg">Sign in to continue your journey</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input with Enhanced Design */}
                <div className="group/input">
                  <Label htmlFor="email" className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-600" />
                    Email Address
                  </Label>
                  <div className={`relative mt-2 transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField('')}
                      className="pl-4 pr-4 py-6 bg-white/50 backdrop-blur-sm border-2 border-purple-200/50 focus:border-purple-500 rounded-xl transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/20"
                      required
                    />
                    {focusedField === 'email' && (
                      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-xl blur-md"></div>
                    )}
                  </div>
                </div>
                
                {/* Password Input with Toggle */}
                <div className="group/input">
                  <Label htmlFor="password" className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-600" />
                    Password
                  </Label>
                  <div className={`relative mt-2 transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField('')}
                      className="pl-4 pr-12 py-6 bg-white/50 backdrop-blur-sm border-2 border-purple-200/50 focus:border-purple-500 rounded-xl transition-all duration-300 focus:shadow-lg focus:shadow-purple-500/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {focusedField === 'password' && (
                      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-xl blur-md"></div>
                    )}
                  </div>
                </div>
                
                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm cursor-pointer group/check">
                    <input type="checkbox" className="w-4 h-4 rounded border-2 border-purple-300 text-purple-600 focus:ring-purple-500 focus:ring-2 transition-all" />
                    <span className="text-gray-600 group-hover/check:text-purple-600 transition-colors">Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-purple-600 hover:text-pink-600 font-medium transition-colors">
                    Forgot password?
                  </button>
                </div>
                
                {/* Enhanced Submit Button */}
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full relative group/btn overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white py-6 rounded-xl shadow-xl shadow-purple-500/30 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-lg font-semibold">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <Sparkles className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-gradient-to-r from-white/0 via-white/90 to-white/0 text-gray-500 text-sm font-medium">Or continue with</span>
                  </div>
                </div>

                {/* Enhanced Social Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" className="group/social flex items-center justify-center gap-2 px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl hover:border-purple-300 hover:bg-white/80 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 transform hover:scale-105">
                    <svg className="w-5 h-5 group-hover/social:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">Google</span>
                  </button>
                  <button type="button" className="group/social flex items-center justify-center gap-2 px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl hover:border-purple-300 hover:bg-white/80 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 transform hover:scale-105">
                    <svg className="w-5 h-5 group-hover/social:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">GitHub</span>
                  </button>
                </div>
              </form>
              
              <p className="mt-8 text-center text-gray-600">
                Don't have an account?{' '}
                <button onClick={() => navigate('/signup')} className="text-purple-600 font-bold hover:text-pink-600 transition-colors hover:underline">
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Enhanced Animated Gradient with 3D Effects */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500">
          {/* Animated overlay layers */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/50 via-transparent to-pink-600/50 animate-pulse-slow"></div>
          <div className="absolute inset-0 bg-gradient-to-bl from-orange-500/30 via-transparent to-purple-500/30 animate-pulse-slow animation-delay-2000"></div>
          
          {/* Floating shapes */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-40 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-float animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-float animation-delay-4000"></div>
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
            <div className="max-w-md text-center space-y-6 transform hover:scale-105 transition-transform duration-500">
              <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                <Sparkles className="w-16 h-16 animate-pulse" />
              </div>
              <h2 className="text-5xl font-bold drop-shadow-2xl leading-tight">
                Build smarter<br />chatbots faster
              </h2>
              <p className="text-xl opacity-90 drop-shadow-lg">
                Create AI-powered customer support that delights your users in minutes
              </p>
              <div className="flex items-center justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">150+</div>
                  <div className="text-sm opacity-80">Happy Users</div>
                </div>
                <div className="w-px h-12 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold">99.9%</div>
                  <div className="text-sm opacity-80">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
