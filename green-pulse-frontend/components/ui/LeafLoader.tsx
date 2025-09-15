import React from 'react';

const LeafLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full" aria-label="Loading forecast data">
    <style>{`
      @keyframes draw-leaf {
        from {
          stroke-dashoffset: 300;
        }
        to {
          stroke-dashoffset: 0;
        }
      }
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes pulse-glow {
        0%, 100% {
          transform: scale(0.8);
          opacity: 0.3;
        }
        50% {
          transform: scale(1);
          opacity: 0.7;
        }
      }
      @keyframes natural-flutter {
        0% {
          transform: translateY(0) rotate(-3deg) scale(1);
        }
        25% {
          transform: translateY(-10px) rotate(5deg) scale(1.03);
        }
        50% {
          transform: translateY(-4px) rotate(-4deg) scale(1);
        }
        75% {
          transform: translateY(-12px) rotate(3deg) scale(0.97);
        }
        100% {
          transform: translateY(0) rotate(-3deg) scale(1);
        }
      }
      .leaf-outline {
        stroke-dasharray: 300;
        animation: draw-leaf 2s ease-out forwards;
      }
      .leaf-veins {
        opacity: 0;
        animation: fade-in 1s ease-in 1.5s forwards;
      }
      .leaf-glow {
        transform-origin: center;
        animation: pulse-glow 3s ease-in-out infinite;
      }
      .leaf-flutter {
         animation: natural-flutter 5s ease-in-out infinite;
      }
    `}</style>
    <svg
      width="80"
      height="80"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle 
        className="leaf-glow"
        cx="50" 
        cy="50" 
        r="40" 
        fill="var(--primary)" 
      />
      <g className="leaf-flutter">
        <path
          className="leaf-outline"
          d="M50 0 C25 25, 25 75, 50 100 C75 75, 75 25, 50 0 Z"
          fill="none"
          stroke="var(--primary-focus)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <g className="leaf-veins">
            <path
              d="M50 0 V 100"
              stroke="var(--primary-focus)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.8"
            />
            <path
              d="M50 25 C65 20, 65 30, 50 25"
              fill="none"
              stroke="var(--primary-focus)"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <path
              d="M50 75 C35 70, 35 80, 50 75"
              fill="none"
              stroke="var(--primary-focus)"
              strokeWidth="1.5"
              opacity="0.6"
            />
        </g>
      </g>
    </svg>
    <p className="mt-4 text-sm font-semibold text-primary animate-pulse">
        Generating Forecast...
    </p>
  </div>
);

export default LeafLoader;