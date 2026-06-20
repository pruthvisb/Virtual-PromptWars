import React, { useState, useRef, useEffect } from 'react';
import { useAppState, actionsDatabase } from '../AppStateContext';

const weeklyPlanData = {
  budget: [
    { day: 'Mon', action: 'Cold Laundry Wash', savings: 0.8, actionId: 'cold_wash' },
    { day: 'Tue', action: 'Leftover Meal Log', savings: 0.5, actionId: 'compost_waste' },
    { day: 'Wed', action: 'Unplug Standby Devices', savings: 0.4, actionId: 'digital_cleaning' },
    { day: 'Thu', action: 'Line Dry Clothes', savings: 1.5, actionId: 'hang_dry' },
    { day: 'Fri', action: 'Lower Thermostat 2°', savings: 1.2, actionId: 'turn_down_heating' },
    { day: 'Sat', action: 'Thrift Shopping', savings: 4.5, actionId: 'second_hand' },
    { day: 'Sun', action: 'Vegetarian Dinner', savings: 1.8, actionId: 'meatless_meal' }
  ],
  impact: [
    { day: 'Mon', action: 'Commute by Bike', savings: 3.6, actionId: 'commute_bike' },
    { day: 'Tue', action: 'Green Portfolio Setup', savings: 4.5, actionId: 'green_portfolio' },
    { day: 'Wed', action: 'Vegan Meal Day', savings: 1.8, actionId: 'meatless_meal' },
    { day: 'Thu', action: 'Renewable Electricity', savings: 5.0, actionId: 'turn_down_heating' },
    { day: 'Fri', action: 'Commute by Bike', savings: 3.6, actionId: 'commute_bike' },
    { day: 'Sat', action: 'Zero Waste Recycle', savings: 0.9, actionId: 'compost_waste' },
    { day: 'Sun', action: 'Line Dry Clothes', savings: 1.5, actionId: 'hang_dry' }
  ],
  quick: [
    { day: 'Mon', action: 'Digital Cloud Cleanup', savings: 0.4, actionId: 'digital_cleaning' },
    { day: 'Tue', action: 'Compost Leftovers', savings: 0.7, actionId: 'compost_waste' },
    { day: 'Wed', action: 'Reusable Cup Swap', savings: 0.3, actionId: 'reusable_cup' },
    { day: 'Thu', action: 'Cold Laundry Wash', savings: 0.8, actionId: 'cold_wash' },
    { day: 'Fri', action: 'Local Produce Buy', savings: 0.6, actionId: 'local_produce' },
    { day: 'Sat', action: 'Second Hand Book', savings: 4.5, actionId: 'second_hand' },
    { day: 'Sun', action: 'Vegan Snack', savings: 1.8, actionId: 'meatless_meal' }
  ]
};

