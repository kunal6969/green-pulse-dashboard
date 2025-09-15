
import React, { useState } from 'react';
import Card from '../ui/Card';
import { Moon, Sun, Bell, Mail, BarChart } from 'lucide-react';

interface SwitchProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  Icon: React.ElementType;
}

const Switch: React.FC<SwitchProps> = ({ label, enabled, onChange, Icon }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center">
      <Icon className="w-5 h-5 text-text-secondary mr-3" />
      <span className="text-text-primary font-medium">{label}</span>
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card-bg focus:ring-primary ${
        enabled ? 'bg-primary' : 'bg-bg-secondary'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);


const SettingsPage: React.FC = () => {
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState({
    alerts: true,
    summary: true,
    gamification: false,
  });

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-fade-in-down" style={{animationDelay: '100ms'}}>
            <h3 className="text-xl font-semibold text-text-primary mb-4">Theme</h3>
            <div className="space-y-3">
              <div 
                onClick={() => setTheme('dark')}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border-color'}`}
              >
                <Moon className="text-primary mr-3" />
                <div>
                  <p className="font-semibold text-text-primary">Neon Dark</p>
                  <p className="text-sm text-text-secondary">Recommended for optimal viewing experience.</p>
                </div>
              </div>
              <div 
                onClick={() => setTheme('light')}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border-color'}`}
              >
                <Sun className="text-secondary mr-3" />
                 <div>
                  <p className="font-semibold text-text-primary">Light Mode</p>
                  <p className="text-sm text-text-secondary">A traditional light theme (coming soon).</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="animate-fade-in-down" style={{animationDelay: '200ms'}}>
            <h3 className="text-xl font-semibold text-text-primary mb-4">Notifications</h3>
             <div className="divide-y divide-border-color">
                <Switch 
                  label="Predictive Alerts" 
                  enabled={notifications.alerts} 
                  onChange={(val) => handleNotificationChange('alerts', val)} 
                  Icon={Bell}
                />
                <Switch 
                  label="Weekly Summaries" 
                  enabled={notifications.summary} 
                  onChange={(val) => handleNotificationChange('summary', val)} 
                  Icon={Mail}
                />
                 <Switch 
                  label="Gamification Updates" 
                  enabled={notifications.gamification} 
                  onChange={(val) => handleNotificationChange('gamification', val)}
                  Icon={BarChart}
                />
             </div>
          </Card>
        </div>
        <div className="animate-fade-in-down" style={{animationDelay: '300ms'}}>
            <Card>
                <h3 className="text-xl font-semibold text-text-primary mb-4">Profile</h3>
                <p className="text-text-secondary">Manage your personal information and password.</p>
                <button className="mt-4 bg-primary/10 hover:bg-primary/20 text-primary font-bold py-2 px-4 rounded-lg transition-colors">
                    Update Profile
                </button>
            </Card>
        </div>
    </div>
  );
};

export default SettingsPage;
