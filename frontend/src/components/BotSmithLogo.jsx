import React from 'react';

/**
 * BotSmith Logo Component - Beautiful "B" with gradient and effects
 * Props:
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - showGlow: boolean (default: true)
 * - animate: boolean (default: false)
 */
const BotSmithLogo = ({ size = 'md', showGlow = true, animate = false }) => {
  // Size configurations
  const sizes = {
    sm: {
      container: 'w-10 h-10',
      text: 'text-2xl',
    },
    md: {
      container: 'w-12 h-12',
      text: 'text-3xl',
    },
    lg: {
      container: 'w-16 h-16',
      text: 'text-5xl',
    },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className="relative">
      {/* Background glow effect */}
      {showGlow && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
      )}
      
      {/* Main logo container */}
      <div className={`relative ${currentSize.container} bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-600 rounded-2xl flex items-center justify-center ${animate ? 'transform group-hover:scale-105 group-hover:rotate-6 transition-all duration-500' : 'transition-transform duration-300 hover:scale-105'} shadow-2xl border border-white/20`}>
        {/* Inner gradient highlight */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent opacity-50"></div>
        
        {/* Beautiful "B" Letter with premium font */}
        <span className={`${currentSize.text} font-black text-white relative z-10 drop-shadow-2xl`} style={{ fontFamily: 'Playfair Display, serif' }}>
          B
        </span>
        
        {/* Sparkle effects - Only show on medium and large */}
        {size !== 'sm' && (
          <>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
          </>
        )}
      </div>
      
      {/* Animated orbital ring - Only show if animate is true */}
      {animate && (
        <div className="absolute inset-0 rounded-2xl border-2 border-purple-400/30 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 animate-pulse"></div>
      )}
    </div>
  );
};

export default BotSmithLogo;
