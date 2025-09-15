
import React from 'react';
import ProgressTracker from './ProgressTracker';
import BadgesGallery from './BadgesGallery';
import TaskList from './TaskList';

const RewardsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary animate-fade-in-down">Your Rewards Hub</h1>
      <p className="text-text-secondary animate-fade-in-down" style={{ animationDelay: '100ms' }}>
        Track your energy-saving achievements, complete tasks, and unlock exclusive badges.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-fade-in-down" style={{ animationDelay: '200ms' }}>
          <ProgressTracker />
        </div>
        <div className="animate-fade-in-down" style={{ animationDelay: '300ms' }}>
          <TaskList />
        </div>
      </div>

      <div className="animate-fade-in-down" style={{ animationDelay: '400ms' }}>
          <BadgesGallery />
      </div>
    </div>
  );
};

export default RewardsPage;
