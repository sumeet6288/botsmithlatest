import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { Mail, Sparkles, Shield, CheckCircle2, ArrowLeft } from 'lucide-react';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [particles, setParticles] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const inputRefs = useRef([]);

  // Get email from navigation state
  const email = location.state?.email || 'your email';

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

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Take only the last digit
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newCode = [...code];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (/^\d+$/.test(pastedData[i])) {
        newCode[i] = pastedData[i];
      }
    }
    
    setCode(newCode);
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newCode.findIndex(c => !c);
    const focusIndex = nextEmptyIndex === -1 ? 5 : Math.min(nextEmptyIndex, 5);
    inputRefs.current[focusIndex]?.focus();
    setFocusedIndex(focusIndex);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter all 6 digits',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Demo validation - check if code is 000000
      if (verificationCode === '000000') {
        toast({
          title: 'Email Verified! 🎉',
          description: 'Your email has been successfully verified. Welcome to BotSmith!'
        });
        
        // Redirect to dashboard after 1 second (user is already logged in from signup)
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        toast({
          title: 'Invalid Code',
          description: 'The verification code you entered is incorrect',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify code. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    toast({
      title: 'Code Resent! 📧',
      description: 'A new verification code has been sent to your email'
    });
    // Clear the code inputs
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    setFocusedIndex(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex relative overflow-hidden">
      {/* Enhanced Animated background with parallax */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
        }}
      >
        {/* Large gradient blobs with morph animation */}
        <div className="absolute w-[700px] h-[700px] bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-blob animate-morph top-0 -left-40"></div>
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-xl animate-blob animation-delay-2000 animate-morph top-32 -right-32"></div>
        <div className="absolute w-[650px] h-[650px] bg-gradient-to-br from-pink-400/18 to-orange-400/18 rounded-full blur-xl animate-blob animation-delay-4000 animate-morph -bottom-40 left-1/4"></div>
        
        {/* Floating particles */}
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

      {/* Main Content */}
      <div className="w-full flex items-center justify-center p-4 sm:p-6 md:p-8 relative z-10">
        <div className="w-full max-w-lg transform md:scale-[0.95]">
          {/* Premium Glass Card with entrance animation */}
          <div className="relative group card-entrance">
            {/* Animated glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-3xl opacity-10 group-hover:opacity-20 blur-lg transition-all duration-700 animate-rainbow"></div>
            
            {/* Main card */}
            <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-200 transform transition-all duration-500 hover:shadow-purple-500/20">
              {/* Back Button */}
              <button
                onClick={() => navigate('/signup')}
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors group/back animate-slide-in-top"
              >
                <ArrowLeft className="w-4 h-4 group-hover/back:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Sign Up</span>
              </button>

              {/* Logo Section */}
              <div className="flex items-center gap-2 mb-6 group/logo cursor-pointer animate-slide-in-top" onClick={() => navigate('/')}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur-md opacity-30 group-hover/logo:opacity-50 transition-opacity duration-500 animate-neon-glow"></div>
                  
                  <div className="relative w-11 h-11 bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-600 rounded-xl flex items-center justify-center transform group-hover/logo:scale-110 group-hover/logo:rotate-12 transition-all duration-500 shadow-xl border-2 border-white/80">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 to-transparent opacity-60"></div>
                    <Sparkles className="w-6 h-6 text-white relative z-10 drop-shadow-md animate-heartbeat" />
                  </div>
                </div>
                
                <div className="flex flex-col -space-y-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black font-heading tracking-tight bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent animate-rainbow">
                      BotSmith
                    </span>
                    <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full animate-bounce-in stagger-1">AI</span>
                  </div>
                </div>
              </div>

              {/* Icon with gradient background */}
              <div className="flex justify-center mb-6 animate-slide-in-top stagger-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-xl opacity-40 animate-neon-glow"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                    <Shield className="w-10 h-10 text-white drop-shadow-lg" />
                  </div>
                </div>
              </div>
              
              {/* Heading */}
              <div className="text-center space-y-2 mb-8 animate-slide-in-left">
                <h1 className="text-3xl font-black font-heading bg-gradient-to-r from-purple-700 via-pink-600 to-orange-600 bg-clip-text text-transparent leading-tight">
                  Verify Your Email
                </h1>
                <p className="text-gray-600 font-body">
                  We've sent a 6-digit code to
                </p>
                <p className="text-purple-600 font-semibold">{email}</p>
                <p className="text-sm text-gray-500">
                  Enter the code below to verify your account
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 6-Digit Code Input */}
                <div className="animate-fade-in-scale stagger-2">
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {code.map((digit, index) => (
                      <div key={index} className="relative">
                        <input
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={handlePaste}
                          onFocus={() => setFocusedIndex(index)}
                          className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-white border-2 rounded-xl transition-all duration-300 focus:outline-none ${
                            focusedIndex === index
                              ? 'border-purple-500 scale-110 shadow-xl shadow-purple-500/30'
                              : digit
                              ? 'border-purple-300 bg-purple-50'
                              : 'border-gray-300'
                          }`}
                        />
                        {focusedIndex === index && (
                          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-xl blur-md animate-neon-glow"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Demo hint */}
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl">
                      <Mail className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-purple-700 font-medium">
                        Demo code: <span className="font-bold">000000</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="animate-fade-in-scale stagger-3">
                  <Button 
                    type="submit"
                    disabled={isLoading || code.some(d => !d)}
                    className="w-full relative group/btn overflow-hidden bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-600 text-white py-6 rounded-xl font-heading font-bold text-base shadow-xl hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-500 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 animate-rainbow"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Verify Email
                        </>
                      )}
                    </span>
                  </Button>
                </div>

                {/* Resend Code */}
                <div className="text-center animate-fade-in-scale stagger-4">
                  <p className="text-sm text-gray-600">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-all"
                    >
                      Resend Code
                    </button>
                  </p>
                </div>
              </form>

              {/* Security Note */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl animate-fade-in-scale stagger-5">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-600 leading-relaxed">
                    <p className="font-semibold text-purple-700 mb-1">Security Note</p>
                    <p>Never share this verification code with anyone. BotSmith will never ask for your verification code via email or phone.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
