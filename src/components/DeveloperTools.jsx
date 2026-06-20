import React from 'react';
import { useAppState } from '../AppStateContext';

export default function DeveloperTools({ onClose }) {
  const { testResults, runUnitTests, clearTestResults } = useAppState();

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true" style={{ zIndex: 1000, overflowY: 'auto' }}>
      <div className="test-log-card" style={{ maxWidth: '800px', width: '90%', margin: '2rem auto', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', padding: '2rem', borderRadius: '20px', boxShadow: 'var(--shadow-main)' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#fff' }}>
              🧪 Automated Unit Test Suite
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Validate calculator coefficients, NLP coach intent routes, receipt parser, and state updates.</span>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              clearTestResults();
              onClose();
            }}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            type="button"
          >
            Close
          </button>
        </header>

        <div className="test-dashboard" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="test-stat-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-glass)' }}>
            <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Total Tests</h4>
            <div className="value" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              {testResults ? testResults.total : 0}
            </div>
          </div>
          <div className="test-stat-card passed" style={{ background: 'rgba(16,185,129,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(16,185,129,0.1)' }}>
            <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Passed</h4>
            <div className="value" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '4px' }}>
              {testResults ? testResults.passed : 0}
            </div>
          </div>
          <div className="test-stat-card failed" style={{ background: 'rgba(239,68,68,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.1)' }}>
            <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Failed</h4>
            <div className="value" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-danger)', marginTop: '4px' }}>
              {testResults ? testResults.failed : 0}
            </div>
          </div>
          <div className="test-stat-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-glass)' }}>
            <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Duration</h4>
            <div className="value" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
              {testResults ? `${testResults.duration}ms` : '0ms'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Assertion Log:</span>
          <button className="btn btn-primary" onClick={runUnitTests} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} type="button">
            Execute Suite
          </button>
        </div>

        <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {testResults ? (
            testResults.results.map((res, index) => (
              <div 
                key={index} 
                className="test-row"
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.6rem 0.8rem', 
                  background: 'rgba(255,255,255,0.01)', 
                  border: '1px solid var(--border-glass)', 
                  borderRadius: '10px', 
                  marginBottom: '0.4rem' 
                }}
              >
                <div className="test-info" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-secondary)', fontWeight: 'bold' }}>
                    {res.group}
                  </span>
                  <span className="test-name" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
                    {res.name}
                  </span>
                  <span className="test-assertion" style={{ fontSize: '0.7rem', color: res.condition ? 'var(--text-muted)' : 'var(--color-danger)' }}>
                    {res.assertionMsg}
                  </span>
                </div>
                <span className={`test-badge ${res.condition ? 'pass' : 'fail'}`} style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '50px', fontWeight: 'bold', border: '1px solid transparent' }}>
                  {res.condition ? 'PASS' : 'FAIL'}
                </span>
              </div>
            ))
          ) : (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Click "Execute Suite" above to run unit assertions on active modules.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
