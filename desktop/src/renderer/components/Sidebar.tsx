import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAgentStore } from '../stores/agent-store';
import { useLicenseStore } from '../stores/license-store';
import {
    HomeIcon,
    ClockIcon,
    PlayCircleIcon,
    Cog6ToothIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';

const navItems = [
    { path: '/', label: 'Dashboard', icon: HomeIcon },
    { path: '/activity', label: 'Activity', icon: ClockIcon },
    { path: '/workflows', label: 'Workflows', icon: PlayCircleIcon },
    { path: '/settings', label: 'Settings', icon: Cog6ToothIcon },
];

export function Sidebar() {
    const { licenseStatus, daysRemaining } = useLicenseStore();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <SparklesIcon className="w-8 h-8 text-accent-primary" />
                <span>Phantom AI</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <item.icon />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className={`license-badge ${licenseStatus === 'pro' ? 'pro' : ''}`}>
                    {licenseStatus === 'pro' ? (
                        <>
                            <span>✨ Pro License</span>
                            <span>Active</span>
                        </>
                    ) : (
                        <>
                            <span>Free Trial</span>
                            <span className="days">{daysRemaining} days left</span>
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
}
