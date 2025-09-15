
import React, { useState } from 'react';
import LandingPage from './components/landing/LandingPage';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import AIInsightsPage from './components/ai-insights/AIInsightsPage';
import ReportsPage from './components/reports/ReportsPage';
import { SimulationProvider } from './contexts/SimulationContext';
import RewardsPage from './components/rewards/RewardsPage';

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activePage, setActivePage] = useState('Dashboard');

    const handleLogin = () => setIsLoggedIn(true);
    const handleLogout = () => setIsLoggedIn(false);

    if (!isLoggedIn) {
        return <LandingPage onLogin={handleLogin} />;
    }

    const pageContent: { [key: string]: { component: React.ReactNode; subtitle: string } } = {
        'Dashboard': { component: <Dashboard />, subtitle: 'Real-time overview of campus energy metrics.' },
        'Analytics': { component: <AnalyticsPage />, subtitle: 'Deep dive into historical data and trends.' },
        'Forecasting': { component: <AIInsightsPage />, subtitle: 'Predict future usage and run what-if scenarios.' },
        'Rewards': { component: <RewardsPage />, subtitle: 'Track your progress and earn badges for energy savings.' },
        'Reports': { component: <ReportsPage />, subtitle: 'Generate and export custom energy reports.' },
    };

    const currentPage = pageContent[activePage] || pageContent['Dashboard'];

    return (
        <SimulationProvider>
            <div className="flex h-screen bg-bg-primary text-text-primary font-outfit">
                <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} />
                <main className="flex-1 flex flex-col overflow-hidden">
                    <Header title={activePage} subtitle={currentPage.subtitle} />
                    <div className="flex-1 p-6 overflow-y-auto">
                        {currentPage.component}
                    </div>
                </main>
            </div>
        </SimulationProvider>
    );
};

export default App;
