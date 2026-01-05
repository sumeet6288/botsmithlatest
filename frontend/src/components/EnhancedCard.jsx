import React from 'react';

export const GlowCard = ({ children, className = '', glowColor = 'purple' }) => {
  const glowColors = {
    purple: 'group-hover:shadow-purple-500/50',
    pink: 'group-hover:shadow-pink-500/50',
    blue: 'group-hover:shadow-blue-500/50',
    green: 'group-hover:shadow-green-500/50',
    orange: 'group-hover:shadow-orange-500/50'
  };

  return (
    <div className={`group relative ${className}`}>
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-r from-${glowColor}-600 to-pink-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
      
      {/* Card content */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-2xl">
        {children}
      </div>
    </div>
  );
};

export const StatsCard = ({ icon: Icon, value, label, gradient = 'from-purple-600 to-pink-600', delay = 0 }) => {
  return (
    <div 
      className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-purple-200/50 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up overflow-hidden relative"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
      
      <div className="relative z-10">
        {/* Icon */}
        <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg mb-3 inline-block transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        {/* Value */}
        <p className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {value}
        </p>
        
        {/* Label */}
        <p className="text-gray-600 text-sm mt-2 font-medium">{label}</p>
      </div>
    </div>
  );
};

export const FeatureCard = ({ icon: Icon, title, description, gradient = 'from-purple-500 to-pink-500' }) => {
  return (
    <div className="group relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200 hover:border-purple-300 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-2">
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
      
      <div className="relative z-10">
        {/* Icon */}
        <div className={`p-4 bg-gradient-to-br ${gradient} rounded-xl shadow-lg mb-4 inline-block transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export const AnimatedBorder = ({ children, className = '' }) => {
  return (
    <div className={`relative p-[2px] rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_100%] animate-gradient-x ${className}`}>
      <div className="bg-white rounded-2xl h-full">
        {children}
      </div>
    </div>
  );
};

export const PulseCard = ({ children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Pulse rings */}
      <div className="absolute inset-0 rounded-2xl bg-purple-400 animate-ping opacity-20"></div>
      <div className="absolute inset-0 rounded-2xl bg-purple-400 animate-pulse opacity-10"></div>
      
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default GlowCard;
