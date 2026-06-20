import React, { useState } from 'react';
import { useAppState } from '../AppStateContext';

export default function QuizTab({ setActiveTab }) {
  const { state, updateQuiz } = useAppState();
  const [currentStep, setCurrentStep] = useState(1);

  // Local state for quiz selections, pre-filled with existing values
  const [answers, setAnswers] = useState({
    transportMode: state.quizAnswers.transportMode,
    transportKm: state.quizAnswers.transportKm,
    dietType: state.quizAnswers.dietType,
    homeSize: state.quizAnswers.homeSize,
    energySource: state.quizAnswers.energySource,
    shoppingLevel: state.quizAnswers.shoppingLevel,
    wasteRecycle: state.quizAnswers.wasteRecycle || 'partial',
    digitalStreaming: state.quizAnswers.digitalStreaming,
    financialInvest: state.quizAnswers.financialInvest
  });

  const updateAnswer = (key, val) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      updateQuiz(answers);
      setActiveTab('dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <section id="quiz-page" className="tab-page active">
      <div className="glass-card quiz-container">
        
        {/* Step progress dots */}
        <div className="quiz-progress-bar">
          <div className="quiz-progress-line" style={{ width: `${((currentStep - 1) / 5) * 100}%` }}></div>
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div 
              key={num} 
              className={`quiz-progress-step ${currentStep >= num ? 'active' : ''}`}
              onClick={() => setCurrentStep(num)}
              style={{ cursor: 'pointer' }}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Step 1: Transport */}
        {currentStep === 1 && (
          <div className="quiz-step-panel active" id="quiz-step-1">
            <h3 className="quiz-question">How do you commute most often?</h3>
            <div className="quiz-input-group">
              <div className="quiz-options-grid" role="radiogroup" aria-label="Transportation Mode">
                <div 
                  className={`quiz-option-card ${answers.transportMode === 'car' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('transportMode', 'car')}
                  tabIndex="0" role="radio" aria-checked={answers.transportMode === 'car'}
                >
                  <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M5 11V6a3 3 0 016 0v5M19 11V6a3 3 0 00-6 0v5"/></svg>
                  <span className="quiz-option-title">Gas Car</span>
                </div>
                <div 
                  className={`quiz-option-card ${answers.transportMode === 'ev' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('transportMode', 'ev')}
                  tabIndex="0" role="radio" aria-checked={answers.transportMode === 'ev'}
                >
                  <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  <span className="quiz-option-title">Electric Vehicle</span>
                </div>
                <div 
                  className={`quiz-option-card ${answers.transportMode === 'public' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('transportMode', 'public')}
                  tabIndex="0" role="radio" aria-checked={answers.transportMode === 'public'}
                >
                  <svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M8 19h8M6 8h12M8 13h2M14 13h2"/></svg>
                  <span className="quiz-option-title">Public Transit</span>
                </div>
                <div 
                  className={`quiz-option-card ${answers.transportMode === 'bike_walk' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('transportMode', 'bike_walk')}
                  tabIndex="0" role="radio" aria-checked={answers.transportMode === 'bike_walk'}
                >
                  <svg viewBox="0 0 24 24"><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M12 18V8M9 12h6M19 18l-4-8-3 3"/></svg>
                  <span className="quiz-option-title">Bike / Walk</span>
                </div>
              </div>

              <div className="slider-wrapper">
                <div className="slider-labels">
                  <label htmlFor="quiz-km-slider">Daily Commute Distance:</label>
                  <span className="slider-current-val" id="quiz-km-val">{answers.transportKm} km</span>
                </div>
                <input 
                  type="range" 
                  id="quiz-km-slider" 
                  min="0" 
                  max="100" 
                  value={answers.transportKm} 
                  onChange={(e) => updateAnswer('transportKm', parseInt(e.target.value))}
                  aria-valuemin="0" 
                  aria-valuemax="100" 
                  aria-valuenow={answers.transportKm}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Diet */}
        {currentStep === 2 && (
          <div className="quiz-step-panel active" id="quiz-step-2">
            <h3 className="quiz-question">Which option best represents your typical diet?</h3>
            <div className="quiz-input-group">
              <div className="quiz-options-grid" role="radiogroup" aria-label="Typical Diet">
                <div 
                  className={`quiz-option-card ${answers.dietType === 'heavy_meat' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('dietType', 'heavy_meat')}
                  tabIndex="0" role="radio" aria-checked={answers.dietType === 'heavy_meat'}
                >
                  <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10" strokeWidth="2"/><circle cx="12" cy="12" r="4"/></svg>
                  <span className="quiz-option-title">Heavy Meat Eater</span>
                </div>
                <div 
                  className={`quiz-option-card ${answers.dietType === 'average' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('dietType', 'average')}
                  tabIndex="0" role="radio" aria-checked={answers.dietType === 'average'}
                >
                  <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10" strokeWidth="2"/></svg>
                  <span className="quiz-option-title">Balanced / Average</span>
                </div>
                <div 
                  className={`quiz-option-card ${answers.dietType === 'low_meat' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('dietType', 'low_meat')}
                  tabIndex="0" role="radio" aria-checked={answers.dietType === 'low_meat'}
                >
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8" strokeWidth="2"/></svg>
                  <span className="quiz-option-title">Low Meat / Veggie</span>
                </div>
                <div 
                  className={`quiz-option-card ${answers.dietType === 'vegan' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('dietType', 'vegan')}
                  tabIndex="0" role="radio" aria-checked={answers.dietType === 'vegan'}
                >
                  <svg viewBox="0 0 24 24"><path d="M12 2c5.523 0 10 4.477 10 10v1a9 9 0 01-9 9H5a2 2 0 01-2-2v-8a10 10 0 0110-10z"/></svg>
                  <span className="quiz-option-title">Strict Vegan</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Home Energy */}
        {currentStep === 3 && (
          <div className="quiz-step-panel active" id="quiz-step-3">
            <h3 className="quiz-question">Describe your living arrangement and home power.</h3>
            <div className="quiz-input-group">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Home Size:</span>
              <div className="quiz-options-grid" role="radiogroup" aria-label="Home Size">
                <div 
                  className={`quiz-option-card ${answers.homeSize === 'small' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('homeSize', 'small')}
                  tabIndex="0" role="radio" aria-checked={answers.homeSize === 'small'}
                >
                  <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg>
                  <span className="quiz-option-title">Apartment (Small)</span>
                </div>
                <div 
                  className={`quiz-option-card ${answers.homeSize === 'medium' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('homeSize', 'medium')}
                  tabIndex="0" role="radio" aria-checked={answers.homeSize === 'medium'}
                >
                  <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM9 22V12h6v10"/></svg>
                  <span className="quiz-option-title">Townhouse (Medium)</span>
                </div>
                <div 
                  className={`quiz-option-card ${answers.homeSize === 'large' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('homeSize', 'large')}
                  tabIndex="0" role="radio" aria-checked={answers.homeSize === 'large'}
                >
                  <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M9 22V10h6v12M12 5v2"/></svg>
                  <span className="quiz-option-title">Stand-alone (Large)</span>
                </div>
              </div>

              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '1rem', display: 'block' }}>Primary Electricity/Heating Source:</span>
              <div className="quiz-options-grid" role="radiogroup" aria-label="Home Energy Source">
                <div 
                  className={`quiz-option-card ${answers.energySource === 'coal_gas' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('energySource', 'coal_gas')}
                  tabIndex="0" role="radio" aria-checked={answers.energySource === 'coal_gas'}
                >
                  <svg viewBox="0 0 24 24"><path d="M19 10L14 3v7H9l5 7v-7h5zM5 21v-4h14v4H5z"/></svg>
                  <span className="quiz-option-title">Fossil Fuel (Coal/Gas)</span>
                </div>
                <div 
                  className={`quiz-option-card ${answers.energySource === 'grid' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('energySource', 'grid')}
                  tabIndex="0" role="radio" aria-checked={answers.energySource === 'grid'}
                >
                  <svg viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 3.8L19.2 19H4.8L12 5.8z"/></svg>
                  <span className="quiz-option-title">Standard Grid Mix</span>
                </div>
                <div 
                  className={`quiz-option-card ${answers.energySource === 'clean_renewables' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('energySource', 'clean_renewables')}
                  tabIndex="0" role="radio" aria-checked={answers.energySource === 'clean_renewables'}
                >
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2v6M12 16v6M2 12h6M16 12h6" strokeLinecap="round"/></svg>
                  <span className="quiz-option-title">100% Renewable / Solar</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Shopping Habits */}
        {currentStep === 4 && (
          <div className="quiz-step-panel active" id="quiz-step-4">
            <h3 className="quiz-question">How frequently do you purchase brand-new goods?</h3>
            <div className="quiz-input-group">
              <div className="quiz-options-grid" role="radiogroup" aria-label="Shopping Frequency">
                <div 
                  className={`quiz-option-card ${answers.shoppingLevel === 'high' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('shoppingLevel', 'high')}
                  tabIndex="0" role="radio" aria-checked={answers.shoppingLevel === 'high'}
                >
                  <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
                  <span className="quiz-option-title">Frequently (High)</span>
                </div>
                <div 
                  className={`quiz-option-card ${answers.shoppingLevel === 'average' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('shoppingLevel', 'average')}
                  tabIndex="0" role="radio" aria-checked={answers.shoppingLevel === 'average'}
                >
                  <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
                  <span className="quiz-option-title">Moderate (Average)</span>
                </div>
                <div 
                  className={`quiz-option-card ${answers.shoppingLevel === 'low' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('shoppingLevel', 'low')}
                  tabIndex="0" role="radio" aria-checked={answers.shoppingLevel === 'low'}
                >
                  <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  <span className="quiz-option-title">Minimal / Second-hand</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Digital Footprint */}
        {currentStep === 5 && (
          <div className="quiz-step-panel active" id="quiz-step-5">
            <h3 className="quiz-question">What is your daily digital activity (streaming & cloud usage)?</h3>
            <div className="quiz-input-group">
              <div className="quiz-options-grid" role="radiogroup" aria-label="Digital Activity">
                <div 
                  className={`quiz-option-card ${answers.digitalStreaming === 'low' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('digitalStreaming', 'low')}
                  tabIndex="0" role="radio" aria-checked={answers.digitalStreaming === 'low'}
                >
                  <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="21"/><path d="M9 12l2 2 4-4" strokeLinecap="round"/></svg>
                  <span className="quiz-option-title">Under 1 hour/day</span>
                </div>
                <div 
                  className={`quiz-option-card ${answers.digitalStreaming === 'average' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('digitalStreaming', 'average')}
                  tabIndex="0" role="radio" aria-checked={answers.digitalStreaming === 'average'}
                >
                  <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                  <span className="quiz-option-title">1 - 4 hours/day</span>
                </div>
                <div 
                  className={`quiz-option-card ${answers.digitalStreaming === 'high' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('digitalStreaming', 'high')}
                  tabIndex="0" role="radio" aria-checked={answers.digitalStreaming === 'high'}
                >
                  <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M12 2v2M12 17v4M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41"/></svg>
                  <span className="quiz-option-title">4+ hours (HD Streaming)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Financial Footprint */}
        {currentStep === 6 && (
          <div className="quiz-step-panel active" id="quiz-step-6">
            <h3 className="quiz-question">Which aligns closest with your banking/investments?</h3>
            <div className="quiz-input-group">
              <div className="quiz-options-grid" role="radiogroup" aria-label="Financial Banking">
                <div 
                  className={`quiz-option-card ${answers.financialInvest === 'green' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('financialInvest', 'green')}
                  tabIndex="0" role="radio" aria-checked={answers.financialInvest === 'green'}
                >
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>
                  <span className="quiz-option-title">Green Banks / ESG portfolios</span>
                </div>
                <div 
                  className={`quiz-option-card ${answers.financialInvest === 'balanced' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('financialInvest', 'balanced')}
                  tabIndex="0" role="radio" aria-checked={answers.financialInvest === 'balanced'}
                >
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
                  <span className="quiz-option-title">Balanced / Conventional mix</span>
                </div>
                <div 
                  className={`quiz-option-card ${answers.financialInvest === 'conventional' ? 'selected' : ''}`}
                  onClick={() => updateAnswer('financialInvest', 'conventional')}
                  tabIndex="0" role="radio" aria-checked={answers.financialInvest === 'conventional'}
                >
                  <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17h6M12 7v7"/></svg>
                  <span className="quiz-option-title">Conventional commercial bank</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Buttons */}
        <div className="quiz-actions">
          <button 
            className="btn btn-secondary" 
            id="quiz-prev-btn" 
            onClick={handleBack}
            disabled={currentStep === 1}
            style={{ opacity: currentStep === 1 ? 0.4 : 1, cursor: currentStep === 1 ? 'not-allowed' : 'pointer' }}
            type="button"
          >
            Back
          </button>
          <button 
            className="btn btn-primary" 
            id="quiz-next-btn" 
            onClick={handleNext}
            type="button"
          >
            {currentStep === 6 ? 'Finish & Calibrate' : 'Continue'}
          </button>
        </div>

      </div>
    </section>
  );
}
