import React, { useState } from 'react';
import { Leaf, Flame, Trophy, Cpu, Users, ShieldCheck, ArrowRight, ChevronRight, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingProps {
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    { icon: <Leaf className="w-6 h-6 text-emerald-400" />, title: "Progress Tracking", desc: "Monitor your emissions reductions and watch your ecological footprint diminish over time." },
    { icon: <Trophy className="w-6 h-6 text-cyan-400" />, title: "Achievement Cards", desc: "Unlock beautiful, modern collectible badge cards representing your environmental milestones." },
    { icon: <Flame className="w-6 h-6 text-amber-400" />, title: "Streak Subsystem", desc: "Build healthy habits. Maintain daily check-in streaks and unlock multiplier coin bonuses." },
    { icon: <Cpu className="w-6 h-6 text-purple-400" />, title: "AI Climate Coach", desc: "Get tailored carbon audit recommendations, daily green tips, and positive motivation." },
    { icon: <Users className="w-6 h-6 text-indigo-400" />, title: "Community Feed", desc: "Publish achievements, applaud neighbors, leave comments, and team up for tree planting." },
    { icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />, title: "Cosmetic Upgrades", desc: "Earn virtual Eco Coins. Buy glowing avatar frames, profile background themes, and tags." }
  ];

  const stats = [
    { number: "18,400+", label: "Active Citizens" },
    { number: "142,500+", label: "Challenges Met" },
    { number: "95.4 Tons", label: "CO₂ Avoided" },
    { number: "45,000+", label: "Badges Claimed" }
  ];

  const testimonials = [
    { name: "EcoWarden_Sarah", avatar: "S", role: "Legendary Protector", comment: "EcoVerse completely gamified my carbon goals. Swapping to active biking felt like playing a leveling game! 🚴‍♀️💚" },
    { name: "GreenTransitBen", avatar: "B", role: "Active Guardian", comment: "The marketplace cosmetics are super satisfying. Unlocking the Cosmic Spark frame using virtual coins makes you feel like an elite warden." },
    { name: "ZeroWasteAlex", avatar: "A", role: "Explorer Initiate", comment: "The AI coach tips on green banking and cloud storage opened my eyes. Highly recommend this for community groups!" }
  ];

  const faqs = [
    { q: "Is there any real money involved?", a: "No. EcoVerse is a 100% gamified system. All Eco Coins, profile frames, and badges are virtual cosmetics. There are no payment gateways, no cash withdrawals, and no real-world financial value." },
    { q: "How do I earn virtual Eco Coins?", a: "By completing Daily, Weekly, and Monthly challenges, checking in consecutively to maintain streak fire, and leveling up your XP status." },
    { q: "What database backend does it use?", a: "EcoVerse connects to a local PostgreSQL database running on port 4000 to save profiles, streak histories, feed posts, and completed tasks." },
    { q: "What do levels represent?", a: "Levels range from Beginner to Explorer, Guardian, Protector, and Legend. Every 300 XP earned from checks moves you up the ranks!" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-emerald-950/20 to-transparent pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-md">
            <Leaf className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="font-heading font-black text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">EcoVerse</span>
        </div>
        
        <nav className="hidden md:flex gap-8 text-xs font-bold text-slate-400">
          <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
          <a href="#stats" className="hover:text-emerald-400 transition-colors">Impact</a>
          <a href="#testimonials" className="hover:text-emerald-400 transition-colors">Reviews</a>
          <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
        </nav>

        {/* Top-Right Log In / Register Option */}
        <button 
          onClick={onEnter}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-heading font-black text-xs tracking-wider transition-all hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
        >
          Sign In / Register
        </button>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center flex-grow">
        <div className="flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold w-fit uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" /> Active Habit Calibration
          </div>
          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none text-white">
            Build Better Habits. <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Grow Your World.</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed">
            EcoVerse is a premium gamified sustainability dashboard. Complete daily carbon-cutting actions, grow your virtual level, earn cosmetic rewards, and review progress telemetry inside a beautiful 3D planet sandbox.
          </p>
          <div className="flex flex-wrap gap-4 mt-2">
            <button 
              onClick={onEnter}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-heading font-black text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
            >
              Get Started <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
            <a 
              href="#features"
              className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-heading font-bold text-xs tracking-wider uppercase hover:bg-white/10 transition-all flex items-center gap-2"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="relative flex justify-center items-center">
          <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none"></div>
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border border-white/5 flex justify-center items-center bg-slate-900/60 shadow-[inset_0_4px_30px_rgba(255,255,255,0.05)]">
            <Leaf className="w-24 h-24 md:w-32 md:h-32 text-emerald-400 filter drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]" />
            <div className="absolute top-4 right-8 w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex justify-center items-center shadow-lg">
              <Trophy className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="absolute bottom-6 left-6 w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex justify-center items-center shadow-lg">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-24 px-6 md:px-12 bg-slate-950/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center gap-4">
          <span className="text-emerald-400 text-[10px] font-bold tracking-widest uppercase">Gamification Suite</span>
          <h2 className="font-heading font-black text-3xl md:text-4xl text-white tracking-tight">World-Class Feature Set</h2>
          <p className="text-slate-400 max-w-xl text-xs leading-relaxed mb-12">
            EcoVerse uses advanced motivational feedback loops inspired by Duolingo and Notion to reward daily positive habits.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {features.map((f, i) => (
              <div key={i} className="glass-panel border border-white/5 p-8 rounded-3xl text-left flex flex-col gap-4 hover:border-emerald-500/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  {f.icon}
                </div>
                <h3 className="font-heading font-extrabold text-base text-white">{f.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full text-center">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span className="font-heading font-black text-3xl sm:text-4xl md:text-5xl bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{s.number}</span>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section id="testimonials" className="py-24 px-6 md:px-12 bg-slate-950/40 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center gap-4">
          <span className="text-cyan-400 text-[10px] font-bold tracking-widest uppercase">Citizen Stories</span>
          <h2 className="font-heading font-black text-3xl md:text-4xl text-white tracking-tight">Active Wardens Approve</h2>
          <p className="text-slate-400 max-w-xl text-xs leading-relaxed mb-12">
            See how users are gamifying their daily checklists and reducing emission footprints.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-panel border border-white/5 p-6 rounded-3xl text-left flex flex-col justify-between gap-6">
                <p className="text-slate-300 text-xs italic leading-relaxed">"{t.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-heading font-black text-sm">
                    {t.avatar}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">{t.name}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 md:px-12 max-w-4xl mx-auto w-full">
        <div className="text-center flex flex-col items-center gap-4 mb-12">
          <span className="text-purple-400 text-[10px] font-bold tracking-widest uppercase">Questions & Answers</span>
          <h2 className="font-heading font-black text-3xl md:text-4xl text-white tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((f, idx) => (
            <div key={idx} className="glass-panel border border-white/5 rounded-2xl overflow-hidden text-left">
              <button 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-5 text-left font-heading font-bold text-sm md:text-base text-white flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span>{f.q}</span>
                <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-90' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-6 text-slate-400 text-xs md:text-sm leading-relaxed border-t border-white/5 pt-4">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-slate-950 py-12 px-6 md:px-12 text-slate-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <span className="font-heading font-black text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-heading">EcoVerse</span>
          </div>
          <div className="text-xs font-semibold text-center">
            &copy; 2026 EcoVerse Inc. PostgreSQL database sync. All virtual rewards are non-monetary.
          </div>
          <div className="flex gap-4 justify-center md:justify-end text-xs font-medium">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
            <button onClick={onEnter} className="hover:text-emerald-400 transition-colors cursor-pointer">Sign In</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
