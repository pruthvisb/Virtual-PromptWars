import React from 'react';
import { useAppState } from '../AppStateContext';

export default function TopNavbar({ activeTab, setActiveTab }) {
  const { state, logout } = useAppState();

  const tabs = [
    { id: 'dashboard', name: 'Carbon Planet' },
    { id: 'quiz', name: 'Onboarding Quiz' },
    { id: 'actions', name: 'Actions Log' },
    { id: 'ai', name: 'AI Coach' },
    { id: 'sandbox', name: 'Foresight Sandbox' },
    { id: 'sink', name: 'DAC Oasis' }
  ];

  const userLevel = Math.floor(state.points / 500) + 1;
  const userRole = userLevel >= 3 ? 'Elite Climate Warden' : userLevel >= 2 ? 'Active Eco-Citizen' : 'Advocate Initiate';

  return (
    <header className="top-navbar-header glass-panel-nav" role="navigation">
      <div className="nav-brand-container">
        <span className="nav-brand-logo">🌱</span>
        <h1 className="nav-brand-name">EcoSphere AI</h1>
      </div>

      <nav className="top-nav-menu">
        {tabs.map((tab) => (
          <button 
            key={tab.id} 
            className={`top-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab" 
            aria-selected={activeTab === tab.id ? 'true' : 'false'}
            type="button"
          >
            <span>{tab.name}</span>
          </button>
        ))}
      </nav>

      <div className="nav-user-profile">
        <div className="nav-user-avatar" id="sidebar-avatar-val">
          {state.userName ? state.userName.split(' ').map(n => n.charAt(0)).join('').toUpperCase() : 'JD'}
        </div>
        <div className="nav-user-info">
          <span className="nav-user-name" id="sidebar-name-val">{state.userName}</span>
          <span className="nav-user-level" id="user-level-val">Level {userLevel} {userRole}</span>
        </div>
        <button className="nav-reset-btn" onClick={logout} title="Reset Profile" aria-label="Reset Profile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H16" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
