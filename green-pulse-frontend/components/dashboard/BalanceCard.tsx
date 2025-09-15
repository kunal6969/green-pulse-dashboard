
import React from 'react';
import Card from '../ui/Card';
import { LucideProps } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  unit: string;
  trend: string;
  Icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  trendColor: string;
}

const KPI_Card: React.FC<KPICardProps> = ({ title, value, unit, trend, Icon, trendColor }) => {
  return (
    <Card className="flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <p className="text-text-secondary text-sm font-medium">{title}</p>
        <Icon className={`w-5 h-5 ${trendColor}`} />
      </div>
      <div>
        <p className="text-3xl font-semibold text-text-primary mt-2">
          {value} <span className="text-xl text-text-secondary">{unit}</span>
        </p>
        <p className={`text-sm font-medium mt-1 ${trendColor}`}>{trend}</p>
      </div>
    </Card>
  );
};

export default KPI_Card;
