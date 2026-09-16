import React, { useEffect, useRef, useState } from 'react';

export default function MotionReveal({ children, className = '', delay = 0, variant = 'fade-up' }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const getVariantStyles = () => {
    if (isVisible) {
      return 'opacity-100 translate-y-0 translate-x-0 scale-100';
    }
    switch (variant) {
      case 'scale-up':
        return 'opacity-0 translate-y-4 scale-95';
      case 'slide-right':
        return 'opacity-0 -translate-x-8 scale-100';
      case 'slide-left':
        return 'opacity-0 translate-x-8 scale-100';
      case 'fade-up':
      default:
        return 'opacity-0 translate-y-8 scale-[0.98]';
    }
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${getVariantStyles()} ${className}`}
    >
      {children}
    </div>
  );
}
