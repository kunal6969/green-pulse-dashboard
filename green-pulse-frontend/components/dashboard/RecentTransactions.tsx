import React, { useState, useContext, useEffect } from 'react';
import { AlertTriangle, Bell, Info, CheckCircle, Loader2, AlertCircle as AlertCircleIcon } from 'lucide-react';
import Card from '../ui/Card';
import { Alert } from '../../types';
import { SimulationContext } from '../../contexts/SimulationContext';
import { fetchAlerts } from '../../services/dataService';

const AlertIcon: React.FC<{severity: Alert['severity']}> = ({ severity }) => {
    switch(severity) {
        case 'high': return <AlertTriangle className="w-5 h-5 text-red-500" />;
        case 'medium': return <Bell className="w-5 h-5 text-secondary" />;
        case 'low': return <Info className="w-5 h-5 text-blue-400" />;
        default: return null;
    }
}

const AlertsPanel: React.FC<{ className?: string }> = ({ className }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { simulationTime } = useContext(SimulationContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getAlerts = async () => {
      // Don't set loading to true on refetches to avoid UI flicker
      setError(null);
      try {
        const dynamicAlerts = await fetchAlerts(simulationTime);
        setAlerts(dynamicAlerts);
      } catch (err) {
        setError("Could not load alerts.");
        console.error(err);
      } finally {
        if (isLoading) setIsLoading(false); // Only set loading to false on initial load
      }
    };

    getAlerts();
  }, [simulationTime]);


  const handleAcknowledge = (id: string) => {
    setAlerts(currentAlerts => currentAlerts.filter(alert => alert.id !== id));
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full text-text-secondary py-10 space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading Alerts...</span>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-red-400 py-10">
            <AlertCircleIcon className="w-8 h-8 mb-2" />
            <p>{error}</p>
        </div>
      );
    }
    
    if (alerts.length > 0) {
      return alerts.map((alert) => (
        <div 
          key={alert.id} 
          className={`
            group flex items-center p-3 rounded-lg transition-colors duration-200 animate-slide-and-fade-in
            ${alert.severity === 'high' ? 'animate-pulse-bg' : 'hover:bg-white/5'}
          `}
        >
          <div className="shrink-0">
            <AlertIcon severity={alert.severity} />
          </div>
          <div className="ml-4 flex-1">
            <p className="font-medium text-text-primary text-sm leading-tight">{alert.description}</p>
            <p className="text-xs text-text-secondary mt-1">{alert.building} &bull; {new Date(alert.timestamp).toLocaleString()}</p>
          </div>
          <button 
            onClick={() => handleAcknowledge(alert.id)}
            aria-label={`Acknowledge alert: ${alert.description}`}
            className="ml-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-text-secondary hover:text-primary focus:outline-none focus:text-primary"
          >
            <CheckCircle size={18} />
          </button>
        </div>
      ));
    }

    return (
      <div className="text-center py-10 text-text-secondary flex flex-col items-center justify-center">
        <CheckCircle className="h-10 w-10 text-primary/50" />
        <p className="mt-3 font-medium text-text-primary">All Clear</p>
        <p className="text-sm">No active alerts to show.</p>
      </div>
    );
  };

  return (
    <Card className={className}>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Predictive Alerts</h2>
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {renderContent()}
      </div>
    </Card>
  );
};

export default AlertsPanel;
