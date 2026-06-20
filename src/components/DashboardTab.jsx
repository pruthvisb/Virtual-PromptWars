import React, { useState, useEffect } from 'react';
import { useAppState, carbonCoefficients, actionsDatabase } from '../AppStateContext';
import CourierPlanet from './CourierPlanet';

export default function DashboardTab({ onRecalculate }) {
  const { 
    state, 
    setGpsActive, 
    parseReceipt, 
    toggleAction, 
    showToast 
  } = useAppState();

  const qa = state.quizAnswers;

  // Trackers simulation states
  const [gpsSimStatus, setGpsSimStatus] = useState('GPS mobility tracking is offline.');
  const [gpsClass, setGpsClass] = useState('');
  const [receiptSelection, setReceiptSelection] = useState('');
  const [receiptText, setReceiptText] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  
  // For triggering quests on the 3D planet
  const [activeQuestTrigger, setActiveQuestTrigger] = useState(null);

  // GPS simulation effect
  useEffect(() => {
    let timer;
    if (state.gpsActive) {
      setGpsClass('sim-active-gps');
      setGpsSimStatus('Simulating background location tracking...');
      
      timer = setTimeout(() => {
        setGpsSimStatus('Transit Detected! Quest ready at Transit Hub (-2.2 kg)');
        showToast('GPS detected public transit! Bouncing quest marker active at the Train Station.', 'success');
        
        // Trigger quest marker on Three.js planet
        setActiveQuestTrigger({ actionId: 'public_transit', timestamp: Date.now() });
      }, 2500);
    } else {
      setGpsClass('');
      setGpsSimStatus('GPS mobility tracking is offline.');
    }

    return () => clearTimeout(timer);
  }, [state.gpsActive]);

  const handleGpsToggle = (e) => {
    setGpsActive(e.target.checked);
  };

  const receiptMockData = {
    jacket: `AMAZON CHECKOUT VOUCHER\nORDER #AMZ-99105-X\n1x Patagonia Recycled Polyester Jacket - $129.00\nPayment: Visa ****-1901\nDelivery: Standard Home`,
    uber: `UBER RIDE VOUCHER\nTRIP ID: UBR-882201\nDistance: 12.4 km\nVehicle Type: Uber Comfort (Standard ICE)\nFare: $22.40`,
    grocery: `WHOLE FOODS checkout\nSTORE: #1010 Portland\n1x Ground Beef (1.2 lbs) - $7.99\n1x Organic Romaine Lettuce - $2.49\n1x Almond Milk (1 Gal) - $3.99\nCheckout: Cash`
  };

  const handleReceiptSelectChange = (e) => {
    const val = e.target.value;
    setReceiptSelection(val);
    if (val && receiptMockData[val]) {
      setReceiptText(receiptMockData[val]);
    } else {
      setReceiptText('');
    }
  };

  const handleParseReceipt = () => {
    if (!receiptText.trim()) return;
    const result = parseReceipt(receiptText);
    if (result) {
      setParsedResult(result);
      // Trigger quest marker on Three.js planet
      setActiveQuestTrigger({ actionId: result.actionId, timestamp: Date.now() });
    }
  };

  // Computations for Category Breakdown Chart
  const transportBase = carbonCoefficients.transport[qa.transportMode] * qa.transportKm;
  const dietBase = carbonCoefficients.diet[qa.dietType];
  const homeBase = carbonCoefficients.homeEnergy[qa.homeSize] * carbonCoefficients.homeEnergy[qa.energySource];
  const shoppingBase = carbonCoefficients.shopping[qa.shoppingLevel];
  const wasteBase = carbonCoefficients.waste[qa.wasteRecycle];
  const digitalBase = carbonCoefficients.digital[qa.digitalStreaming || 'average'];
  const financeBase = carbonCoefficients.finance[qa.financialInvest || 'conventional'];

  let transportDeduct = 0;
  let foodDeduct = 0;
  let energyDeduct = 0;
  let shoppingDeduct = 0;
  let wasteDeduct = 0;
  let digitalDeduct = 0;
  let financeDeduct = 0;

  state.completedActions.forEach(actionId => {
    const act = actionsDatabase.find(a => a.id === actionId);
    if (act) {
      let savings = act.savings;
      if (actionId === 'commute_bike' && qa.transportMode === 'car') {
        savings = carbonCoefficients.transport.car * qa.transportKm;
      } else if (actionId === 'public_transit' && qa.transportMode === 'car') {
        savings = Math.max(0.5, (carbonCoefficients.transport.car - carbonCoefficients.transport.public) * qa.transportKm);
      }

      if (act.category === 'transport') transportDeduct += savings;
      else if (act.category === 'food') foodDeduct += savings;
      else if (act.category === 'energy') energyDeduct += savings;
      else if (act.category === 'shopping') shoppingDeduct += savings;
      else if (act.category === 'waste') wasteDeduct += savings;
      else if (act.category === 'digital') digitalDeduct += savings;
      else if (act.category === 'finance') financeDeduct += savings;
    }
  });

  const categories = [
    { class: 'transport', name: 'Transit', val: Math.max(0, transportBase - transportDeduct), max: Math.max(6, transportBase) },
    { class: 'food', name: 'Diet', val: Math.max(0, dietBase - foodDeduct), max: Math.max(6, dietBase) },
    { class: 'energy', name: 'Home', val: Math.max(0, homeBase - energyDeduct), max: Math.max(6, homeBase) },
    { class: 'shopping', name: 'Shopping', val: Math.max(0, shoppingBase - shoppingDeduct), max: Math.max(6, shoppingBase) },
    { class: 'waste', name: 'Waste', val: Math.max(0, wasteBase - wasteDeduct), max: Math.max(6, wasteBase) },
    { class: 'digital', name: 'Digital', val: Math.max(0, digitalBase - digitalDeduct), max: Math.max(2, digitalBase) },
    { class: 'finance', name: 'Finance', val: Math.max(0, financeBase - financeDeduct), max: Math.max(6, financeBase) }
  ];

  // Projections calculations
  const maxScale = 25;
  const basePercent = Math.min(100, (state.baselineCarbon / maxScale) * 100);
  const curPercent = Math.min(100, (state.currentCarbon / maxScale) * 100);
  const tarPercent = (state.dailyBudget / maxScale) * 100;

  // Equivalents calculations
  const savedToday = parseFloat(Math.max(0, state.baselineCarbon - state.currentCarbon).toFixed(1));
  const treeEquiv = Math.max(0, (state.carbonSaved + savedToday) * 0.05);
  const flightEquiv = Math.max(0, (state.carbonSaved + savedToday) * 0.004);
  const bulbEquiv = Math.max(0, (state.carbonSaved + savedToday) * 12);

  // Budget status text
  const budgetDifference = parseFloat(Math.abs(state.currentCarbon - state.dailyBudget).toFixed(1));
  const budgetIsUnder = state.currentCarbon <= state.dailyBudget;

  const handleQuestDeliver = (actionId) => {
    toggleAction(actionId, true);
  };

  return (
    <section id="dashboard-page" className="tab-page active">
      <div className="dashboard-grid">
        
        {/* WebGL 3D Planet card */}
        <div className="glass-card pulse-card glow-primary" id="carbon-twin-avatar">
          <h3>Carbon Courier 3D Planet</h3>
          
          <CourierPlanet 
            currentCarbon={state.currentCarbon}
            completedActions={state.completedActions}
            dailyBudget={state.dailyBudget}
            onQuestDeliver={handleQuestDeliver}
            activeQuestTrigger={activeQuestTrigger}
          />

          <div className="controls-legend-box" style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.4' }}>
            <span style={{ border: '1px solid var(--border-glass)', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', marginRight: '2px' }}>A</span>
            <span style={{ border: '1px solid var(--border-glass)', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', marginRight: '2px' }}>D</span> / 
            <span style={{ border: '1px solid var(--border-glass)', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', marginRight: '2px' }}>←</span>
            <span style={{ border: '1px solid var(--border-glass)', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', marginRight: '2px' }}>→</span> to Walk | Click & Drag to Spin Planet | Walk to bouncing arrows & press SPACE to Deliver Quests!
          </div>

          <p className="carbon-budget-status" id="dash-budget-status-text" style={{ marginTop: '1rem' }}>
            {budgetIsUnder ? (
              <>
                🎉 Outstanding! Your daily footprint is <strong style={{ color: 'var(--color-primary)' }}>{budgetDifference} kg under</strong> the sustainable budget limit of 8.0 kg.
              </>
            ) : (
              <>
                ⚠️ Grid Alert: Your daily footprint exceeds the sustainable budget by <strong style={{ color: 'var(--color-danger)' }}>{budgetDifference} kg</strong>. Walk the courier to landmarks to perform green audits!
              </>
            )}
          </p>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="glass-card analytics-card">
          <div className="card-header-actions">
            <h3>Carbon Breakdown</h3>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={onRecalculate} type="button">Recalculate Quiz</button>
          </div>
          
          <div className="chart-container" id="dashboard-chart-container">
            {categories.map((cat) => {
              const percentHeight = cat.max > 0 ? (cat.val / cat.max) * 100 : 0;
              return (
                <div key={cat.name} className="chart-bar-wrapper">
                  <div className="chart-bar-container">
                    <div 
                      className={`chart-bar-fill ${cat.class}`} 
                      style={{ height: `${percentHeight}%`, transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    >
                      <span className="chart-value">{cat.val.toFixed(1)}</span>
                    </div>
                  </div>
                  <span className="chart-label" title={cat.name}>{cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <div className="dashboard-subgrid">
        
        {/* Projections Trajectory Line Graph */}
        <div className="glass-card projections-card">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>Avoided Emissions Trajectory</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Simulated progress vs. sustainable target.</p>
          
          <div className="projection-line-container">
            <div className="projection-step baseline">
              <span className="projection-val" id="proj-baseline-val">{state.baselineCarbon} kg</span>
              <div className="projection-dot" id="proj-baseline-dot" style={{ bottom: `${basePercent}%` }}></div>
              <span className="projection-step-label">Baseline</span>
            </div>
            <div className="projection-step">
              <span className="projection-val" id="proj-current-val">{state.currentCarbon} kg</span>
              <div className="projection-dot" id="proj-current-dot" style={{ bottom: `${curPercent}%` }}></div>
              <span className="projection-step-label">Current Today</span>
            </div>
            <div className="projection-step target">
              <span className="projection-val" id="proj-target-val">{state.dailyBudget} kg</span>
              <div className="projection-dot" id="proj-target-dot" style={{ bottom: `${tarPercent}%` }}></div>
              <span className="projection-step-label">Sustainable Goal</span>
            </div>
          </div>
        </div>

        {/* Equivalents display */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Lifetime Impact Equivalents</h3>
          <div className="impact-equivalents-grid" style={{ gridTemplateColumns: '1fr', gap: '0.75rem' }}>
            
            <div className="equivalent-card" style={{ flexDirection: 'row', gap: '1rem', textAlign: 'left', padding: '0.75rem 1rem' }}>
              <div className="equivalent-icon eq-trees" style={{ marginBottom: 0 }}>
                <svg viewBox="0 0 24 24"><path d="M12 2L3 9h4v10h10V9h4L12 2z"/><path d="M12 12v7" strokeLinecap="round"/></svg>
              </div>
              <div>
                <span className="equivalent-value" id="eq-trees-val">{treeEquiv.toFixed(1)}</span>
                <span className="equivalent-label" style={{ display: 'block' }}>Tree-Months Planted</span>
              </div>
            </div>

            <div className="equivalent-card" style={{ flexDirection: 'row', gap: '1rem', textAlign: 'left', padding: '0.75rem 1rem' }}>
              <div className="equivalent-icon eq-flights" style={{ marginBottom: 0 }}>
                <svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round"/></svg>
              </div>
              <div>
                <span className="equivalent-value" id="eq-flights-val">{flightEquiv.toFixed(2)}</span>
                <span className="equivalent-label" style={{ display: 'block' }}>Flights Avoided</span>
              </div>
            </div>

            <div className="equivalent-card" style={{ flexDirection: 'row', gap: '1rem', textAlign: 'left', padding: '0.75rem 1rem' }}>
              <div className="equivalent-icon eq-bulbs" style={{ marginBottom: 0 }}>
                <svg viewBox="0 0 24 24"><path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M6.34 17.66l-1.41 1.41M12 20v2M17.66 17.66l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41M12 7a5 5 0 100 10 5 5 0 000-10z" strokeLinecap="round"/></svg>
              </div>
              <div>
                <span className="equivalent-value" id="eq-bulbs-val">{Math.round(bulbEquiv)}</span>
                <span className="equivalent-label" style={{ display: 'block' }}>LED Bulb Hours Saved</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Passive Simulators */}
      <div className="tracking-simulator-grid">
        
        {/* GPS panel */}
        <div className={`glass-card ${gpsClass}`} id="gps-sim-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>GPS Mobility Auto-Sync</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Automatically map commutes and transportation modes via background GPS tracking.
            </p>
          </div>
          
          <div className="sim-toggle-row">
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Enable GPS tracking simulator</span>
            <label className="switch">
              <input 
                type="checkbox" 
                id="gps-sim-toggle" 
                checked={state.gpsActive}
                onChange={handleGpsToggle}
                aria-label="Enable GPS tracking simulator"
              />
              <span className="slider-toggle"></span>
            </label>
          </div>

          <div className="sim-gps-indicator">
            <span className="gps-pulse-dot"></span>
            <span id="gps-sim-status">{gpsSimStatus}</span>
          </div>
        </div>

        {/* E-Commerce parser */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>E-Commerce Receipt Scanner</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Simulate AI computer vision transaction parsing to calculate Scope 3 consumption emissions.
          </p>
          
          <div className="parser-layout">
            <div className="parser-select-group">
              <select 
                className="parser-dropdown" 
                id="parser-receipt-dropdown" 
                value={receiptSelection}
                onChange={handleReceiptSelectChange}
                aria-label="Select Mock Receipt"
              >
                <option value="">-- Choose Mock Receipt --</option>
                <option value="jacket">Amazon checkout: Recycled Polyester Jacket</option>
                <option value="uber">Uber invoice: 12.4 km Comfort ride</option>
                <option value="grocery">Whole Foods: Beef & Vegetable groceries</option>
              </select>
              <button 
                className="btn btn-primary" 
                id="parser-parse-btn" 
                onClick={handleParseReceipt}
                style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.8rem' }} 
                type="button"
              >
                AI Parse
              </button>
            </div>

            <textarea 
              className="parser-textarea" 
              id="parser-textarea-input" 
              value={receiptText}
              onChange={(e) => setReceiptText(e.target.value)}
              placeholder="Select a receipt from dropdown or paste receipt content here..." 
              aria-label="Receipt Content"
            ></textarea>

            {parsedResult && (
              <div className="parser-result-box" id="parser-result-box" style={{ display: 'block' }}>
                <div className="parser-result-header">
                  <span id="parser-result-name">{parsedResult.name}</span>
                  <span id="parser-confidence-val">{parsedResult.confidence}%</span>
                </div>
                <div className="parser-confidence-bar">
                  <div className="parser-confidence-fill" id="parser-confidence-fill" style={{ width: `${parsedResult.confidence}%` }}></div>
                </div>
                <span id="parser-result-emissions" style={{ fontWeight: 'bold', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                  Emissions: {parsedResult.emissions} kg CO₂e
                </span>
                <span id="parser-result-advice" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  {parsedResult.advice}
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
