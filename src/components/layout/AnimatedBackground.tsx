'use client';

import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 animate-gradient-x"></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0">
        {/* Large circle */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-float"></div>
        
        {/* Medium circle */}
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-float-delay"></div>
        
        {/* Small circle */}
        <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-xl animate-pulse"></div>
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Speed of Mastery themed elements */}
      <div className="absolute inset-0">
        {/* Brain-like neural connections */}
        <svg className="absolute top-20 left-20 w-32 h-32 text-blue-200/20 animate-pulse" viewBox="0 0 100 100">
          <circle cx="20" cy="30" r="2" fill="currentColor" />
          <circle cx="50" cy="20" r="2" fill="currentColor" />
          <circle cx="80" cy="35" r="2" fill="currentColor" />
          <circle cx="30" cy="60" r="2" fill="currentColor" />
          <circle cx="70" cy="70" r="2" fill="currentColor" />
          <line x1="20" y1="30" x2="50" y2="20" stroke="currentColor" strokeWidth="0.5" />
          <line x1="50" y1="20" x2="80" y2="35" stroke="currentColor" strokeWidth="0.5" />
          <line x1="30" y1="60" x2="70" y2="70" stroke="currentColor" strokeWidth="0.5" />
          <line x1="20" y1="30" x2="30" y2="60" stroke="currentColor" strokeWidth="0.5" />
        </svg>
        
        <svg className="absolute bottom-32 right-32 w-24 h-24 text-purple-200/20 animate-bounce" viewBox="0 0 100 100">
          <circle cx="25" cy="25" r="1.5" fill="currentColor" />
          <circle cx="75" cy="25" r="1.5" fill="currentColor" />
          <circle cx="50" cy="50" r="1.5" fill="currentColor" />
          <circle cx="25" cy="75" r="1.5" fill="currentColor" />
          <circle cx="75" cy="75" r="1.5" fill="currentColor" />
          <line x1="25" y1="25" x2="75" y2="25" stroke="currentColor" strokeWidth="0.5" />
          <line x1="75" y1="25" x2="50" y2="50" stroke="currentColor" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="25" y2="75" stroke="currentColor" strokeWidth="0.5" />
          <line x1="50" y1="50" x2="75" y2="75" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>
    </div>
  );
};

export default AnimatedBackground;
