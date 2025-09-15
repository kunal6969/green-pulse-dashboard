import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchBuildingData, processApiData, API_BASE_URL } from '../services/dataService';
import { EnergyDataPoint } from '../types';

// FIX: Add SimulationRate interface to define the shape of simulation speed options.
export interface SimulationRate {
  hoursPerTick: number;
  intervalMs: number;
}

interface SimulationContextType {
  buildingId: number;
  setBuildingId: (id: number) => void;
  buildingData: EnergyDataPoint[];
  isLoading: boolean;
  error: string | null;
  simulationTime: Date;
  isPaused: boolean;
  togglePlayPause: () => void;
  setSpecificTime: (time: Date) => void;
  dataStartDate: Date | null;
  dataEndDate: Date | null;
  // FIX: Add simulationRate and setSimulationRate to the context type to allow speed control.
  simulationRate: SimulationRate;
  setSimulationRate: (rate: SimulationRate) => void;
}

// FIX: Removed the hardcoded SIMULATION_RATE constant. It will be managed by state.

export const SimulationContext = createContext<SimulationContextType>({
  buildingId: 1,
  setBuildingId: () => {},
  buildingData: [],
  isLoading: true,
  error: null,
  simulationTime: new Date(),
  isPaused: true,
  togglePlayPause: () => {},
  setSpecificTime: () => {},
  dataStartDate: null,
  dataEndDate: null,
  // FIX: Provide default values for the new simulationRate context properties.
  simulationRate: { hoursPerTick: 1, intervalMs: 10000 },
  setSimulationRate: () => {},
});

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buildingId, setBuildingId] = useState(1);
  const [buildingData, setBuildingData] = useState<EnergyDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [simulationTime, setSimulationTime] = useState<Date>(new Date());
  // Default to paused to prevent race conditions on load.
  const [isPaused, setIsPaused] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // FIX: Added state for simulationRate to make it dynamic.
  const [simulationRate, setSimulationRate] = useState<SimulationRate>({ hoursPerTick: 1, intervalMs: 10000 });
  const [dataStartDate, setDataStartDate] = useState<Date | null>(null);
  const [dataEndDate, setDataEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Ensure simulation is paused while new data loads.
      setIsPaused(true);

      try {
        const rawData = await fetchBuildingData(buildingId);
        if (rawData && rawData.length > 0) {
          const processedData = processApiData(rawData);
          setBuildingData(processedData);
          setSimulationTime(processedData[0].historical!);
          setDataStartDate(processedData[0].historical!);
          setDataEndDate(processedData[processedData.length - 1].historical!);
        } else {
          setBuildingData([]);
          setDataStartDate(null);
          setDataEndDate(null);
          setError(`No data available for building ${buildingId}.`);
        }
      } catch (err) {
        console.error(err);
        let message = 'Failed to fetch data from the server.';
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
            message = `Could not connect to the server at ${API_BASE_URL}. Please ensure the backend is running and accessible.`;
            if (window.location.protocol === 'https:') {
              message += ' Your app is on HTTPS, which may block requests to an HTTP server (mixed content).';
            }
        } else if (err instanceof Error) {
            message = err.message;
        }
        setError(message);
        setBuildingData([]);
        setDataStartDate(null);
        setDataEndDate(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [buildingId]);

  const advanceTime = useCallback(() => {
    if (buildingData.length === 0) return;

    setSimulationTime(prevTime => {
      const currentIndex = buildingData.findIndex(p => p.historical! >= prevTime);
      if (currentIndex === -1) return buildingData[0]?.historical || prevTime;

      // FIX: Use the simulationRate from state to determine how many hours to advance.
      const nextIndex = (currentIndex + simulationRate.hoursPerTick) % buildingData.length;
      return buildingData[nextIndex].historical!;
    });
  // FIX: Add simulationRate.hoursPerTick to the dependency array.
  }, [buildingData, simulationRate.hoursPerTick]);

  useEffect(() => {
    if (!isPaused && !isLoading && buildingData.length > 0) {
      // FIX: Use the interval from the simulationRate state.
      intervalRef.current = setInterval(advanceTime, simulationRate.intervalMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  // FIX: Add simulationRate.intervalMs to the dependency array.
  }, [isPaused, isLoading, buildingData, advanceTime, simulationRate.intervalMs]);

  const togglePlayPause = () => {
    setIsPaused(prev => !prev);
  };
  
  const setSpecificTime = (time: Date) => {
    // No data, no-op
    if (!dataStartDate || !dataEndDate) return;

    // Clamp the selected time to within the available data range
    let clampedTime = time;
    if (time < dataStartDate) {
        clampedTime = dataStartDate;
    } else if (time > dataEndDate) {
        clampedTime = dataEndDate;
    }
    
    setSimulationTime(clampedTime);
    // Always pause after a manual time change for predictable behavior.
    setIsPaused(true);
  };


  return (
    // FIX: Provide simulationRate and setSimulationRate in the context provider's value.
    <SimulationContext.Provider value={{ buildingId, setBuildingId, buildingData, isLoading, error, simulationTime, isPaused, togglePlayPause, setSpecificTime, dataStartDate, dataEndDate, simulationRate, setSimulationRate }}>
      {children}
    </SimulationContext.Provider>
  );
};