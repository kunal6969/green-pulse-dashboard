import React from 'react';
import LandingHeader from './LandingHeader';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import HowItWorksSection from './HowItWorksSection';
import DifferentiatorsSection from './DifferentiatorsSection';
import TeamSection from './TeamSection';
import LandingFooter from './LandingFooter';

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  return (
    <div className="bg-bg-primary text-text-primary font-outfit">
      <LandingHeader onLogin={onLogin} />
      <main>
        <HeroSection onLogin={onLogin} />
        <FeaturesSection />
        <HowItWorksSection />
        <DifferentiatorsSection />
        <TeamSection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;