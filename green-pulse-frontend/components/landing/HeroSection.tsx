import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onLogin: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onLogin }) => {
  return (
    <section className="pt-32 pb-20 text-center container mx-auto px-6">
      <h1 className="text-5xl md:text-7xl font-bold text-text-primary leading-tight animate-fade-in">
        Green Pulse: Real-time energy insights for a <span className="text-primary">sustainable tomorrow</span>
      </h1>
      <p className="mt-8 max-w-3xl mx-auto text-lg text-text-secondary animate-fade-in" style={{ animationDelay: '200ms' }}>
        Many campuses and offices lack a centralized system to monitor energy usage. Our platform addresses this by introducing a sophisticated, real-time smart energy dashboard to reduce waste and improve efficiency.
      </p>
      <div className="mt-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <button onClick={onLogin} className="bg-primary text-bg-primary font-bold py-3 px-8 rounded-lg flex items-center space-x-2 hover:bg-primary-focus transition-transform duration-300 hover:scale-105 mx-auto text-lg shadow-glow-primary">
          <span>Explore the Dashboard</span>
          <ArrowRight size={22} />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;