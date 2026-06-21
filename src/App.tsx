import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { auth, onAuthStateChanged, signOut } from './firebase';

import LandingPage from './components/LandingPage';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import ChallengesView from './components/ChallengesView';
import MarketplaceView from './components/MarketplaceView';
import CommunityView from './components/CommunityView';
import AICoachView from './components/AICoachView';
import AnalyticsView from './components/AnalyticsView';
import ProfileView from './components/ProfileView';

import { 
  Leaf, Coins, Flame, Trophy, Cpu, Users, BarChart3, 
  Compass, RefreshCw, X, Sparkles, User 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const setAuthenticated = useStore((state) => state.setAuthenticated);
  const toastObj = useStore((state) => state.toast);
  const clearToast = useStore((state) => state.clearToast);
  const profile = useStore((state) => state.profile);
  const fetchData = useStore((state) => state.fetchData);
  const isLoading = useStore((state) => state.isLoading);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'challenges' | 'marketplace' | 'community' | 'coach' | 'analytics' | 'profile'>('dashboard');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Sync Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticated(true, user.email);
        fetchData(); // Hydrate store from PostgreSQL/LocalStorage
      } else {
        setAuthenticated(false, null);
      }
    });

    return () => unsubscribe();
  }, [setAuthenticated, fetchData]);

  // Listen for completed challenges to show confetti splash
  useEffect(() => {
    const handleQuestComplete = () => {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('questComplete', handleQuestComplete);
    return () => window.removeEventListener('questComplete', handleQuestComplete);
  }, []);

  // Clear toast notifications automatically
  useEffect(() => {
    if (toastObj) {
      const timer = setTimeout(() => clearToast(), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastObj, clearToast]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAuthenticated(false, null);
    } catch (err) {
      setAuthenticated(false, null);
    }
  };

  if (!isAuthenticated) {
    if (showAuth) {
      return <LoginView onBack={() => setShowAuth(false)} />;
    }
    return <LandingPage onEnter={() => setShowAuth(true)} />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'challenges':
        return <ChallengesView />;
      case 'marketplace':
        return <MarketplaceView />;
      case 'community':
        return <CommunityView />;
      case 'coach':
        return <AICoachView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView />;
    }
  };

  // Profile equipped theme ambient background mapping
  const getThemeClass = (theme: string) => {
    switch (theme) {
      case 'neon-cyan': return 'theme-neon-cyan';
      case 'cosmic-purple': return 'theme-cosmic-purple';
      case 'sunset-gold': return 'theme-sunset-gold';
      case 'aurora-borealis': return 'theme-aurora-borealis';
      case 'volcanic-ash': return 'theme-volcanic-ash';
      default: return 'theme-dark-green';
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Compass className="w-4 h-4" /> },
    { id: 'challenges', label: 'Quests', icon: <Trophy className="w-4 h-4" /> },
    { id: 'marketplace', label: 'Store', icon: <Coins className="w-4 h-4" /> },
    { id: 'community', label: 'Community', icon: <Users className="w-4 h-4" /> },
    { id: 'coach', label: 'AI Coach', icon: <Cpu className="w-4 h-4" /> },
    { id: 'analytics', label: 'Charts', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'profile', label: 'Ledger', icon: <User className="w-4 h-4" /> }
  ] as const;

  return (
    <div className={`min-h-screen relative overflow-x-hidden transition-all duration-500 pb-16 ${getThemeClass(profile?.equipped_theme)}`}>
      
      {/* Sparkles Confetti Overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[99] flex items-center justify-center bg-emerald-500/10 backdrop-blur-[2px]"
          >
            <div className="text-center p-8 bg-slate-950/90 border-2 border-emerald-500/40 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.3)] confetti-pop text-white max-w-sm">
              <span className="text-5xl block mb-2">🎉</span>
              <h3 className="font-heading font-black text-xl text-emerald-400">Quest Completed!</h3>
              <p className="text-xs text-slate-300 mt-1">Virtual Eco Coins & Experience Points added to your profile ledger.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Glass Header */}
      <header className="sticky top-4 left-4 right-4 z-40 mx-4 max-w-7xl md:mx-auto flex justify-between items-center px-6 py-3.5 glass-panel border border-white/5 rounded-2xl shadow-lg mt-4">
        <div className="flex items-center gap-2 select-none">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="font-heading font-black text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">EcoVerse</span>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-400">
          {navItems.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'bg-white/5 border border-white/10 text-white shadow-sm'
                  : 'hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Sync & Logout */}
        <div className="flex items-center gap-4">
          {isLoading && (
            <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Syncing...
            </span>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-extrabold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl cursor-pointer transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Workspace Layout (Full width, Desktop optimised) */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 mt-4 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Sticky Bottom Tab Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md border-t border-white/5 py-3 px-4 flex justify-around md:hidden">
        {navItems.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 text-[9px] font-bold cursor-pointer transition-all ${
              activeTab === tab.id
                ? 'text-emerald-400'
                : 'text-slate-500 hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </footer>

      {/* Toast Notification Container */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toastObj && (
          <div 
            className={`p-4 rounded-2xl text-xs font-bold shadow-2xl text-left flex items-center gap-2 border pointer-events-auto ${
              toastObj.type === 'success' 
                ? 'bg-emerald-950/80 border-emerald-500/20 text-emerald-400' 
                : toastObj.type === 'error' 
                ? 'bg-red-950/80 border-red-500/20 text-red-400' 
                : 'bg-slate-950/80 border-white/5 text-slate-300'
            }`}
          >
            <span>{toastObj.type === 'success' ? '✓' : toastObj.type === 'error' ? '⚠️' : 'ℹ'}</span>
            <span>{toastObj.message}</span>
            <button 
              onClick={clearToast}
              className="ml-auto text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
