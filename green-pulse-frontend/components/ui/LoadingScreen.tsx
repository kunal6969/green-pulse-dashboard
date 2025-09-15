import React from 'react';

const Leaf = ({ style }: { style: React.CSSProperties }) => (
  <div style={{ ...style, willChange: 'transform' }} className="absolute top-0">
    <svg width="25" height="25" viewBox="0 0 100 100" className="leaf-swing" style={{ animationDelay: style.animationDelay }}>
      <path
        d="M50 0 C25 25, 25 75, 50 100 C75 75, 75 25, 50 0 Z"
        fill="var(--primary)"
        fillOpacity="0.6"
      />
    </svg>
  </div>
);

const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Loading Data...' }) => {
  const leaves = Array.from({ length: 12 }).map((_, i) => {
    const fallDuration = `${Math.random() * 8 + 6}s`; // 6-14 seconds
    const swingDuration = `${Math.random() * 4 + 3}s`; // 3-7 seconds
    const left = `${Math.random() * 100}%`;
    const animationDelay = `${Math.random() * 10}s`;
    
    return {
      id: i,
      style: {
        '--fall-duration': fallDuration,
        '--swing-duration': swingDuration,
        '--left': left,
        '--translateX': `${(Math.random() - 0.5) * 400}px`,
        '--rotate': `${(Math.random() - 0.5) * 900}deg`,
        '--swingX': `${(Math.random() - 0.5) * 50}px`,
        '--swingRotate': `${(Math.random() - 0.5) * 40}deg`,
        animationDelay,
      } as React.CSSProperties
    };
  });

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-bg-primary">
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-20vh) rotate(10deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(var(--rotate));
            opacity: 0.5;
          }
        }
        @keyframes swing {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          50% { transform: translateX(var(--swingX)) rotate(var(--swingRotate)); }
        }
        .leaf-container {
          position: absolute;
          top: 0;
          left: var(--left);
          animation: fall var(--fall-duration) linear infinite;
        }
        .leaf-swing {
          animation: swing var(--swing-duration) ease-in-out infinite alternate;
        }
      `}</style>
      
      {leaves.map(leaf => (
        <div key={leaf.id} className="leaf-container" style={leaf.style}>
          <Leaf style={{ animationDelay: leaf.style.animationDelay }} />
        </div>
      ))}
      
      <div className="z-10 text-center animate-fade-in">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 animate-pulse" style={{animationDuration: '2.5s'}}>
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#68D8B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#68D8B1" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#68D8B1" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2 className="text-2xl font-semibold text-primary">{message}</h2>
        <p className="text-text-secondary mt-2">Preparing your real-time dashboard...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
