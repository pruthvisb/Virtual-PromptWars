import React, { useEffect, useState } from 'react';

export default function CourierPlanet({ currentCarbon, dailyBudget }) {
  const [questPrompt, setQuestPrompt] = useState(false);

  useEffect(() => {
    const handleProximity = (e) => {
      if (e.detail) {
        setQuestPrompt(e.detail.nearQuest);
      }
    };

    window.addEventListener('courierProximity', handleProximity);
    return () => {
      window.removeEventListener('courierProximity', handleProximity);
    };
  }, []);

  return (
    <div 
      className="carbon-twin-container" 
      style={{ position: 'relative', width: '100%', height: '260px', borderRadius: '16px', overflow: 'hidden', background: 'transparent' }}
    >
      {questPrompt && (
        <div 
          id="quest-prompt-overlay" 
          style={{ 
            position: 'absolute', 
            bottom: '12px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            background: 'rgba(16, 185, 129, 0.95)', 
            padding: '6px 14px', 
            borderRadius: '20px', 
            fontSize: '0.75rem', 
            fontWeight: 'bold', 
            color: '#fff', 
            zIndex: 10, 
            animation: 'bounce 1s infinite alternate', 
            pointerEvents: 'none', 
            textShadow: '0 1px 3px rgba(0,0,0,0.3)', 
            boxShadow: '0 4px 12px rgba(16,185,129,0.35)' 
          }}
        >
          Press SPACE to Deliver Quest!
        </div>
      )}
      
      <div className="progress-overlay-text" style={{ pointerEvents: 'none' }}>
        <span className="progress-num" id="dash-pulse-num">{currentCarbon}</span>
        <span className="progress-unit">kg CO₂e/day</span>
        <span className="progress-label" id="twin-label-text">
          {currentCarbon <= dailyBudget ? 'EcoSphere Healthy' : 'Fossil Overload'}
        </span>
      </div>
    </div>
  );
}
