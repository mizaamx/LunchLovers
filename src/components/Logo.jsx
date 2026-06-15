import React from 'react';

export default function Logo({ className = "h-12 w-auto", showText = true }) {
  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      <svg 
        viewBox="0 0 380 180" 
        className="h-full w-auto" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* === STEAM & HEART === */}
        {/* Terracota Heart */}
        <path 
          d="M75,34 C75,34 50,16 50,7.5 C50,2.5 54.5,-2.5 60,-2.5 C64,-2.5 67.5,-0.5 70,2.5 C72.5,-0.5 76,-2.5 80,-2.5 C85.5,-2.5 90,2.5 90,7.5 C90,16 75,34 75,34 Z" 
          fill="#B05A32"
          transform="translate(10, 10)"
        />
        {/* Steam line */}
        <path 
          d="M85,90 C85,75 90,65 85,50" 
          stroke="#B05A32" 
          strokeWidth="6" 
          strokeLinecap="round"
          fill="none"
        />

        {/* === LUNCHBOX BODY === */}
        {/* Yellow Body */}
        <path 
          d="M25,115 L35,160 C36,165 42,168 48,168 L102,168 C108,168 114,165 115,160 L125,115 Z" 
          fill="#DA9E33" 
          stroke="#B05A32" 
          strokeWidth="8" 
          strokeLinejoin="round"
        />

        {/* Lid (slightly open and tilted) */}
        <path 
          d="M15,95 L118,72 C125,70.5 130,76 128,83 L125,97 C124,101 119,104 114,105 L25,118 C20,118.8 15,114.5 15,109 Z" 
          fill="#F4EBDC" 
          stroke="#B05A32" 
          strokeWidth="8" 
          strokeLinejoin="round"
        />

        {/* Inner shadow/accent inside open lid */}
        <path 
          d="M26,114 L114,101 C117,100.5 119.5,98 120,95" 
          stroke="#B05A32" 
          strokeWidth="4" 
          strokeLinecap="round"
        />

        {/* === CUTE SMILEY FACE === */}
        {/* Eye Left */}
        <circle cx="55" cy="138" r="5" fill="#B05A32" />
        {/* Eye Right */}
        <circle cx="95" cy="138" r="5" fill="#B05A32" />
        {/* Smile */}
        <path 
          d="M68,146 C68,154 82,154 82,146" 
          stroke="#B05A32" 
          strokeWidth="5" 
          strokeLinecap="round"
          fill="none"
        />
        {/* Rosy Cheeks */}
        <circle cx="46" cy="144" r="4" fill="#B05A32" opacity="0.4" />
        <circle cx="104" cy="144" r="4" fill="#B05A32" opacity="0.4" />

        {/* === LOGO TEXT === */}
        {showText && (
          <>
            <text 
              x="155" 
              y="60" 
              fill="#B05A32" 
              fontWeight="900" 
              fontSize="62" 
              fontFamily="'Quicksand', 'Nunito', sans-serif"
              letterSpacing="-2px"
            >
              Lunch
            </text>
            <text 
              x="155" 
              y="118" 
              fill="#B05A32" 
              fontWeight="900" 
              fontSize="62" 
              fontFamily="'Quicksand', 'Nunito', sans-serif"
              letterSpacing="-2px"
            >
              Lovers
            </text>
            <text 
              x="155" 
              y="166" 
              fill="#7D8A4E" 
              fontWeight="800" 
              fontSize="44" 
              fontFamily="'Quicksand', 'Nunito', sans-serif"
              letterSpacing="1px"
            >
              GDL
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
