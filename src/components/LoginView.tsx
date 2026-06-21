import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from '../firebase';
import { Leaf, LogIn, UserPlus, Sparkles, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginView({ onBack }: { onBack?: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuthenticated = useStore((state) => state.setAuthenticated);
  const showToast = useStore((state) => state.showToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Please enter email and password.', 'error');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Firebase Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        
        setAuthenticated(true, userCredential.user.email);
        showToast(`Welcome back, Warden!`, 'success');
      } else {
        // Firebase Register
        if (password.length < 6) {
          showToast('Password should be at least 6 characters.', 'error');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        
        if (username.trim()) {
          useStore.setState((state) => ({
            profile: { ...state.profile, username: username.trim() }
          }));
        }
        setAuthenticated(true, userCredential.user.email);
        showToast('Account initialized! Welcome to EcoVerse.', 'success');
      }
    } catch (err: any) {
      console.warn('Firebase auth error:', err.code || err.message);
      
      const authErrors = [
        'auth/invalid-credential',
        'auth/wrong-password',
        'auth/user-not-found',
        'auth/invalid-email',
        'auth/email-already-in-use',
        'auth/weak-password'
      ];
      
      const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (!isLocalHost || authErrors.includes(err.code)) {
        // Translate error code to clear user message
        let readableError = 'Authentication failed. Please check your credentials.';
        if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          readableError = 'Incorrect password. Please try again.';
        } else if (err.code === 'auth/user-not-found') {
          readableError = 'No account found with this email.';
        } else if (err.code === 'auth/invalid-email') {
          readableError = 'Invalid email address format.';
        } else if (err.code === 'auth/email-already-in-use') {
          readableError = 'An account with this email already exists.';
        } else if (err.code === 'auth/weak-password') {
          readableError = 'Password is too weak. Must be at least 6 characters.';
        } else if (err.message) {
          readableError = err.message;
        }
        showToast(readableError, 'error');
      } else {
        // Fallback ONLY for local offline development
        if (email.includes('@') && password.length >= 6) {
          setAuthenticated(true, email);
          if (!isLogin && username.trim()) {
            useStore.setState((state) => ({
              profile: { ...state.profile, username: username.trim() }
            }));
          }
          showToast(`Dev Session Initiated (Local Storage fallback).`, 'success');
        } else {
          const readableError = err.message || 'Authentication failed. Make sure password is at least 6 characters.';
          showToast(readableError, 'error');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showToast('Please enter your email address to reset password.', 'error');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      showToast('Password reset link sent to your email!', 'success');
    } catch (err: any) {
      console.error('Firebase Reset Password Error:', err.code, err.message, err);
      let readableError = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        readableError = 'No account found with this email.';
      } else if (err.code === 'auth/invalid-email') {
        readableError = 'Invalid email address format.';
      } else if (err.code === 'auth/too-many-requests') {
        readableError = 'Too many requests. Please try again later.';
      } else if (err.code === 'auth/network-request-failed') {
        readableError = 'Network error. Please check your internet connection.';
      } else if (err.message) {
        readableError = err.message;
      }
      showToast(readableError, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6 selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        {/* Branding Logo */}
        <div className="flex flex-col items-center gap-2 mb-8 relative">
          {onBack && (
            <button 
              onClick={onBack}
              className="absolute left-0 top-1.5 py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white text-[10px] font-bold cursor-pointer transition-colors"
            >
              ← Back
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Leaf className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="font-heading font-black text-3xl tracking-tight bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">EcoVerse</h1>
          <p className="text-slate-400 text-xs">Gamified Productivity & Sustainability Sandbox</p>
        </div>

        {/* Auth Glass Card */}
        <div className="glass-panel border border-white/5 rounded-3xl p-8 shadow-2xl relative">
          
          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-white/5 mb-8">
            <button
              onClick={() => { setIsLogin(true); setPassword(''); }}
              className={`py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isLogin 
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setPassword(''); }}
              className={`py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isLogin 
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-1"
                >
                  <label htmlFor="username" className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Citizen Username</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">@</span>
                    <input
                      id="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Warden_Jane"
                      className="w-full bg-slate-950/80 border border-white/5 focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-slate-950/80 border border-white/5 focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Secret Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-white/5 focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none transition-all placeholder-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-heading font-black text-xs tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-3 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              ) : isLogin ? (
                <>Enter Environment <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Generate Profile <Sparkles className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Quick instructions text */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-white/5 pt-4 mt-6">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400/80" /> Firebase Secured</span>
            {isLogin ? (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-cyan-400 hover:text-cyan-300 font-extrabold hover:underline cursor-pointer transition-all"
              >
                Forgot Password?
              </button>
            ) : (
              <span>Password length &ge; 6</span>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
}
