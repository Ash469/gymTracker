import React from 'react';

export default function OrganicCurveDivider({ variant = 'wave1', fill = '#faf8f5', stroke = '#e6e2dc', className = '' }) {
  if (variant === 'wave1') {
    return (
      <div className={`w-full overflow-hidden leading-none py-2 ${className}`}>
        <svg
          className="relative block w-full h-8 sm:h-12 text-[#faf8f5]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z"
            fill={fill}
          />
          <path
            d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            className="opacity-60"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'bezier-mesh') {
    return (
      <div className={`w-full overflow-hidden py-4 ${className}`}>
        <svg className="w-full h-10 opacity-70" viewBox="0 0 800 60" preserveAspectRatio="none">
          <path d="M0,30 Q200,5 400,30 T800,30" fill="none" stroke="#da7756" strokeWidth="1.5" className="opacity-80" />
          <path d="M0,45 Q200,60 400,20 T800,40" fill="none" stroke="#059669" strokeWidth="1.5" className="opacity-80" />
          <circle cx="200" cy="18" r="3" fill="#da7756" className="animate-ping" />
          <circle cx="600" cy="30" r="3" fill="#059669" className="animate-ping" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden leading-none ${className}`}>
      <svg
        className="relative block w-full h-10 sm:h-14 text-white"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,60 Q300,120 600,60 T1200,60 L1200,120 L0,120 Z"
          fill={fill}
        />
        <path
          d="M0,60 Q300,120 600,60 T1200,60"
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
