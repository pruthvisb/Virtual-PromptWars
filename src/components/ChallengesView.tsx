import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Trophy, Coins, CheckCircle2, Circle, Star, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChallengesView() {
  const challenges = useStore((state) => state.challenges);
  const completeChallenge = useStore((state) => state.completeChallenge);
  const isLoading = useStore((state) => state.isLoading);

  const [activeTab, setActiveTab] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

  const categories = [
    { id: 'all', label: 'All Quests' },
    { id: 'daily', label: 'Daily Tasks' },
    { id: 'weekly', label: 'Weekly Milestones' },
    { id: 'monthly', label: 'Monthly Targets' }
  ];

  const filtered = activeTab === 'all' 
    ? challenges 
    : challenges.filter(c => c.category === activeTab);

  return (
    <div className="flex flex-col gap-6 animate-fadeInUp">
      {/* Header */}
      <div className="text-left">
        <h2 className="font-heading font-black text-2xl text-white tracking-tight">Eco Quests</h2>
        <p className="text-slate-400 text-sm">Perform physical and digital wellness tasks. Complete challenges to earn virtual coins and level up.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {categories.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold shadow-md' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Quest Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((challenge) => {
            const isCompleted = challenge.completed;
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={challenge.id}
                className={`glass-panel border p-5 rounded-3xl flex flex-col justify-between gap-4 transition-all relative overflow-hidden text-left ${
                  isCompleted 
                    ? 'border-emerald-500/20 bg-emerald-950/5' 
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                {/* Visual Glow for Completed */}
                {isCompleted && (
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
                )}

                <div className="flex gap-4 items-start">
                  {/* Circle check button */}
                  <button
                    disabled={isCompleted || isLoading}
                    onClick={() => completeChallenge(challenge.id)}
                    className={`mt-1.5 transition-transform active:scale-90 cursor-pointer ${
                      isCompleted ? 'text-emerald-400' : 'text-slate-500 hover:text-emerald-400'
                    }`}
                    aria-label={isCompleted ? `Challenge "${challenge.title}" completed` : `Complete challenge "${challenge.title}"`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 stroke-[2.5] fill-emerald-500/10" />
                    ) : (
                      <Circle className="w-6 h-6 stroke-[2]" />
                    )}
                  </button>

                  <div className="flex flex-col gap-1.5 flex-grow">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-extrabold text-white text-base leading-snug">
                        {challenge.title}
                      </span>
                      <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md font-extrabold border ${
                        challenge.category === 'daily' 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                          : challenge.category === 'weekly' 
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}>
                        {challenge.category}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{challenge.description}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3.5 mt-1">
                  <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
                    <span className="flex items-center gap-1">
                      Quest Progress: <strong className="text-white">{isCompleted ? challenge.target : challenge.progress} / {challenge.target}</strong>
                    </span>
                    {isCompleted && <span className="text-emerald-400 font-extrabold flex items-center gap-0.5"><Star className="w-3 h-3 fill-emerald-400" /> Completed</span>}
                  </div>
                  <div className="w-full h-2 bg-slate-950/60 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: isCompleted ? '100%' : `${(challenge.progress / challenge.target) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Rewards Footer */}
                <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-2xl border border-white/5 mt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Rewards Ledger</span>
                  <div className="flex gap-3 text-[10px] font-extrabold">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Trophy className="w-3.5 h-3.5" /> +{challenge.xp_reward} XP
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Coins className="w-3.5 h-3.5" /> +{challenge.coin_reward} Coins
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm glass-panel rounded-3xl border border-white/5 flex flex-col items-center gap-2">
            <CalendarDays className="w-8 h-8 text-slate-600" />
            <span>No quests active in this filter. Check other sections!</span>
          </div>
        )}
      </div>
    </div>
  );
}
