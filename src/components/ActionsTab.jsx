import React, { useState } from 'react';
import { useAppState, actionsDatabase } from '../AppStateContext';

export default function ActionsTab() {
  const { state, toggleAction } = useAppState();
  const [filter, setFilter] = useState('all');

  const filteredActions = actionsDatabase.filter(act => {
    if (filter === 'all') return true;
    return act.category === filter;
  });

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'transport', label: 'Transit' },
    { id: 'food', label: 'Diet' },
    { id: 'energy', label: 'Home Energy' },
    { id: 'waste', label: 'Waste' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'digital', label: 'Digital' },
    { id: 'finance', label: 'Finance' }
  ];

  return (
    <section id="actions-page" className="tab-page active">
      <div className="actions-layout">
        
        {/* Habit Checklist Container */}
        <div className="glass-card">
          <div className="actions-filters" role="tablist" aria-label="Filter Actions By Domain">
            {categories.map((cat) => (
              <button 
                key={cat.id}
                className={`filter-btn ${filter === cat.id ? 'active' : ''}`} 
                onClick={() => setFilter(cat.id)}
                role="tab" 
                aria-selected={filter === cat.id ? 'true' : 'false'}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="action-items-list" id="actions-checklist-container">
            {filteredActions.map((act) => {
              const completed = state.completedActions.includes(act.id);
              return (
                <div key={act.id} className={`action-item-row ${completed ? 'completed' : ''}`}>
                  <label className="action-checkbox-wrapper" htmlFor={`chk-${act.id}`}>
                    <input 
                      type="checkbox" 
                      id={`chk-${act.id}`}
                      checked={completed}
                      onChange={() => toggleAction(act.id)}
                      aria-label={`Log action: ${act.name}`}
                    />
                    <span className="custom-checkbox"></span>
                  </label>
                  <div className="action-item-details">
                    <span className="action-item-name">{act.name}</span>
                    <span className="action-item-desc">{act.desc}</span>
                  </div>
                  <div className="action-item-metrics">
                    <span className="metric-badge carbon">-{act.savings} kg</span>
                    <span className="metric-badge points">+{act.points} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel: Streak & Badges */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700 }}>Eco-Streak Bonus</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Logging at least <strong>one green action</strong> daily increases your active streak. Reaching milestones triggers massive EcoPoint bonuses!
          </p>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>UPCOMING BONUS:</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>5-Day Streak (+100 EcoPoints)</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {state.streak >= 4 ? 'Only 1 more day to reach!' : `${5 - state.streak} more days to reach!`}
            </span>
          </div>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, marginTop: '1rem' }}>Badges Showcase</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--border-glass-glow)', borderRadius: '12px', padding: '0.75rem 0.5rem', textAlign: 'center' }} title="Earned for finishing carbon onboarding">
              <span style={{ fontSize: '1.5rem' }}>🌱</span>
              <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>Pioneer</div>
            </div>
            <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '12px', padding: '0.75rem 0.5rem', textAlign: 'center' }} title="Earned for logging a bike trip">
              <span style={{ fontSize: '1.5rem' }}>🚴</span>
              <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>PedalPower</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '0.75rem 0.5rem', textAlign: 'center', opacity: 0.4 }} title="Eat vegan for 7 consecutive days to unlock">
              <span style={{ fontSize: '1.5rem' }}>🥑</span>
              <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>GreenDiet</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
