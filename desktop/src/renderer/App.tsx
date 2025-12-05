import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TitleBar } from './components/TitleBar';
import { CommandBar } from './components/CommandBar';
import { Dashboard } from './pages/Dashboard';
import { Activity } from './pages/Activity';
import { Workflows } from './pages/Workflows';
import { Settings } from './pages/Settings';
import { Overlay } from './pages/Overlay';
import { Onboarding } from './pages/Onboarding';
import { useAgentStore } from './stores/agent-store';
import { useSettingsStore } from './stores/settings-store';
import './styles/App.css';

export default function App() {
    const [isFirstRun, setIsFirstRun] = useState(false);
    const { initializeStore } = useAgentStore();
    const { loadSettings, theme } = useSettingsStore();

    useEffect(() => {
        // Initialize stores
        initializeStore();
        loadSettings();

        // Check if first run
        const hasOnboarded = localStorage.getItem('phantom-ai-onboarded');
        if (!hasOnboarded) {
            setIsFirstRun(true);
        }
    }, []);

    // Apply theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Handle overlay route
    const isOverlay = window.location.hash === '#/overlay';
    if (isOverlay) {
        return <Overlay />;
    }

    // Show onboarding if first run
    if (isFirstRun) {
        return (
            <Onboarding
                onComplete={() => {
                    localStorage.setItem('phantom-ai-onboarded', 'true');
                    setIsFirstRun(false);
                }}
            />
        );
    }

    return (
        <HashRouter>
            <div className="app">
                <TitleBar />
                <div className="app-content">
                    <Sidebar />
                    <main className="main-content">
                        <CommandBar />
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/activity" element={<Activity />} />
                            <Route path="/workflows" element={<Workflows />} />
                            <Route path="/settings" element={<Settings />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </HashRouter>
    );
}
