import React, { useState } from 'react';
import { useAppState } from './AppStateContext';
import TopNavbar from './components/TopNavbar';
import Header from './components/Header';
import DashboardTab from './components/DashboardTab';
import QuizTab from './components/QuizTab';
import ActionsTab from './components/ActionsTab';
import AICoachTab from './components/AICoachTab';
import ForesightSandboxTab from './components/ForesightSandboxTab';
import CarbonSinkTab from './components/CarbonSinkTab';
import DeveloperTools from './components/DeveloperTools';
import ThreeDUniverse from './components/ThreeDUniverse';

export default function App() {
  const { state, toasts, cookieConsent, saveCookieSettings } = useAppState();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTests, setShowTests] = useState(false);

  const handleRecalculate = () => {
    setActiveTab('quiz');
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab onRecalculate={handleRecalculate} />;
      case 'quiz':
        return <QuizTab setActiveTab={setActiveTab} />;
      case 'actions':
        return <ActionsTab />;
      case 'ai':
        return <AICoachTab setActiveTab={setActiveTab} />;
      case 'sandbox':
        return <ForesightSandboxTab />;
      case 'sink':
        return <CarbonSinkTab />;
      default:
        return <DashboardTab onRecalculate={handleRecalculate} />;
    }
  };

  return (
    <div className="app-root logged-in">
      {/* Persistent 3D Command Deck viewport in background */}
      <ThreeDUniverse activeTab={activeTab} />
      
      <div className="app-container-vertical">
          {/* Top Navigation Bar */}
          <TopNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Main Content Area */}
          <main className="main-content-full" role="main">
            <Header activeTab={activeTab} onOpenTests={() => setShowTests(true)} />
            
            <div className="tab-page-container">
              {renderActiveTab()}
            </div>
          </main>
      </div>

      {/* Developer Unit Test Suite modal */}
      {showTests && (
        <DeveloperTools onClose={() => setShowTests(false)} />
      )}

      {/* Cookie Consent Banner */}
      {!cookieConsent && (
        <div id="cookie-banner" className="cookie-banner active" role="region" aria-label="Cookie Settings">
          <div className="cookie-banner-content">
            <span className="cookie-icon" aria-hidden="true">🍪</span>
            <div className="cookie-text">
              <h4>EcoSphere AI Cookie Settings</h4>
              <p>We use cookies to save your login session, onboarding quiz responses, and earned points statistics so you can persist your climate progress upon page reload.</p>
            </div>
            <div className="cookie-actions">
              <button 
                className="btn btn-secondary cookie-btn" 
                onClick={() => saveCookieSettings('decline')}
                type="button"
              >
                Necessary Only
              </button>
              <button 
                className="btn btn-primary cookie-btn" 
                onClick={() => saveCookieSettings('accept')}
                type="button"
              >
                Accept Cookies
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <div className="toast-container" id="toast-notification-container" aria-live="assertive" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type} active`}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '⚠️' : 'ℹ'} {t.message}
          </div>
        ))}
      </div>

    </div>
  );
}
