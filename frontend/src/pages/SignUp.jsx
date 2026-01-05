import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Shield } from 'lucide-react';
import BotSmithLogo from '../components/BotSmithLogo';
import GoogleAuthButton from '../components/GoogleAuthButton';

const SignUp = () => {
  const navigate = useNavigate();
  const [particles, setParticles] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 15 + Math.random() * 25,
      animationDelay: Math.random() * 10,
      size: 3 + Math.random() * 10
    }));
    setParticles(newParticles);
  }, []);

  // Track mouse for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex relative overflow-hidden">
      {/* Enhanced Animated background with parallax - REDUCED BLUR */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
        }}
      >
        {/* Large gradient blobs with morph animation - REDUCED BLUR */}
        <div className="absolute w-[700px] h-[700px] bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-xl animate-blob animate-morph top-0 -right-40"></div>
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-purple-400/18 to-cyan-400/15 rounded-full blur-xl animate-blob animation-delay-2000 animate-morph top-32 -left-32"></div>
        <div className="absolute w-[650px] h-[650px] bg-gradient-to-br from-pink-400/18 to-purple-400/20 rounded-full blur-xl animate-blob animation-delay-4000 animate-morph -bottom-40 right-1/4"></div>
        
        {/* Floating particles with enhanced animations */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute bg-white/30 rounded-full animate-float-up-down"
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

      {/* Left Side - Enhanced Animated Gradient - REDUCED BLUR */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500">
          {/* Animated overlay layers */}
          <div className="absolute inset-0 bg-gradient-to-tl from-purple-600/60 via-transparent to-orange-600/60 animate-pulse-slow"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/40 via-transparent to-purple-500/40 animate-pulse-slow animation-delay-2000"></div>
          
          {/* Floating shapes with morph - REDUCED BLUR */}
          <div className="absolute top-40 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-float-up-down animate-morph"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-float-up-down animation-delay-2000 animate-morph"></div>
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float-up-down animation-delay-4000 animate-morph"></div>
          
          {/* Content with animations */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
            <div className="max-w-md text-center space-y-8 transform hover:scale-105 transition-transform duration-700">
              <div className="inline-block p-5 bg-white/20 rounded-3xl mb-6 animate-bounce-in">
                <Shield className="w-20 h-20 animate-neon-glow" />
              </div>
              <h2 className="text-6xl font-black font-display drop-shadow-2xl leading-tight animate-slide-in-left">
                Join BotSmith<br />today
              </h2>
              <p className="text-xl font-body opacity-95 drop-shadow-xl animate-slide-in-left stagger-1">
                Start building AI agents that delight customers and drive growth
              </p>
              <div className="flex items-center justify-center gap-12 mt-10 animate-fade-in-scale stagger-2">
                <div className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className="text-4xl font-black font-heading">Free</div>
                  <div className="text-sm opacity-90 font-body">To Start</div>
                </div>
                <div className="w-px h-16 bg-white/40"></div>
                <div className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className="text-4xl font-black font-heading">5 min</div>
                  <div className="text-sm opacity-90 font-body">Setup Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Enhanced Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 relative z-10">
        <div className="w-full max-w-lg transform md:scale-[0.95]">
          {/* Premium Glass Card with entrance animation - CRISP & CLEAR */}
          <div className="relative group card-entrance">
            {/* Animated glow effect - REDUCED BLUR */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 rounded-3xl opacity-10 group-hover:opacity-20 blur-lg transition-all duration-700 animate-rainbow"></div>
            
            {/* Main card - CRISP WHITE BACKGROUND */}
            <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl p-4 sm:p-6 border border-gray-200 transform transition-all duration-500 hover:shadow-purple-500/20">
              {/* Logo Section with enhanced animations */}
              <div className="flex items-center gap-2 mb-4 sm:mb-6 group/logo cursor-pointer animate-slide-in-top" onClick={() => navigate('/')}>
                {/* Beautiful "B" Logo */}
                <BotSmithLogo size="sm" showGlow={true} animate={false} />
                
                <div className="flex flex-col -space-y-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black font-heading tracking-tight bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent animate-rainbow">
                      BotSmith
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full animate-bounce-in stagger-1">AI</span>
                  </div>
                </div>
              </div>
              
              {/* Heading with stagger animation */}
              <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-black font-heading bg-gradient-to-r from-purple-700 via-pink-600 to-orange-600 bg-clip-text text-transparent animate-slide-in-right leading-tight">
                  Create your account
                </h1>
                <p className="text-gray-600 text-sm sm:text-base font-body animate-slide-in-right stagger-1">Start building your AI agents today</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Name Input */}
                <div className="group/input animate-fade-in-scale stagger-2">
                  <Label htmlFor="name" className="text-gray-700 font-semibold mb-1.5 flex items-center gap-1.5 font-heading text-sm">
                    <User className="w-3.5 h-3.5 text-purple-600" />
                    Full Name
                  </Label>
                  <div className={`relative mt-1.5 transition-all duration-500 ${focusedField === 'name' ? 'scale-[1.02] shadow-xl shadow-purple-500/20' : ''}`}>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField('')}
                      className="pl-3 pr-3 py-5 font-body text-sm bg-white border-2 border-purple-200 focus:border-purple-500 focus:bg-white rounded-xl transition-all duration-500 focus:shadow-xl focus:shadow-purple-500/20"
                      required
                    />
                    {focusedField === 'name' && (
                      <>
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-xl blur-md animate-neon-glow"></div>
                        <div className="absolute -top-0.5 left-3 right-3 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full"></div>
                      </>
                    )}
                  </div>
                </div>

                {/* Email Input */}
                <div className="group/input animate-fade-in-scale stagger-3">
                  <Label htmlFor="email" className="text-gray-700 font-semibold mb-1.5 flex items-center gap-1.5 font-heading text-sm">
                    <Mail className="w-3.5 h-3.5 text-purple-600" />
                    Email Address
                  </Label>
                  <div className={`relative mt-1.5 transition-all duration-500 ${focusedField === 'email' ? 'scale-[1.02] shadow-xl shadow-purple-500/20' : ''}`}>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField('')}
                      className="pl-3 pr-3 py-5 font-body text-sm bg-white border-2 border-purple-200 focus:border-purple-500 focus:bg-white rounded-xl transition-all duration-500 focus:shadow-xl focus:shadow-purple-500/20"
                      required
                    />
                    {focusedField === 'email' && (
                      <>
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-xl blur-md animate-neon-glow"></div>
                        <div className="absolute -top-0.5 left-3 right-3 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full"></div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Password Input with Strength Indicator */}
                <div className="group/input animate-fade-in-scale stagger-4">
                  <Label htmlFor="password" className="text-gray-700 font-semibold mb-1.5 flex items-center gap-1.5 font-heading text-sm">
                    <Lock className="w-3.5 h-3.5 text-purple-600" />
                    Password
                  </Label>
                  <div className={`relative mt-1.5 transition-all duration-500 ${focusedField === 'password' ? 'scale-[1.02] shadow-xl shadow-purple-500/20' : ''}`}>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField('')}
                      className="pl-3 pr-12 py-5 font-body text-sm bg-white border-2 border-purple-200 focus:border-purple-500 focus:bg-white rounded-xl transition-all duration-500 focus:shadow-xl focus:shadow-xl focus:shadow-purple-500/20 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-contacts-auto-fill-button]:hidden"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-all duration-300 hover:scale-110"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {focusedField === 'password' && (
                      <>
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-xl blur-md animate-neon-glow"></div>
                        <div className="absolute -top-0.5 left-3 right-3 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full"></div>
                      </>
                    )}
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-3 space-y-2 animate-fade-in">
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                              i < passwordStrength.score ? getStrengthColor() + ' animate-scale-in-entrance' : 'bg-gray-200'
                            }`}
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-bold font-heading ${
                          passwordStrength.score <= 1 ? 'text-red-500' :
                          passwordStrength.score === 2 ? 'text-orange-500' :
                          passwordStrength.score === 3 ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                          {getStrengthText()}
                        </span>
                        <div className="flex gap-2">
                          <span className={`flex items-center gap-0.5 font-body ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                            {passwordStrength.checks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            8+ chars
                          </span>
                          <span className={`flex items-center gap-0.5 font-body ${passwordStrength.checks.number ? 'text-green-600' : 'text-gray-400'}`}>
                            {passwordStrength.checks.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            Number
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Enhanced Submit Button */}
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full relative group/btn overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white py-4 sm:py-5 rounded-xl shadow-2xl shadow-purple-500/40 transform hover:scale-[1.02] hover:shadow-3xl hover:shadow-purple-500/50 transition-all duration-500 btn-ripple animate-bounce-in stagger-5 mt-4 sm:mt-6"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-sm sm:text-base font-bold font-heading">
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account
                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                  <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-0 left-1/4 w-2 h-full bg-white/20 blur-sm transform -skew-x-12"></div>
                    <div className="absolute top-0 right-1/4 w-2 h-full bg-white/20 blur-sm transform -skew-x-12"></div>
                  </div>
                </Button>

                {/* Divider */}
                <div className="relative my-4 sm:my-5 animate-fade-in-scale stagger-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-gradient-to-r from-white/0 via-white/95 to-white/0 text-gray-500 text-xs font-semibold font-body">Or continue with</span>
                  </div>
                </div>

                {/* Google Auth Button (Supabase) */}
                <div className="animate-slide-in-bottom-entrance stagger-6">
                  <GoogleAuthButton />
                </div>
              </form>
              
              <p className="mt-4 sm:mt-6 text-center text-gray-600 font-body animate-fade-in text-sm">
                Already have an account?{' '}
                <button onClick={() => navigate('/signin')} className="text-purple-600 font-bold font-heading hover:text-pink-600 transition-colors hover:underline inline-flex items-center gap-1">
                  Sign in
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </p>

              {/* Trust Badges & Quick Benefits */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200/50">
                {/* Security Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-5 animate-fade-in-scale">
                  <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-600 group/badge cursor-default">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md group-hover/badge:scale-110 transition-transform">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="font-semibold font-body">SSL Secure</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-600 group/badge cursor-default">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md group-hover/badge:scale-110 transition-transform">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="font-semibold font-body">Encrypted</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-600 group/badge cursor-default">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-md group-hover/badge:scale-110 transition-transform">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                    </div>
                    <span className="font-semibold font-body">GDPR</span>
                  </div>
                </div>

                {/* Quick Benefits */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4 animate-fade-in-scale stagger-1">
                  <div className="text-center group/benefit cursor-default">
                    <div className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 mb-1 sm:mb-1.5 group-hover/benefit:scale-110 transition-transform">
                      <span className="text-base sm:text-lg">⚡</span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-semibold text-gray-700 font-body leading-tight">Fast Setup</p>
                  </div>
                  <div className="text-center group/benefit cursor-default">
                    <div className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 mb-1 sm:mb-1.5 group-hover/benefit:scale-110 transition-transform">
                      <span className="text-base sm:text-lg">🎯</span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-semibold text-gray-700 font-body leading-tight">No Coding</p>
                  </div>
                  <div className="text-center group/benefit cursor-default">
                    <div className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 mb-1 sm:mb-1.5 group-hover/benefit:scale-110 transition-transform">
                      <span className="text-base sm:text-lg">🌍</span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-semibold text-gray-700 font-body leading-tight">Multi-Lang</p>
                  </div>
                </div>

                {/* Footer Links */}
                <div className="text-center text-[9px] sm:text-[10px] text-gray-500 font-body animate-fade-in stagger-2">
                  <button onClick={() => navigate('/privacy-policy')} className="hover:text-purple-600 transition-colors">Privacy Policy</button>
                  <span className="mx-1 sm:mx-2">•</span>
                  <button onClick={() => navigate('/terms-of-service')} className="hover:text-purple-600 transition-colors">Terms of Service</button>
                  <span className="mx-1 sm:mx-2">•</span>
                  <button onClick={() => navigate('/resources/help-center')} className="hover:text-purple-600 transition-colors">Help Center</button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center animate-fade-in">
            <p className="text-xs sm:text-sm text-gray-500 font-body">
              © 2025 BotSmith. All rights reserved.
            </p>
            <p className="text-xs sm:text-sm text-gray-600 font-body mt-1">
              Made with <span className="text-red-500 animate-heartbeat inline-block">❤️</span> for better conversations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
