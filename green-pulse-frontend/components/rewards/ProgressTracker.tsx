
import React, { useContext, useEffect, useState } from 'react';
import Card from '../ui/Card';
import { Trophy, Star, Loader2 } from 'lucide-react';
import { SimulationContext } from '../../contexts/SimulationContext';
import { fetchAllBuildingsCumulativeData } from '../../services/dataService';

const ProgressTracker: React.FC = () => {
  const { buildingId, simulationTime } = useContext(SimulationContext);
  const [rank, setRank] = useState<number | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [nextRankPoints, setNextRankPoints] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateProgress = async () => {
      setIsLoading(true);
      try {
        const allBuildingsData = await fetchAllBuildingsCumulativeData(simulationTime);
        const sortedData = [...allBuildingsData].sort((a, b) => b.cumulative_net_savings - a.cumulative_net_savings);
        
        const currentUserDataIndex = sortedData.findIndex(d => d.building_id === buildingId);

        if (currentUserDataIndex !== -1) {
          const currentUserData = sortedData[currentUserDataIndex];
          const currentRank = currentUserDataIndex + 1;
          
          setRank(currentRank);
          setPoints(currentUserData.cumulative_net_savings);

          if (currentRank > 1) {
            setNextRankPoints(sortedData[currentUserDataIndex - 1].cumulative_net_savings);
          } else {
            setNextRankPoints(null); // User is #1
          }
        } else {
            setRank(null);
            setPoints(null);
            setNextRankPoints(null);
        }
      } catch (error) {
        console.error("Failed to update progress tracker", error);
        setRank(null);
        setPoints(null);
        setNextRankPoints(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (simulationTime) {
        updateProgress();
    }
  }, [simulationTime, buildingId]);
  
  if (isLoading) {
    return (
        <Card className="h-full flex flex-col items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
            <p className="text-sm text-text-secondary mt-2">Calculating Progress...</p>
        </Card>
    );
  }
  
  const progress = (points !== null && nextRankPoints !== null && nextRankPoints > 0 && points > 0) ? (points / nextRankPoints) * 100 : 0;
  
  return (
    <Card className="h-full">
      <h2 className="text-xl font-bold text-text-primary mb-4">Your Progress</h2>
      <div className="space-y-6">
        <div className="flex items-center p-4 bg-primary/10 rounded-lg">
          <Trophy className="w-8 h-8 text-primary" />
          <div className="ml-4">
            <p className="text-sm text-text-secondary">Current Campus Rank</p>
            <p className="text-2xl font-bold text-text-primary">{rank ? `#${rank}` : 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center p-4 bg-secondary/10 rounded-lg">
          <Star className="w-8 h-8 text-secondary" />
          <div className="ml-4">
            <p className="text-sm text-text-secondary">Green Points (24h Savings)</p>
            <p className={`text-2xl font-bold ${points === null ? '' : (points >= 0 ? 'text-text-primary' : 'text-red-400')}`}>
              {points !== null ? `${points.toFixed(1)} GP` : 'N/A'}
            </p>
          </div>
        </div>
      </div>
      {rank && rank > 1 && points !== null && nextRankPoints !== null ? (
        <div className="mt-8">
          <h3 className="font-semibold text-text-primary mb-2">Next Rank Progress</h3>
          <div className="flex justify-between text-sm text-text-secondary mb-1">
            <span>Rank #{rank}</span>
            <span>Rank #{rank - 1}</span>
          </div>
          <div className="w-full bg-bg-secondary rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-center text-xs text-text-secondary mt-2">
            You need <span className="font-bold text-primary">{(nextRankPoints - points).toFixed(1)} GP</span> to reach the next rank.
          </p>
        </div>
      ) : rank === 1 ? (
        <p className="text-center text-primary font-semibold mt-8">You are #1 on campus! Keep it up!</p>
      ) : (
         <p className="text-center text-text-secondary mt-8">Not enough data to calculate rank progress.</p>
      )}
    </Card>
  );
};

export default ProgressTracker;
