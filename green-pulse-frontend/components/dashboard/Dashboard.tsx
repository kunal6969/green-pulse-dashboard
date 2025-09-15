

import React, { useContext, useEffect, useState } from 'react';
import KPI_Card from './BalanceCard';
import ConsumptionOverview from './EnergyChart';
// FIX: Imported `AlertTriangle` which was used but not defined.
import { TrendingUp, TrendingDown, Zap, AlertCircle, Leaf, AlertTriangle } from 'lucide-react';
import { SimulationContext } from '../../contexts/SimulationContext';
import { EnergyDataPoint } from '../../types';
import LiveLeaderboard from './LiveLeaderboard';
import LoadingScreen from '../ui/LoadingScreen';

const Dashboard: React.FC = () => {
  const { simulationTime, buildingData, isLoading, error } = useContext(SimulationContext);
  const [currentData, setCurrentData] = useState<EnergyDataPoint | null>(null);
  const [latestAnomaly, setLatestAnomaly] = useState<{ time: string, deviation: number } | null>(null);

  useEffect(() => {
    if (buildingData.length > 0) {
      // Find the most recent data point at or before the current simulation time
      const dataPoint = buildingData.slice().reverse().find(p => p.historical! <= simulationTime);
      setCurrentData(dataPoint || buildingData[0]); // Fallback to first point if simulation time is before any data

      // Anomaly detection logic
      const end = simulationTime;
      const start = new Date(end);
      start.setHours(end.getHours() - 24);
      
      const last24hData = buildingData.filter(p => p.historical && p.historical >= start && p.historical <= end);
      
      let foundAnomaly = null;
      for (let i = last24hData.length - 1; i >= 0; i--) {
        const point = last24hData[i];
        if (point.actual && point.predicted && point.predicted > 0) {
          const deviation = (point.actual - point.predicted) / point.predicted;
          if (Math.abs(deviation) > 0.20) { // 20% threshold
            foundAnomaly = {
              time: point.time,
              deviation: deviation * 100
            };
            break; // Found the most recent one
          }
        }
      }
      setLatestAnomaly(foundAnomaly);
    } else {
      setCurrentData(null);
      setLatestAnomaly(null);
    }
  }, [simulationTime, buildingData]);

  if (isLoading) {
    return <LoadingScreen message="Calibrating Real-Time Data Stream..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-red-400">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h2 className="text-2xl font-semibold">Error Loading Data</h2>
        <p className="text-text-secondary">{error}</p>
      </div>
    );
  }

  const consumption = currentData?.actual?.toFixed(1) ?? '...';
  const savings = currentData ? ((currentData.predicted ?? 0) - (currentData.actual ?? 0)).toFixed(1) : '...';
  const isSaving = currentData ? (currentData.actual ?? 0) < (currentData.predicted ?? 0) : false;
  const deviation = currentData && currentData.predicted && currentData.predicted > 0 ? ((( (currentData.actual ?? 0) - currentData.predicted) / currentData.predicted) * 100).toFixed(0) : '...';
  
  const CO2_FACTOR = 0.8 * 0.92; 
  const carbonFootprint = currentData?.actual ? (currentData.actual * CO2_FACTOR).toFixed(2) : '...';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI_Card
          title="Live Consumption"
          value={consumption}
          unit="kWh"
          trend={`${deviation}% vs Predicted`}
          Icon={Zap}
          trendColor={isSaving ? 'text-primary' : 'text-red-400'}
        />
        <KPI_Card
          title="Net Savings (vs. Predicted)"
          value={savings}
          unit="kWh"
          trend={isSaving ? 'Performing better than expected' : 'Higher than expected consumption'}
          Icon={isSaving ? TrendingDown : TrendingUp}
          trendColor={isSaving ? 'text-primary' : 'text-red-400'}
        />
        <KPI_Card
          title="Carbon Footprint"
          value={carbonFootprint}
          unit="kg CO2/hr"
          trend="Based on live consumption"
          Icon={Leaf}
          trendColor="text-text-secondary"
        />
         <KPI_Card
          title="Last Anomaly (24h)"
          value={latestAnomaly ? `${latestAnomaly.deviation.toFixed(0)}%` : "All Clear"}
          unit={latestAnomaly ? 'deviation' : ''}
          trend={latestAnomaly ? `At ${latestAnomaly.time}` : 'No significant deviations detected'}
          Icon={AlertTriangle}
          trendColor={latestAnomaly ? 'text-secondary' : 'text-primary'}
        />
      </div>
      
      <ConsumptionOverview />
      
      <LiveLeaderboard />

    </div>
  );
};

export default Dashboard;