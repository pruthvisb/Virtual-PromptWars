import React, { useState } from 'react';
import { useAppState, rewardsDatabase, offsetsDatabase } from '../AppStateContext';

export default function MarketplaceTab() {
  const { state, redeemReward, sponsorOffset } = useAppState();
  const [successModal, setSuccessModal] = useState({ active: false, title: '', details: '', icon: '' });

  const handleRedeem = (rewardId) => {
    const res = redeemReward(rewardId);
    if (res) {
      setSuccessModal({
        active: true,
        title: 'Voucher Redeemed!',
        details: `Voucher for "${res.title}" has been added to your profile. Partner: ${res.partner}. Code: MOCK-${Math.floor(100000 + Math.random() * 900000)}`,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a4 4 0 00-4 4v5c0 2.2 1.8 4 4 4s4-1.8 4-4V6a4 4 0 00-4-4z"/>
          </svg>
        )
      });
    }
  };

  const handleSponsor = (offsetId) => {
    const res = sponsorOffset(offsetId);
    if (res) {
      setSuccessModal({
        active: true,
        title: 'Sponsorship Logged!',
        details: `Sponsorship for "${res.title}" verified on ledger. Standard: ${res.standard}. Registry: ${res.registry}. Thank you for mitigating emissions!`,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM9 12l2 2 4-4"/>
          </svg>
        )
      });
    }
  };

  return (
    <section id="marketplace-page" className="tab-page active">
      <div className="marketplace-layout">
        
        {/* Verified Offsets Ledger */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verified Carbon Offset Ledger</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Support additionality-verified global carbon offset programs. Sponsor credits are recorded to our private blockchain ledger.
          </p>
          
          <div className="rewards-grid" id="offsets-grid-container">
            {offsetsDatabase.map((offset) => {
              const redeemedCount = state.redeemedRewards.filter(rId => rId === offset.id).length;
              return (
                <div key={offset.id} className="reward-card">
                  <div className="reward-card-header">
                    <span className="reward-partner">{offset.registry}</span>
                    <span className="reward-badge offset">{offset.standard}</span>
                  </div>
                  <h4 className="reward-title">{offset.title}</h4>
                  <p className="reward-desc">Efficiency: <strong>{offset.efficiency}</strong></p>
                  
                  <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                      <span>Additionality Confidence</span>
                      <strong>{offset.confidence}%</strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ background: 'var(--color-primary)', height: '100%', width: `${offset.confidence}%` }}></div>
                    </div>
                  </div>

                  <div className="reward-card-footer">
                    <span className="reward-cost">{offset.cost} pts</span>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleSponsor(offset.id)}
                      disabled={state.points < offset.cost}
                      style={{ opacity: state.points < offset.cost ? 0.5 : 1, cursor: state.points < offset.cost ? 'not-allowed' : 'pointer' }}
                      type="button"
                    >
                      Sponsor {redeemedCount > 0 ? `(${redeemedCount})` : ''}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sustainable Rewards Marketplace */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Sustainable Rewards Marketplace</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Redeem EcoPoints for utilities rebates, transit credits, and zero-plastic soap bars.
          </p>
          
          <div className="rewards-grid" id="rewards-grid-container">
            {rewardsDatabase.map((reward) => {
              const redeemedCount = state.redeemedRewards.filter(rId => rId === reward.id).length;
              return (
                <div key={reward.id} className="reward-card">
                  <div className="reward-card-header">
                    <span className="reward-partner">{reward.partner}</span>
                    <span className="reward-badge">{reward.category}</span>
                  </div>
                  <h4 className="reward-title">{reward.title}</h4>
                  <p className="reward-desc">{reward.desc}</p>
                  
                  <div className="reward-card-footer">
                    <span className="reward-cost">{reward.cost} pts</span>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleRedeem(reward.id)}
                      disabled={state.points < reward.cost}
                      style={{ opacity: state.points < reward.cost ? 0.5 : 1, cursor: state.points < reward.cost ? 'not-allowed' : 'pointer' }}
                      type="button"
                    >
                      Redeem {redeemedCount > 0 ? `(${redeemedCount})` : ''}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Success Modal Overlay */}
      {successModal.active && (
        <div className="modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-card">
            <div className="modal-icon-container">
              {successModal.icon}
            </div>
            <h3 className="modal-title" id="modal-title">{successModal.title}</h3>
            <div className="modal-desc" id="modal-reward-details">
              {successModal.details}
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => setSuccessModal({ active: false, title: '', details: '', icon: '' })}
              style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} 
              type="button"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </section>
  );
}
