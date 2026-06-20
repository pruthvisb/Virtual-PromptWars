import React from 'react';
import { useAppState } from '../AppStateContext';

export default function CarbonSinkTab() {
  const { state, boostDacFans, regenerateFilter } = useAppState();
  const { co2Captured, fanSpeed, filterSat, boostActive, boostTimeLeft, points } = state;

  return (
    <div className="sink-layout">
      <div className="sink-grid">
        {/* Left column: Direct Air Capture 3D Portal Visualizer Overlay */}
        <div className="sink-card visualization-panel glass-panel" style={{ background: 'rgba(10,15,20,0.4)', borderColor: 'rgba(255,255,255,0.04)' }}>
          <div className="card-header-row">
            <h3 className="panel-title">Personal Air Capture Module</h3>
            <span className="live-badge">● Live Extraction</span>
          </div>

          {/* Spacer to show background 3D vents */}
          <div className="threejs-sink-canvas-spacer" style={{ width: '100%', height: '240px', pointerEvents: 'none' }} />
          
          <div className="visualizer-hud">
            <div className="hud-pill">
              <span className="hud-label">Turbulence Speed</span>
              <span className="hud-val text-neon">{fanSpeed} RPM</span>
            </div>
            <div className="hud-pill">
              <span className="hud-label">Boost Status</span>
              <span className="hud-val" style={{ color: boostActive ? '#00FF87' : 'rgba(255,255,255,0.4)' }}>
                {boostActive ? `Active (${boostTimeLeft}s)` : 'Standby'}
              </span>
            </div>
          </div>
        </div>

        {/* Right column: Action Controls & Accumulators */}
        <div className="sink-card controls-panel glass-panel">
          <h3 className="panel-title">Extraction Metrics</h3>
          <p className="panel-description">Breathe clean air. Sustainable habits logged in the Actions Log boost the baseline extraction RPM automatically.</p>

          <div className="accumulator-box">
            <span className="accumulator-label">Atmospheric CO₂ Extracted</span>
            <div className="accumulator-number-row">
              <span className="acc-number text-neon" id="co2-captured-val">{co2Captured.toFixed(3)}</span>
              <span className="acc-unit">grams</span>
            </div>
          </div>

          <div className="saturation-meter-group">
            <div className="meter-header">
              <span>Filter Adsorbent Saturation</span>
              <span id="filter-sat-val">{filterSat}%</span>
            </div>
            <div className="meter-track">
              <div 
                className="meter-fill" 
                style={{ 
                  width: `${filterSat}%`, 
                  background: filterSat >= 90 ? '#ef4444' : filterSat >= 70 ? '#f59e0b' : '#00FF87' 
                }} 
              />
            </div>
            {filterSat >= 100 && (
              <p className="meter-warning text-error">Warning: Saturated filter! Carbon capture speed reduced. Please regenerate filter.</p>
            )}
          </div>

          <div className="button-group">
            <button 
              className={`btn btn-primary boost-btn ${boostActive ? 'active' : ''}`}
              onClick={boostDacFans}
              disabled={boostActive || points < 50}
              type="button"
            >
              {boostActive ? `Boost Active (${boostTimeLeft}s)` : `Boost Fans (Cost: 50 pts)`}
            </button>

            <button 
              className="btn btn-secondary regenerate-btn"
              onClick={regenerateFilter}
              disabled={filterSat === 0}
              type="button"
            >
              Regenerate Filter
            </button>
          </div>

          <p className="controls-footer-help">Sponsoring offsets and logging habits accumulates points. Spend 50 EcoPoints to trigger a 10s boost to 600 RPM.</p>
        </div>
      </div>
    </div>
  );
}
