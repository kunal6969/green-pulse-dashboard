

import React, { useContext, useMemo } from 'react';
import Card from '../ui/Card';
import { Leaf, Zap, BarChart3, Sun, Moon } from 'lucide-react';
import { SimulationContext } from '../../contexts/SimulationContext';
import { EnergyDataPoint } from '../../types';

const Badge = ({ icon: Icon, title, description, earned }: { icon: React.ElementType, title: string, description: string, earned: boolean }) => {
  return (
    <div className={`flex items-center p-4 rounded-lg border transition-all duration-300 ${earned ? 'bg-primary/10 border-primary/30' : 'bg-card-bg border-border-color opacity-50'}`}>
      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${earned ? 'bg-primary text-bg-primary' : 'bg-bg-secondary text-text-secondary'}`}>
        <Icon size={24} />
      </div>
      <div className="ml-4">
        <h4 className={`font-bold ${earned ? 'text-primary' : 'text-text-primary'}`}>{title}</h4>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
    </div>
  );
};

const checkBadges = (data: EnergyDataPoint[]) => {
  if (data.length < 168) { // Need at least a week of data
    return {
      greenStarter: false, efficiencyExpert: false, daySaver: false,
      nightOwl: false, sustainabilityStreak: false,
    };
  }

  const last24h = data.slice(-24);
  const last7days = data.slice(-168);

  const cumulative24hSavings = last24h.reduce((acc, p) => acc + ((p.predicted ?? p.actual ?? 0) - (p.actual ?? 0)), 0);
  const greenStarter = cumulative24hSavings > 1;

  const cumulative7daySavings = last7days.reduce((acc, p) => acc + ((p.predicted ?? p.actual ?? 0) - (p.actual ?? 0)), 0);
  const efficiencyExpert = cumulative7daySavings > 100;

  const dayHours = last7days.filter(p => p.historical && p.historical.getHours() >= 9 && p.historical.getHours() < 17);
  const daySavings = dayHours.reduce((acc, p) => acc + ((p.predicted ?? p.actual ?? 0) - (p.actual ?? 0)), 0);
  const daySaver = dayHours.length > 0 && (daySavings / dayHours.length) > 0;

  const nightHours = last7days.filter(p => p.historical && (p.historical.getHours() >= 22 || p.historical.getHours() < 6));
  const nightSavings = nightHours.reduce((acc, p) => acc + ((p.predicted ?? p.actual ?? 0) - (p.actual ?? 0)), 0);
  const nightOwl = nightHours.length > 0 && (nightSavings / nightHours.length) > 0;

  let streak = 0;
  for (let i = 0; i <= data.length - 24; i += 24) {
    const daySlice = data.slice(i, i + 24);
    const dailySavings = daySlice.reduce((acc, p) => acc + ((p.predicted ?? p.actual ?? 0) - (p.actual ?? 0)), 0);
    if (dailySavings > 0) {
      streak++;
    } else {
      streak = 0;
    }
  }
  const sustainabilityStreak = streak >= 7;

  return { greenStarter, efficiencyExpert, daySaver, nightOwl, sustainabilityStreak };
};

const BadgesGallery: React.FC = () => {
  const { buildingData } = useContext(SimulationContext);
  const earnedBadges = useMemo(() => checkBadges(buildingData), [buildingData]);

  const badges = [
    { icon: Leaf, title: 'Green Starter', description: 'Achieve a net energy saving over a 24-hour period.', earned: earnedBadges.greenStarter },
    { icon: Zap, title: 'Efficiency Expert', description: 'Save over 100 kWh cumulatively in one week.', earned: earnedBadges.efficiencyExpert },
    { icon: Sun, title: 'Day Saver', description: 'Maintain average savings during peak hours (9am-5pm).', earned: earnedBadges.daySaver },
    { icon: Moon, title: 'Night Owl', description: 'Maintain average savings during off-peak hours (10pm-6am).', earned: earnedBadges.nightOwl },
    { icon: BarChart3, title: 'Sustainability Streak', description: 'Stay below predicted usage for 7 days in a row.', earned: earnedBadges.sustainabilityStreak },
    { icon: Leaf, title: 'Carbon Conscious', description: 'Reduce your carbon footprint for 3 consecutive days.', earned: false }, // Mocked for now
  ];

  return (
    <Card>
      <h2 className="text-xl font-bold text-text-primary mb-1">Badges Collection</h2>
      <p className="text-sm text-text-secondary mb-4">Achievements unlocked based on your building's performance data.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge, index) => (
          <Badge key={index} {...badge} />
        ))}
      </div>
    </Card>
  );
};

export default BadgesGallery;
