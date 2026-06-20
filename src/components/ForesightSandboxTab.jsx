import React from 'react';
import { useAppState } from '../AppStateContext';

export default function ForesightSandboxTab() {
  const { state, updateSandboxSliders, getSandboxProjection } = useAppState();

  const { gridDecarb, evAdoption, meatTax, reforestRate } = state;
  const { data, netZeroYear } = getSandboxProjection(gridDecarb, evAdoption, meatTax, reforestRate);

  const handleSliderChange = (key, value) => {
    updateSandboxSliders({ [key]: parseInt(value) });
  };

  // SVG Chart Dimensions
  const width = 600;
  const height = 280;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max Y value is user's baseline carbon, minimum is 10 to keep scale consistent
  const maxY = Math.max(12, state.baselineCarbon);

  const getCoordinates = (index, emissions) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    // Invert Y because SVG coordinates start from top
    const y = paddingTop + chartHeight - (emissions / maxY) * chartHeight;
    return { x, y };
  };

  // Build the line path
  let pathD = '';
  data.forEach((d, idx) => {
    const { x, y } = getCoordinates(idx, d.emissions);
    if (idx === 0) {
      pathD = `M ${x} ${y}`;
    } else {
      pathD += ` L ${x} ${y}`;
    }
  });

  // Area path for gradient fill underneath the line
  let areaD = pathD;
  if (data.length > 0) {
    const firstPoint = getCoordinates(0, data[0].emissions);
    const lastPoint = getCoordinates(data.length - 1, data[data.length - 1].emissions);
    const bottomY = paddingTop + chartHeight;
    areaD += ` L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`;
  }

  // Generate grid lines
  const gridLines = [];
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const yVal = (i / yTicks) * maxY;
    const yPos = paddingTop + chartHeight - (yVal / maxY) * chartHeight;
    gridLines.push(
      <g key={`grid-y-${i}`} className="chart-grid-line">
        <line x1={paddingLeft} y1={yPos} x2={width - paddingRight} y2={yPos} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
        <text x={paddingLeft - 10} y={yPos + 4} textAnchor="end" fill="rgba(255, 255, 255, 0.4)" fontSize="0.75rem">{yVal.toFixed(1)}</text>
      </g>
    );
  }

  // X ticks (years: 2026, 2030, 2035, 2040, 2045, 2050)
  const xTicks = [2026, 2030, 2035, 2040, 2045, 2050];
  const xTickElements = xTicks.map(year => {
    const idx = data.findIndex(d => d.year === year);
    if (idx === -1) return null;
    const { x } = getCoordinates(idx, data[idx].emissions);
    return (
      <g key={`grid-x-${year}`} className="chart-grid-line">
        <line x1={x} y1={paddingTop} x2={x} y2={paddingTop + chartHeight} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
        <text x={x} y={paddingTop + chartHeight + 20} textAnchor="middle" fill="rgba(255, 255, 255, 0.4)" fontSize="0.75rem">{year}</text>
      </g>
    );
  });

  return (
    <div className="sandbox-layout">
      <div className="sandbox-grid">
        {/* Left Column: Interactive Policy Sliders */}
        <div className="sandbox-card sliders-panel glass-panel">
          <h3 className="panel-title">Systemic Policy Levers</h3>
          <p className="panel-description">Adjust regional and national policy targets to simulate how they compound with your personal emissions path.</p>

          <div className="sliders-list">
            <div className="slider-group">
              <div className="slider-label-row">
                <span className="slider-name">⚡ Grid Decarbonization</span>
                <span className="slider-value">{gridDecarb}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={gridDecarb} 
                onChange={(e) => handleSliderChange('gridDecarb', e.target.value)} 
                className="custom-range"
              />
              <p className="slider-help">Replaces fossil energy grids with wind, solar, and nuclear generators.</p>
            </div>

            <div className="slider-group">
              <div className="slider-label-row">
                <span className="slider-name">🚗 EV Mandates</span>
                <span className="slider-value">{evAdoption}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={evAdoption} 
                onChange={(e) => handleSliderChange('evAdoption', e.target.value)} 
                className="custom-range"
              />
              <p className="slider-help">Forces commercial combustion-engine vehicle phaseout and accelerates electric transit.</p>
            </div>

            <div className="slider-group">
              <div className="slider-label-row">
                <span className="slider-name">🥗 Dietary Meat Taxes</span>
                <span className="slider-value">{meatTax}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={meatTax} 
                onChange={(e) => handleSliderChange('meatTax', e.target.value)} 
                className="custom-range"
              />
              <p className="slider-help">Applies carbon taxation to cattle/dairy farming, shifting public subsidies to plant foods.</p>
            </div>

            <div className="slider-group">
              <div className="slider-label-row">
                <span className="slider-name">🌲 Global Reforestation</span>
                <span className="slider-value">{reforestRate}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={reforestRate} 
                onChange={(e) => handleSliderChange('reforestRate', e.target.value)} 
                className="custom-range"
              />
              <p className="slider-help">Restores natural wetlands, forests, and peatlands to absorb carbon from the atmosphere.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Future Projection Line Graph & Stats */}
        <div className="sandbox-card chart-panel glass-panel">
          <div className="chart-header-row">
            <h3 className="panel-title">Emissions Projection (2026 - 2050)</h3>
            <div className="zero-crossing-badge">
              <span className="badge-label">Estimated Net Zero Year</span>
              <h2 className="badge-val text-neon" id="net-zero-year-val">
                {netZeroYear ? `${netZeroYear}` : 'Never'}
              </h2>
            </div>
          </div>

          <div className="chart-wrapper">
            <svg viewBox={`0 0 ${width} ${height}`} className="sandbox-svg-chart">
              <defs>
                <linearGradient id="chart-glow-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00FF87" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00FF87" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Grids */}
              {gridLines}
              {xTickElements}

              {/* Area Gradient */}
              <path d={areaD} fill="url(#chart-glow-grad)" />

              {/* Chart Line */}
              <path d={pathD} fill="none" stroke="#00FF87" strokeWidth="3.5" strokeLinecap="round" />

              {/* Current Footprint Anchor */}
              {data.length > 0 && (() => {
                const pt = getCoordinates(0, data[0].emissions);
                return (
                  <g>
                    <circle cx={pt.x} cy={pt.y} r="6" fill="#00FF87" />
                    <circle cx={pt.x} cy={pt.y} r="12" fill="none" stroke="#00FF87" strokeWidth="1" opacity="0.5" />
                  </g>
                );
              })()}

              {/* Net Zero Crossing Point */}
              {netZeroYear && (() => {
                const idx = data.findIndex(d => d.year === netZeroYear);
                if (idx !== -1) {
                  const pt = getCoordinates(idx, data[idx].emissions);
                  return (
                    <g>
                      <circle cx={pt.x} cy={pt.y} r="6" fill="#06b6d4" />
                      <circle cx={pt.x} cy={pt.y} r="12" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.5" />
                    </g>
                  );
                }
              })()}
            </svg>
          </div>

          <div className="projection-insights">
            <div className="insight-card">
              <span className="insight-title">Active Daily Twin Baseline</span>
              <span className="insight-val">{state.baselineCarbon.toFixed(1)} kg CO₂e</span>
            </div>
            <div className="insight-card">
              <span className="insight-title">Projected 2050 Emissions</span>
              <span className="insight-val text-neon">{data[data.length - 1].emissions.toFixed(1)} kg CO₂e</span>
            </div>
            <div className="insight-card">
              <span className="insight-title">Mitigation Status</span>
              <span className="insight-val" style={{ color: netZeroYear ? '#00FF87' : '#ef4444' }}>
                {netZeroYear ? 'Net-Zero Achieved' : 'Deficit Grid Trajectory'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
