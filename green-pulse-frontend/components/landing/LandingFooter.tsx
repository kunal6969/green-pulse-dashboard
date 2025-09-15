import React from 'react';

const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-border-color">
      <div className="container mx-auto px-6 py-6 text-center text-text-secondary">
        <p>&copy; {new Date().getFullYear()} Green Pulse. All rights reserved.</p>
        <p className="text-xs mt-1">Real-time energy insights for a sustainable tomorrow.</p>
      </div>
    </footer>
  );
};

export default LandingFooter;