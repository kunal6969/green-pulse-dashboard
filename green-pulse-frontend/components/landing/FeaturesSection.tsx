import React from 'react';
import Card from '../ui/Card';
import useScrollAnimate from '../../hooks/useScrollAnimate';

const FeatureCard = ({ title, text, delay }: { title: string, text: string, delay: number }) => {
    const { ref, isVisible } = useScrollAnimate();
    return (
        <Card ref={ref} className={`text-center transition-all duration-500 ${isVisible ? 'animate-slide-and-fade-in' : 'opacity-0'}`} style={{ animationDelay: `${delay}ms`}}>
            <h3 className="text-2xl font-bold text-primary">{title}</h3>
            <p className="mt-4 text-text-secondary">{text}</p>
        </Card>
    );
};


const FeaturesSection: React.FC = () => {
    const features = [
        {
            title: 'Reduce Energy Waste',
            text: 'Minimize unnecessary consumption through precise monitoring and data-driven insights.'
        },
        {
            title: 'Spot Inefficiencies Early',
            text: 'Proactively identify and address anomalies or underperforming systems using predictive analytics.'
        },
        {
            title: 'Gamified Leaderboards',
            text: 'Engage stakeholders through gamified behavior change, encouraging greener habits and collective responsibility.'
        }
    ];

  return (
    <section className="py-20 container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
            <FeatureCard key={index} title={feature.title} text={feature.text} delay={index * 150} />
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;