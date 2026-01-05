import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for scroll-triggered animations
 * Elements will animate when they come into viewport
 */
export const useScrollAnimation = (options = {}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only trigger animation once when element enters viewport
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      {
        threshold: options.threshold || 0.1, // Trigger when 10% visible
        rootMargin: options.rootMargin || '0px 0px -50px 0px', // Trigger slightly before element is visible
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [isVisible, options.threshold, options.rootMargin]);

  return [elementRef, isVisible];
};

/**
 * Higher-order component for scroll animations
 */
export const ScrollAnimationWrapper = ({ 
  children, 
  animation = 'slide-up',
  delay = 0,
  className = ''
}) => {
  const [ref, isVisible] = useScrollAnimation();

  const animationClass = isVisible 
    ? `animate-${animation} opacity-100` 
    : 'opacity-0 translate-y-12';

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-700 ${animationClass} ${className}`}
      style={{ 
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
        animationDelay: isVisible ? `${delay}ms` : '0ms'
      }}
    >
      {children}
    </div>
  );
};
