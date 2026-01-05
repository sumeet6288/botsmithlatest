import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for smooth scroll reveal animations
 * Elements fade in and slide up when they come into view
 */
export const useScrollReveal = (options = {}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, stop observing to maintain the animation
          if (options.once !== false) {
            observer.unobserve(element);
          }
        } else if (options.once === false) {
          setIsVisible(false);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options.threshold, options.rootMargin, options.once]);

  return [elementRef, isVisible];
};

/**
 * Custom hook for staggered animations (for lists)
 */
export const useStaggeredReveal = (itemCount, options = {}) => {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const elementRefs = useRef([]);

  useEffect(() => {
    const observers = [];
    
    elementRefs.current.forEach((element, index) => {
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleItems(prev => new Set([...prev, index]));
            }, index * (options.delay || 100));
            
            if (options.once !== false) {
              observer.unobserve(element);
            }
          }
        },
        {
          threshold: options.threshold || 0.1,
          rootMargin: options.rootMargin || '0px',
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [itemCount, options.delay, options.threshold, options.rootMargin, options.once]);

  const setRef = (index) => (el) => {
    elementRefs.current[index] = el;
  };

  const isVisible = (index) => visibleItems.has(index);

  return { setRef, isVisible };
};
