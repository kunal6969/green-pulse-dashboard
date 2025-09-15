import React from 'react';
import Card from '../ui/Card';
import useScrollAnimate from '../../hooks/useScrollAnimate';
import { Database, Code, Brain } from 'lucide-react';

const TeamSection = () => {
    const { ref, isVisible } = useScrollAnimate();

    const team = [
        { name: 'Kunal', role: 'Team Lead', description: 'UI/UX and Front-end Designer', icon: Database },
        { name: 'Kavyansh', role: 'Web Developer', description: 'Specializes in dashboard design and backend architecture.', icon: Code },
        { name: 'Rishabh', role: 'AI/ML Engineer', description: 'Drives the prediction engine and counterfactual modeling for optimal insights.', icon: Brain }
    ];

    return (
        <section ref={ref} className="py-20 bg-bg-secondary">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className={`text-4xl md:text-5xl font-bold text-text-primary transition-all duration-500 ${isVisible ? 'animate-slide-and-fade-in' : 'opacity-0'}`}>Built By a Cross-Functional Team</h2>
                    <p className={`mt-4 max-w-2xl mx-auto text-text-secondary transition-all duration-500 ${isVisible ? 'animate-slide-and-fade-in' : 'opacity-0'}`} style={{animationDelay: '150ms'}}>
                        Our dedicated team combines expertise in web development, database management, and cutting-edge AI/ML to bring this vision to life.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {team.map((member, index) => (
                        <Card key={index} className={`text-center transition-all duration-500 ${isVisible ? 'animate-slide-and-fade-in' : 'opacity-0'}`} style={{animationDelay: `${(index + 2) * 150}ms`}}>
                           <div className="flex justify-center mb-4">
                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
                                    <member.icon className="h-8 w-8" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-primary">{member.name}</h3>
                            <p className="mt-2 font-semibold text-text-primary">{member.role}</p>
                            <p className="mt-2 text-text-secondary">{member.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TeamSection;