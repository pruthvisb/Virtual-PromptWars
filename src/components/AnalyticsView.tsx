import React from 'react';
import { useStore } from '../store/useStore';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar 
} from 'recharts';
import { Leaf, BarChart3, TrendingUp, AlertTriangle, Trophy, Sparkles } from 'lucide-react';

export default function AnalyticsView() {
  const analyticsData = useStore((state) => state.analyticsData);
  const profile = useStore((state) => state.profile);
  const challenges = useStore((state) => state.challenges || []);

  if (!analyticsData || analyticsData.length === 0 || !profile) {
    return (
      <div className="py-16 text-center text-slate-500 text-sm glass-panel rounded-3xl border border-white/5 flex flex-col items-center gap-2">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <span>No analytics telemetry data found. Complete quests to seed logs.</span>
      </div>
    );
  }

  // Bind 2026 data points dynamically to the user's live profile and challenge progress
  const completedCount = challenges.filter(c => c.completed).length;
  const totalCount = challenges.length;
  const treesEquivalent = parseFloat((profile.carbon_saved / 22).toFixed(1));

  const dynamicData = analyticsData.map(item => {
    if (item.year === 2026) {
      return {
        ...item,
        emissions_avoided: profile.carbon_saved || 0,
        xp: profile.xp || 0,
        challenge_completion: completedCount
      };
    }
    return item;
  });

  // Format Recharts tooltip
  const customTooltipStyle = {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    color: '#fff',
    fontSize: '11px',
    fontFamily: 'Outfit, sans-serif'
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeInUp">
      {/* Header */}
      <div className="text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-white tracking-tight">Eco Analytics</h2>
          <p className="text-slate-400 text-sm">Review your long-term environmental metrics and progress telemetry charts.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl flex items-center gap-2 shrink-0">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-emerald-300">Live Telemetry Active</span>
        </div>
      </div>

      {/* Environmental Impact Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carbon Ledger Card */}
        <div className="glass-panel border border-white/5 p-5 rounded-3xl flex items-center gap-4 text-left relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Leaf className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Carbon Offset Ledger</span>
            <span className="font-heading font-black text-xl text-white mt-0.5">{profile.carbon_saved} kg</span>
            <span className="text-[10px] text-emerald-400 font-bold mt-0.5">CO₂ emissions avoided</span>
          </div>
        </div>

        {/* Tree Equivalent Card */}
        <div className="glass-panel border border-white/5 p-5 rounded-3xl flex items-center gap-4 text-left relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Forestry Equivalency</span>
            <span className="font-heading font-black text-xl text-white mt-0.5">{treesEquivalent} Trees</span>
            <span className="text-[10px] text-cyan-400 font-bold mt-0.5">Annual absorption offset</span>
          </div>
        </div>

        {/* Quests Met Card */}
        <div className="glass-panel border border-white/5 p-5 rounded-3xl flex items-center gap-4 text-left relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Quests Met</span>
            <span className="font-heading font-black text-xl text-white mt-0.5">{completedCount} / {totalCount}</span>
            <span className="text-[10px] text-amber-400 font-bold mt-0.5">Active ledger challenges</span>
          </div>
        </div>
      </div>

      {/* Telemetry Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cumulative Carbon Saved Line Chart */}
        <div className="glass-panel border border-white/5 p-6 rounded-3xl flex flex-col gap-4 text-left">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" /> Carbon Offset Trajectory (kg)
            </h3>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Yearly Telemetry Logs</span>
          </div>

          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={dynamicData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Line 
                  type="monotone" 
                  dataKey="emissions_avoided" 
                  name="Avoided CO₂ (kg)"
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#020617' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* XP Progress Area Chart */}
        <div className="glass-panel border border-white/5 p-6 rounded-3xl flex flex-col gap-4 text-left">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" /> XP Level Progress (Cumulative)
            </h3>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Yearly Telemetry Logs</span>
          </div>

          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={dynamicData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="xpColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Area 
                  type="monotone" 
                  dataKey="xp" 
                  name="XP Level"
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#xpColor)" 
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Quest Completions Bar Chart */}
      <div className="glass-panel border border-white/5 p-6 rounded-3xl flex flex-col gap-4 text-left">
        <h3 className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" /> Completed Quests By Milestone Year
        </h3>

        <div className="h-64 mt-2">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={dynamicData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar 
                dataKey="challenge_completion" 
                name="Challenges Met"
                fill="#06b6d4" 
                radius={[8, 8, 0, 0]} 
                maxBarSize={45}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
