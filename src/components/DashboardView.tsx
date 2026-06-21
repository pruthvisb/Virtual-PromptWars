import React, { useState } from 'react';
import { useStore, getLevelNumber, getLevelName } from '../store/useStore';
import ThreeDPlanet from './ThreeDPlanet';
import PlantAvatar from './PlantAvatar';
import { Flame, Trophy, Coins, Leaf, Zap, Compass, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardView() {
  const profile = useStore((state) => state.profile);
  const challenges = useStore((state) => state.challenges);
  const socialPosts = useStore((state) => state.socialPosts);
  const completeChallenge = useStore((state) => state.completeChallenge);
  const isLoading = useStore((state) => state.isLoading);
  const fetchData = useStore((state) => state.fetchData);

  const [planetFocus, setPlanetFocus] = useState<'biome' | 'atmosphere' | 'core'>('core');

  if (!profile) return null;

  const currentLevelNum = getLevelNumber(profile.xp);
  const currentLevelName = getLevelName(currentLevelNum);
  
  // Level progression
  const levelXpThresholds = [0, 100, 250, 500, 1000];
  const currentLevelXpBase = levelXpThresholds[currentLevelNum - 1] || 0;
  const nextLevelXpThreshold = levelXpThresholds[currentLevelNum] || 2000;
  const xpNeededForNext = nextLevelXpThreshold - currentLevelXpBase;
  const xpEarnedInLevel = profile.xp - currentLevelXpBase;
  const xpPercent = Math.min(100, Math.max(0, (xpEarnedInLevel / xpNeededForNext) * 100));

  const achievements = useStore((state) => state.achievements) || [];
  const completedAchievementsCount = achievements.filter(a => a.completed).length;
  const activeDailyChallenges = (challenges || []).filter(c => c.category === 'daily').slice(0, 3);
  const recentActivities = (socialPosts || []).slice(0, 2);

  const getFrameClass = (frame: string) => {
    switch (frame) {
      case 'neon': return 'frame-neon';
      case 'ivy': return 'frame-ivy';
      case 'cosmic': return 'frame-cosmic';
      case 'solar': return 'frame-solar';
      case 'cyber': return 'frame-cyber';
      default: return 'frame-none';
    }
  };

  const getBadgeEmoji = (badge: string) => {
    switch (badge) {
      case 'Net-Zero Champion': return '🌍';
      case 'Biosphere Guardian': return '🛡️';
      case 'Climate Savior': return '🔥';
      case 'Forest Patron': return '🌳';
      case 'Eco-Centric Sentinel': return '☘️';
      default: return '🌱';
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeInUp">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div className="text-left">
          <h2 className="font-heading font-black text-2xl text-white tracking-tight">Environment Command</h2>
          <p className="text-slate-400 text-sm">Monitor your virtual assets, check habits, and rotate your interactive planet twin.</p>
        </div>
        <button 
          onClick={fetchData}
          disabled={isLoading}
          className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
          title="Sync Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Welcome Card & XP Progression */}
          <div className="glass-panel border border-white/5 p-6 rounded-3xl flex flex-col gap-5 text-left relative overflow-hidden">
            <div className="absolute right-0 top-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-heading font-black text-2xl relative overflow-hidden ${getFrameClass(profile.equipped_frame)}`}>
                  <PlantAvatar username={profile.username} className="w-full h-full" />
                </div>
                {profile.equipped_badge && (
                  <span className="absolute -bottom-1.5 -right-1.5 bg-purple-500 text-white border-2 border-slate-950 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold">
                    {getBadgeEmoji(profile.equipped_badge)}
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <h3 className="font-heading font-black text-lg text-white">Welcome back, {profile.username}</h3>
                <span className="text-xs text-slate-400">Environment Class: <strong className="text-emerald-400 font-extrabold">{currentLevelName} (Lvl {currentLevelNum})</strong></span>
              </div>
            </div>

            {/* XP progress bar */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">XP Progress ({profile.xp} / {nextLevelXpThreshold} XP)</span>
                <span className="text-emerald-400">{xpPercent.toFixed(0)}% Completed</span>
              </div>
              <div className="w-full h-3.5 bg-slate-950/60 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 rounded-full transition-all duration-500" 
                  style={{ width: `${xpPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-panel border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <Coins className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Eco Coins</span>
              <span className="font-heading font-black text-white text-base block mt-0.5">{profile.coins} 🪙</span>
            </div>

            <div className="glass-panel border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500 mb-1" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Streak Fire</span>
              <span className="font-heading font-black text-white text-base block mt-0.5">{profile.streak} Days</span>
            </div>

            <div className="glass-panel border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <Leaf className="w-5 h-5 text-cyan-400 mb-1" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Carbon Saved</span>
              <span className="font-heading font-black text-white text-base block mt-0.5">{profile.carbon_saved} kg</span>
            </div>
          </div>

          {/* Active Daily Challenges Checklist */}
          <div className="glass-panel border border-white/5 p-6 rounded-3xl text-left flex flex-col gap-4">
            <h3 className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" /> Active Quests Preview
            </h3>

            <div className="flex flex-col gap-3">
              {activeDailyChallenges.map(c => (
                <div key={c.id} className="flex justify-between items-center p-3.5 bg-slate-950/40 border border-white/5 rounded-2xl">
                  <div className="flex flex-col text-left gap-0.5">
                    <span className="text-xs font-bold text-white leading-snug">{c.title}</span>
                    <span className="text-[10px] text-slate-400">{c.description}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-emerald-400">+{c.coin_reward} Coins</span>
                    <button
                      disabled={c.completed || isLoading}
                      onClick={() => completeChallenge(c.id)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        c.completed
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:scale-105'
                      }`}
                    >
                      {c.completed ? 'Logged ✓' : 'Complete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed Snippet */}
          <div className="glass-panel border border-white/5 p-6 rounded-3xl text-left flex flex-col gap-4">
            <h3 className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" /> Recent Grid Activities
            </h3>

            <div className="flex flex-col gap-3">
              {recentActivities.map(post => (
                <div key={post.id} className="flex gap-3 p-3.5 bg-slate-950/40 border border-white/5 rounded-2xl text-xs">
                  <PlantAvatar username={post.author} className="w-8 h-8 shrink-0" />
                  <div className="flex flex-col text-left gap-1">
                    <div className="flex gap-2 items-center">
                      <strong className="text-white">{post.author}</strong>
                      <span className="text-[9px] text-slate-500">{post.time}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{post.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: 3D Earth widget & Console (1/3 width) */}
        <div className="flex flex-col gap-6">
          
          {/* 3D Planet Card */}
          <div className="glass-panel border border-white/5 p-6 rounded-3xl text-left flex flex-col gap-4 relative overflow-hidden h-96">
            <h3 className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-cyan-400" /> Interactive Biosphere
            </h3>
            
            {/* The 3D view container */}
            <div className="flex-grow rounded-2xl overflow-hidden border border-white/5 bg-slate-950 relative">
              <ThreeDPlanet xp={profile.xp} completedAchievementsCount={completedAchievementsCount} />
            </div>
          </div>

          {/* Interactive Biosphere Console details */}
          <div className="glass-panel border border-white/5 p-6 rounded-3xl text-left flex flex-col gap-3">
            <h4 className="font-heading font-extrabold text-xs text-white uppercase tracking-wider">Biosphere Telemetry Settings</h4>
            
            <div className="flex flex-col gap-2.5">
              <button 
                onClick={() => setPlanetFocus('core')}
                className={`w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold transition-all border cursor-pointer ${
                  planetFocus === 'core' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-white/5 border-transparent text-slate-400 hover:text-white'
                }`}
              >
                🌍 Core Soil: <span className="font-normal text-slate-300">Greens on higher XP ({profile.xp} XP)</span>
              </button>

              <button 
                onClick={() => setPlanetFocus('biome')}
                className={`w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold transition-all border cursor-pointer ${
                  planetFocus === 'biome' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-white/5 border-transparent text-slate-400 hover:text-white'
                }`}
              >
                🌲 Flora Biomes: <span className="font-normal text-slate-300">{completedAchievementsCount} badge clusters active</span>
              </button>

              <button 
                onClick={() => setPlanetFocus('atmosphere')}
                className={`w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold transition-all border cursor-pointer ${
                  planetFocus === 'atmosphere' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-white/5 border-transparent text-slate-400 hover:text-white'
                }`}
              >
                🌀 Orbiting Rings: <span className="font-normal text-slate-300">{completedAchievementsCount > 0 ? 'Active' : 'Unseeded'}</span>
              </button>
            </div>
            
            <p className="text-[10px] text-slate-500 leading-relaxed border-t border-white/5 pt-3 mt-1">
              Habits and Achievements drive vegetation levels on the planet. Keep completing challenges to seed more biomes!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
