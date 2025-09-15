import React from 'react';
import { ArrowRight } from 'lucide-react';

interface LandingHeaderProps {
  onLogin: () => void;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({ onLogin }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-glass-border">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#68D8B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="#68D8B1" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#68D8B1" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-lg font-bold ml-2 text-primary">GREENPULSE</span>
        </div>
        <button onClick={onLogin} className="bg-primary text-bg-primary font-bold py-2 px-5 rounded-lg flex items-center space-x-2 hover:bg-primary-focus transition-transform duration-300 hover:scale-105">
          <span>Go to Dashboard</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </header>
  );
};

export default LandingHeader;