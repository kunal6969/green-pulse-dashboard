import React from 'react';

export interface TimeRangeOption {
  label: string;
  value: number;
}

interface TimeRangeSelectorProps {
  options: TimeRangeOption[];
  selected: number;
  onSelect: (value: number) => void;
  className?: string;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ options, selected, onSelect, className }) => {
  return (
    <div className={`flex items-center flex-wrap gap-2 ${className}`}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
            selected === opt.value
              ? 'bg-primary text-bg-primary'
              : 'bg-card-bg hover:bg-primary/20 border border-border-color text-text-secondary'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default TimeRangeSelector;
