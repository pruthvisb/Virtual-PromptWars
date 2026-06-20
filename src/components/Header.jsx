import React from 'react';
import { useAppState } from '../AppStateContext';

export default function Header({ activeTab, onOpenTests }) {
  const { state } = useAppState();

  if (!state.isLoggedIn) return null;

  const getTitles = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Carbon Intelligence Pulse',
          subtitle: 'Observe your AI Carbon Twin, analyze categories, and sync automatic trackers.'
        };
      case 'quiz':
        return {
          title: 'Intelligence Profiling',
          subtitle: 'Complete your baseline carbon calculations across 6 core lifestyle domains.'
        };
      case 'actions':
        return {
          title: 'Habit Tracker',
          subtitle: 'Check off daily sustainable actions to dynamically cut your footprint.'
        };
      case 'ai':
        return {
          title: 'AI Sustainability Coach',
          subtitle: 'Ask your coach climate questions and generate tailored weekly action agendas.'
        };
      case 'sandbox':
        return {
          title: 'Climate Foresight Sandbox',
          subtitle: 'Model future climate scenarios by adjusting policy dials and simulating Net Zero timelines.'
        };
      case 'sink':
        return {
          title: 'DAC Oasis Carbon Sink',
          subtitle: 'Directly extract CO₂ from the atmosphere in real-time using our personal air capture modules.'
        };
      default:
        return {
          title: 'EcoSphere AI',
          subtitle: 'Carbon Intelligence Platform'
        };
    }
  };

  const { title, subtitle } = getTitles();

  return (
    <header className="app-header">
      <div className="page-title-container">
        <h2 className="page-title" id="tab-title-text">{title}</h2>
        <span className="page-subtitle" id="tab-subtitle-text">{subtitle}</span>
      </div>

      <div className="header-stats">
        <button 
          onClick={onOpenTests}
          className="stat-pill" 
          style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', cursor: 'pointer' }}
          title="Run automated unit test suite"
        >
          🧪 Run Tests
        </button>

        <div className="stat-pill co2-captured" title="CO₂ extracted from air by DAC Oasis (grams)" style={{ background: 'rgba(0, 255, 135, 0.15)', border: '1px solid rgba(0, 255, 135, 0.3)', color: '#00FF87' }}>
          💨 <span className="user-captured-val" style={{ fontWeight: 'bold' }}>{state.co2Captured.toFixed(1)}</span> g
        </div>

        <div className="stat-pill points" title="EcoPoints earned by logging green actions">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8" strokeLinecap="round" strokeWidth="2"/></svg>
          <span className="user-points-val">{state.points}</span> pts
        </div>
        
        <div className="stat-pill streak" title="Consecutive days logging actions">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <span className="user-streak-val">{state.streak}</span> days
        </div>

        <div className="stat-pill carbon-saved" title="Total carbon emissions prevented (kg CO2)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round"/></svg>
          <span className="user-saved-val">{state.carbonSaved.toFixed(1)}</span> kg CO₂
        </div>
      </div>
    </header>
  );
}
