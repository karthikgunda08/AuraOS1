// src/components/AuraLogo.tsx
import React from 'react';

interface AuraLogoProps {
  className?: string;
}

export const AuraLogo: React.FC<AuraLogoProps> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="logo-gradient-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
      </defs>
      {/* The main arch/roof structure, resembling a house and the letter 'A' */}
      <path 
        d="M12 3L2 12h5v9h10v-9h5L12 3z" 
        stroke="url(#logo-gradient-main)" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* A subtle shadow/accent line to give depth, like an architect's sketch */}
      <path 
        d="M12 21V12l-5 4.5" 
        stroke="hsl(var(--primary))" 
        strokeOpacity="0.7"
        strokeWidth="1" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};