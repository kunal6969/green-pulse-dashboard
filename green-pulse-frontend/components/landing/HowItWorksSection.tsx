import React from 'react';
import Card from '../ui/Card';
import useScrollAnimate from '../../hooks/useScrollAnimate';


const HowItWorksSection: React.FC = () => {
    const { ref, isVisible } = useScrollAnimate();

    const steps = [
        { title: 'Real-Time Dashboard', text: 'Displays energy consumption broken down by building, unit, or device, using normalized kWh metrics for clear, comparable data.' },
        { title: 'Counterfactual Modeling', text: 'Utilizes trained regression models  to compare actual energy usage against expected usage under similar conditions.' },
        { title: 'Predictive Alerts', text: 'Employs outlier detection via Z-score and time-series trend deviation to issue proactive alerts for unusual energy patterns.' },
        { title: 'Gamification Engine', text: 'Features leaderboards based on relative energy savings (actual vs. counterfactual), incentivizing healthy competition and sustained behavioral change.' },
        ];

  return (
    <section ref={ref} className="py-20 bg-bg-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
            <h2 className={`text-4xl md:text-5xl font-bold text-text-primary transition-all duration-500 ${isVisible ? 'animate-slide-and-fade-in' : 'opacity-0'}`}>How Our Platform Works</h2>
            <p className={`mt-4 max-w-2xl mx-auto text-text-secondary transition-all duration-500 ${isVisible ? 'animate-slide-and-fade-in' : 'opacity-0'}`} style={{animationDelay: '150ms'}}>
                Each feature is designed to provide actionable insights and drive energy efficiency through intelligent data analysis and user engagement.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
                <Card key={index} className={`transition-all duration-500 ${isVisible ? 'animate-slide-and-fade-in' : 'opacity-0'}`} style={{animationDelay: `${(index + 2) * 150}ms`}}>
                    <div className="flex items-center">
                        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg">{index + 1}</span>
                        <h3 className="ml-4 text-xl font-bold text-text-primary">{step.title}</h3>
                    </div>
                    <p className="mt-4 text-text-secondary">{step.text}</p>
                </Card>
            ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;