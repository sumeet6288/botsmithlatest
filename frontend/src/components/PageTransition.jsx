import React, { useEffect, useState } from 'react';

const PageTransition = ({ children, duration = 600, delay = 50 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Smooth scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Trigger animation on mount with slight delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`transition-all ease-out ${
        isVisible 
          ? 'opacity-100 transform translate-y-0 scale-100' 
          : 'opacity-0 transform translate-y-8 scale-98'
      }`}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform, opacity'
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
