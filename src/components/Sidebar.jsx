import React from 'react';
import { useAppState } from '../AppStateContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { state, logout } = useAppState();

  if (!state.isLoggedIn) return null;

  const tabs = [
    { id: 'dashboard', name: 'Carbon Planet', icon: (
      <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
    ) },
    { id: 'quiz', name: 'Onboarding Quiz', icon: (
      <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round"/></svg>
    ) },
    { id: 'actions', name: 'Actions Log', icon: (
      <svg viewBox="0 0 24 24"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M9 12l2 2 4-4" strokeLinecap="round"/></svg>
    ) },
    { id: 'ai', name: 'AI Coach', icon: (
      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round"/></svg>
    ) },
    { id: 'community', name: 'Community Feed', icon: (
      <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zm14 14v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round"/></svg>
    ) },
    { id: 'marketplace', name: 'Marketplace', icon: (
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12" strokeLinecap="round"/></svg>
    ) }
  ];

  const userLevel = Math.floor(state.points / 500) + 1;
  const userRole = userLevel >= 3 ? 'Elite Climate Warden' : userLevel >= 2 ? 'Active Eco-Citizen' : 'Advocate Initiate';

  return (
    <aside className="app-sidebar" role="navigation">
      <div className="brand-header">
        <div className="brand-logo">🌱</div>
        <h1 className="brand-name">EcoSphere AI</h1>
      </div>

      <nav className="nav-menu">
        {tabs.map((tab) => (
          <li key={tab.id} className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}>
            <a 
              href={`#${tab.id}`} 
              className="nav-link" 
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(tab.id);
              }}
              role="tab" 
              aria-selected={activeTab === tab.id ? 'true' : 'false'}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </a>
          </li>
        ))}
      </nav>

      <div className="user-quick-profile">
        <div className="user-avatar" id="sidebar-avatar-val">
          {state.userName ? state.userName.split(' ').map(n => n.charAt(0)).join('').toUpperCase() : 'JD'}
        </div>
        <div className="user-info">
          <span className="user-name" id="sidebar-name-val">{state.userName}</span>
          <span className="user-level" id="user-level-val">Level {userLevel} {userRole}</span>
        </div>
        <button className="logout-btn" onClick={logout} title="Sign Out" aria-label="Sign Out">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}
