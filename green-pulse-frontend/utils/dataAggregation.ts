import { EnergyDataPoint } from '../types';

const ANOMALY_THRESHOLD = 0.20; // 20% deviation

/**
 * A utility function to filter, aggregate, and format time-series energy data
 * based on a specified time range (e.g., 24h, 7d, 30d). It handles hourly,
 * daily (weekday), and daily (date) aggregations and identifies anomalies.
 *
 * @param allData - The complete array of EnergyDataPoint objects.
 * @param timeRangeHours - The number of hours to include in the analysis (e.g., 24, 168, 720).
 * @param simulationTime - (Optional) The end time for the data slice. If provided, the
 *   slice will be the `timeRangeHours` leading up to this time. If not, the slice
 *   will be the last `timeRangeHours` from the entire dataset.
 * @returns An array of processed EnergyDataPoint objects ready for charting.
 */
export const aggregateAndFindAnomalies = (
  allData: EnergyDataPoint[],
  timeRangeHours: number,
  simulationTime?: Date
): (EnergyDataPoint & { deviation?: number | null })[] => {
  if (!allData || allData.length === 0) {
    return [];
  }

  // 1. Filter data to the relevant time slice
  let dataSlice: EnergyDataPoint[];
  if (simulationTime) {
    // Used by Dashboard: Get data leading up to the current simulation time
    const endTime = simulationTime;
    const startTime = new Date(endTime);
    startTime.setHours(endTime.getHours() - timeRangeHours);
    dataSlice = allData.filter(p => p.historical && p.historical >= startTime && p.historical <= endTime);
  } else {
    // Used by Analytics: Get the last N hours of the entire dataset
    dataSlice = allData.slice(-timeRangeHours);
  }

  // 2. Aggregate data for 7-day and 30-day views
  if ((timeRangeHours === 168 || timeRangeHours === 720) && dataSlice.length > 0) {
    const daysData: { [key: string]: { points: EnergyDataPoint[], date: Date } } = {};
    
    const groupingOptions: Intl.DateTimeFormatOptions = timeRangeHours === 168
      ? { weekday: 'short' } // '7d' view
      : { month: 'short', day: 'numeric' }; // '30d' view

    dataSlice.forEach(p => {
      if (p.historical) {
        const dayKey = p.historical.toLocaleDateString([], groupingOptions);
        if (!daysData[dayKey]) {
          const startOfDay = new Date(p.historical);
          startOfDay.setHours(0, 0, 0, 0);
          daysData[dayKey] = { points: [], date: startOfDay };
        }
        daysData[dayKey].points.push(p);
      }
    });

    const aggregated = Object.entries(daysData).map(([key, day]) => {
      const actualPoints = day.points.filter(p => p.actual !== null);
      const predictedPoints = day.points.filter(p => p.predicted !== null);

      const avgActual = actualPoints.length > 0 ? actualPoints.reduce((sum, p) => sum + p.actual!, 0) / actualPoints.length : null;
      const avgPredicted = predictedPoints.length > 0 ? predictedPoints.reduce((sum, p) => sum + p.predicted!, 0) / predictedPoints.length : null;

      let deviation = null;
      if (avgActual !== null && avgPredicted !== null && avgPredicted > 0) {
        const dev = (avgActual - avgPredicted) / avgPredicted;
        if (Math.abs(dev) > ANOMALY_THRESHOLD) {
          deviation = dev * 100;
        }
      }
      
      return {
        time: key,
        actual: avgActual,
        predicted: avgPredicted,
        historical: day.date,
        deviation,
      };
    });
    
    aggregated.sort((a, b) => a.historical!.getTime() - b.historical!.getTime());
    return aggregated;
  }

  // 3. Process hourly data (24h view) and find anomalies
  return dataSlice.map(point => {
    let deviation = null;
    if (point.actual !== null && point.predicted !== null && point.predicted > 0) {
      const dev = (point.actual - point.predicted) / point.predicted;
      if (Math.abs(dev) > ANOMALY_THRESHOLD) {
        deviation = dev * 100;
      }
    }
    return {
      ...point,
      deviation,
    };
  });
};