export default function AICoachTab({ setActiveTab }) {
  const { state, sendChatMessage, toggleAction, selectWeeklyPlan, showToast } = useAppState();
  const [inputText, setInputText] = useState('');
  const [recFilter, setRecFilter] = useState('impact');
  const chatEndRef = useRef(null);

  // Auto-scroll chat history
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.chatHistory]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText);
    setInputText('');
  };

  const handleQuickQuestion = (q) => {
    sendChatMessage(q);
  };

  // Recommendations sorting/filtering logic
  let recs = [...actionsDatabase];
  if (recFilter === 'impact') {
    recs.sort((a, b) => b.savings - a.savings);
  } else if (recFilter === 'cost') {
    recs.sort((a, b) => b.points - a.points);
  } else {
    recs = recs.filter(r => r.category === 'waste' || r.category === 'shopping' || r.category === 'digital');
  }
  const displayedRecs = recs.slice(0, 3);

  const handleDayCardClick = (dayInfo) => {
    showToast(`Weekly action activated! Walk to the marked landmark on the planet.`, 'success');
    setActiveTab('dashboard');
  };

  return (
    <section id="ai-page" className="tab-page active">
      <div className="ai-layout">
        
        {/* Weekly planner and recommendations */}
        <div className="planner-container">
          
          {/* Weekly Planner Card */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div className="planner-action-bar">
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>AI Weekly Action Planner</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Generate a dynamic carbon reduction agenda tailored to your goals.
                </p>
              </div>
              <div className="actions-filters planner-options" style={{ marginBottom: 0 }} role="tablist" aria-label="Weekly Plan Goal Type">
                <button 
                  className={`filter-btn ${state.activeWeeklyPlan === 'budget' ? 'active' : ''}`}
                  onClick={() => selectWeeklyPlan('budget')}
                  role="tab" aria-selected={state.activeWeeklyPlan === 'budget' ? 'true' : 'false'}
                >
                  Budget-Focused
                </button>
                <button 
                  className={`filter-btn ${state.activeWeeklyPlan === 'impact' ? 'active' : ''}`}
                  onClick={() => selectWeeklyPlan('impact')}
                  role="tab" aria-selected={state.activeWeeklyPlan === 'impact' ? 'true' : 'false'}
                >
                  High Impact
                </button>
                <button 
                  className={`filter-btn ${state.activeWeeklyPlan === 'quick' ? 'active' : ''}`}
                  onClick={() => selectWeeklyPlan('quick')}
                  role="tab" aria-selected={state.activeWeeklyPlan === 'quick' ? 'true' : 'false'}
                >
                  Time Saver
                </button>
              </div>
            </div>

            {/* Weekly Grid */}
            <div className={`planner-weeks-grid ${state.activeWeeklyPlan ? 'active' : ''}`} id="planner-weeks-grid" style={{ display: state.activeWeeklyPlan ? 'grid' : 'none' }}>
              {state.activeWeeklyPlan && weeklyPlanData[state.activeWeeklyPlan].map((dayInfo) => (
                <div 
                  key={dayInfo.day} 
                  className="planner-day-card" 
                  tabIndex="0" 
                  role="button" 
                  onClick={() => handleDayCardClick(dayInfo)}
                  aria-label={`Focus ${dayInfo.action} on ${dayInfo.day}`}
                >
                  <span className="planner-day-title">{dayInfo.day}</span>
                  <span className="planner-day-action">{dayInfo.action}</span>
                  <span className="planner-day-savings">-{dayInfo.savings} kg CO₂</span>
                </div>
              ))}
            </div>

            {!state.activeWeeklyPlan && (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Select a planning mode above to generate your customized AI weekly agenda.
              </div>
            )}
          </div>

          {/* Recommendations Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card-header-actions" style={{ marginBottom: 0 }}>
              <h3>Personalized Recommendations</h3>
              <div className="actions-filters ai-filters" style={{ marginBottom: 0 }} role="tablist" aria-label="Recommendations Sorting">
                <button 
                  className={`filter-btn ${recFilter === 'impact' ? 'active' : ''}`} 
                  onClick={() => setRecFilter('impact')}
                  role="tab" aria-selected={recFilter === 'impact' ? 'true' : 'false'}
                >
                  High Impact
                </button>
                <button 
                  className={`filter-btn ${recFilter === 'cost' ? 'active' : ''}`} 
                  onClick={() => setRecFilter('cost')}
                  role="tab" aria-selected={recFilter === 'cost' ? 'true' : 'false'}
                >
                  High Points
                </button>
                <button 
                  className={`filter-btn ${recFilter === 'quick' ? 'active' : ''}`} 
                  onClick={() => setRecFilter('quick')}
                  role="tab" aria-selected={recFilter === 'quick' ? 'true' : 'false'}
                >
                  Quick Wins
                </button>
              </div>
            </div>
            
            <div className="recommendations-deck" id="recommendations-container">
              {displayedRecs.map((rec) => {
                const completed = state.completedActions.includes(rec.id);
                const impactTier = rec.savings > 3 ? 'high' : (rec.savings > 1.5 ? 'med' : 'low');
                
                return (
                  <div key={rec.id} className="rec-card">
                    <div className="rec-badge-ribbon">
                      <span className={`rec-impact-badge ${impactTier}`}>{impactTier} impact</span>
                      <span className="action-category-tag">{rec.category}</span>
                    </div>
                    <div className="rec-card-details">
                      <h4>{rec.name}</h4>
                      <p>{rec.desc}</p>
                    </div>
                    <div className="rec-footer">
                      <div className="rec-metrics">
                        <span>-{rec.savings} kg</span>
                        <span className="points">+{rec.points} pts</span>
                      </div>
                      <button 
                        className={`btn ${completed ? 'btn-secondary' : 'btn-primary'}`} 
                        onClick={() => toggleAction(rec.id)}
                        type="button"
                      >
                        {completed ? 'Logged ✓' : 'Add Habit'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Chatbot Column */}
        <div className="glass-card chat-card">
          <div className="chat-header">
            <div className="chat-avatar">
              <svg viewBox="0 0 24 24"><path d="M12 2C5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm1 10h3l-4-4-4 4h3v4h2v-4z" strokeWidth="2"/></svg>
            </div>
            <div className="chat-status-info">
              <span className="chat-bot-name">Carbon Pulse Coach</span>
              <span className="chat-bot-status">Online (AI Intelligence)</span>
            </div>
          </div>

          <div className="chat-messages" id="chat-messages-container" aria-live="polite">
            {state.chatHistory.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.sender}`}>
                {msg.text.split('\n').map((line, j) => {
                  // Basic formatting support for markdown bold and lists
                  let formatted = line;
                  
                  // Handle bold **text**
                  const boldRegex = /\*\*(.*?)\*\*/g;
                  let match;
                  const parts = [];
                  let lastIndex = 0;
                  
                  while ((match = boldRegex.exec(line)) !== null) {
                    parts.push(line.substring(lastIndex, match.index));
                    parts.push(<strong key={match.index}>{match[1]}</strong>);
                    lastIndex = boldRegex.lastIndex;
                  }
                  parts.push(line.substring(lastIndex));

                  return (
                    <div key={j} style={{ marginBottom: line.startsWith('-') || line.startsWith('*') ? '0.25rem' : '0.5rem', paddingLeft: line.startsWith('-') || line.startsWith('*') ? '0.75rem' : 0 }}>
                      {parts.length > 1 ? parts : line}
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div style={{ padding: '0.25rem 1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', background: 'rgba(0,0,0,0.1)' }}>
            <button 
              className="filter-btn" 
              style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem', marginBottom: '2px' }}
              onClick={() => handleQuickQuestion('how is my footprint doing today?')}
              type="button"
            >
              📊 Check Score
            </button>
            <button 
              className="filter-btn" 
              style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem', marginBottom: '2px' }}
              onClick={() => handleQuickQuestion('what is my highest emitter?')}
              type="button"
            >
              🔥 Highest Emitter
            </button>
            <button 
              className="filter-btn" 
              style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem', marginBottom: '2px' }}
              onClick={() => handleQuickQuestion('how do I reduce digital emissions?')}
              type="button"
            >
              📱 Digital Tips
            </button>
            <button 
              className="filter-btn" 
              style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem', marginBottom: '2px' }}
              onClick={() => handleQuickQuestion('tell me how to reduce banking emissions')}
              type="button"
            >
              🏦 Banking Tips
            </button>
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              className="chat-input" 
              id="chat-input" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask your AI Coach (e.g. 'how do I reduce digital emissions?')..." 
              aria-label="Ask your AI Coach"
            />
            <button className="chat-send-btn" id="chat-send-btn" type="submit" aria-label="Send Message">
              <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}
