import React from 'react';

const Logo = ({ className }: { className?: string }) => {
  return (
    <svg 
      viewBox="0 0 320 60" 
      width="180" 
      height="34" 
      className={className}
      aria-label="Animelist Logo" 
      role="img"
    >
      <defs>
        <style>
          {`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&display=swap');`}
          {`.logo-text {
            font-family: 'Orbitron', sans-serif;
            font-size: 36px;
            font-weight: 900;
            fill: #E50914;
            letter-spacing: 3px;
          }`}
        </style>
        <mask id="katana-slash">
          <rect width="100%" height="100%" fill="white" />
          <line x1="185" y1="-10" x2="165" y2="70" stroke="black" stroke-width="3.5" />
        </mask>
      </defs>

      <text x="0" y="45" className="logo-text" mask="url(#katana-slash)">ANIMELIST</text>

      <line x1="185" y1="-10" x2="165" y2="70" stroke="#FF2A2A" strokeWidth="1.5" />
    </svg>
  );
};

export default Logo;
