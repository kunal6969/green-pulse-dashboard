import React, { useContext } from 'react';
import { Play, Pause, Calendar, Clock } from 'lucide-react';
import { SimulationContext } from '../../contexts/SimulationContext';

// Helper to format Date to YYYY-MM-DD for the date input
const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    // Adjust for timezone offset to display the correct local date in the input
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
};

// Helper to format Date to HH:mm for the time input
const formatTimeForInput = (date: Date | null): string => {
    if (!date) return '';
    // Adjust for timezone offset to display the correct local time in the input
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[1].slice(0, 5);
};

const TimeControl: React.FC = () => {
  const { simulationTime, isPaused, togglePlayPause, setSpecificTime, dataStartDate, dataEndDate } = useContext(SimulationContext);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateString = e.target.value;
    const currentTimeString = formatTimeForInput(simulationTime);
    
    const combinedISOString = `${newDateString}T${currentTimeString}`;
    const newDate = new Date(combinedISOString);

    if (!isNaN(newDate.getTime())) {
      setSpecificTime(newDate);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeString = e.target.value;
    const currentDateString = formatDateForInput(simulationTime);
    
    const combinedISOString = `${currentDateString}T${newTimeString}`;
    const newDate = new Date(combinedISOString);

    if (!isNaN(newDate.getTime())) {
      setSpecificTime(newDate);
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-bg-secondary p-2 rounded-lg border border-border-color">
      <button 
        onClick={togglePlayPause} 
        className="p-2 text-primary hover:bg-primary/20 rounded-md transition-colors"
        aria-label={isPaused ? 'Play simulation' : 'Pause simulation'}
      >
        {isPaused ? <Play size={20} /> : <Pause size={20} />}
      </button>
      <div className="flex items-center space-x-2 border-r border-border-color pr-2">
        <Calendar size={18} className="text-text-secondary"/>
        <input 
          type="date"
          value={formatDateForInput(simulationTime)}
          onChange={handleDateChange}
          min={formatDateForInput(dataStartDate)}
          max={formatDateForInput(dataEndDate)}
          className="bg-transparent text-text-primary text-sm font-mono focus:outline-none w-[120px]"
          disabled={!dataStartDate || !dataEndDate}
          aria-label="Select date"
        />
      </div>
      <div className="flex items-center space-x-2">
         <Clock size={18} className="text-text-secondary"/>
         <input 
          type="time"
          value={formatTimeForInput(simulationTime)}
          onChange={handleTimeChange}
          step="3600" // Data is hourly, so snap to hours.
          className="bg-transparent text-text-primary text-sm font-mono focus:outline-none w-[80px]"
          disabled={!dataStartDate || !dataEndDate}
          aria-label="Select time"
        />
      </div>
    </div>
  );
};

export default TimeControl;
