import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Coins, Check, Sparkles, Image, Shield, Frame, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PlantAvatar from './PlantAvatar';

export default function MarketplaceView() {
  const profile = useStore((state) => state.profile);
  const purchaseItem = useStore((state) => state.purchaseItem);
  const equipItem = useStore((state) => state.equipItem);
  const isLoading = useStore((state) => state.isLoading);

  const [activeTab, setActiveTab] = useState<'frames' | 'themes' | 'badges'>('frames');

  if (!profile) return null;

  const categories = [
    { id: 'frames', label: 'Avatar Frames', icon: <Frame className="w-4 h-4" /> },
    { id: 'themes', label: 'Ambient Themes', icon: <Image className="w-4 h-4" /> },
    { id: 'badges', label: 'Honorary Badges', icon: <Shield className="w-4 h-4" /> }
  ];

  const storeItems = {
    frames: [
      { id: 'ivy', name: 'Ivy Foliage Aura', desc: 'A subtle, growing green leaf frame around your profile.', cost: 100, styleClass: 'frame-ivy' },
      { id: 'neon', name: 'Emerald Neon Glow', desc: 'A vibrant, pulsing bright green laser frame.', cost: 200, styleClass: 'frame-neon' },
      { id: 'cosmic', name: 'Cosmic Nebula Ring', desc: 'An animated cycling deep purple aura frame.', cost: 350, styleClass: 'frame-cosmic' },
      { id: 'solar', name: 'Solar Flare Ring', desc: 'A glowing golden solar fire frame.', cost: 150, styleClass: 'frame-solar' },
      { id: 'cyber', name: 'Cyberpunk Holo Frame', desc: 'A futuristic cyber holo border.', cost: 280, styleClass: 'frame-cyber' }
    ],
    themes: [
      { id: 'neon-cyan', name: 'Neon Cyan Ambient', desc: 'Deep electric cyan ambient background theme.', cost: 150, styleClass: 'theme-neon-cyan' },
      { id: 'cosmic-purple', name: 'Cosmic Indigo Ambient', desc: 'Mystical starlight indigo and deep violet background.', cost: 250, styleClass: 'theme-cosmic-purple' },
      { id: 'sunset-gold', name: 'Sunset Amber Ambient', desc: 'Warm glowing solar gold and dark carbon gradient.', cost: 350, styleClass: 'theme-sunset-gold' },
      { id: 'aurora-borealis', name: 'Aurora Borealis Ambient', desc: 'Deep green and stellar starlight ambient theme.', cost: 180, styleClass: 'theme-aurora-borealis' },
      { id: 'volcanic-ash', name: 'Volcanic Ash Ambient', desc: 'Eruptive red ember and volcanic ash background.', cost: 290, styleClass: 'theme-volcanic-ash' }
    ],
    badges: [
      { id: 'Net-Zero Champion', name: 'Net-Zero Champion', desc: 'A golden globe badge demonstrating zero-emission targets.', cost: 150, icon: '🌍' },
      { id: 'Biosphere Guardian', name: 'Biosphere Guardian', desc: 'A leaf shield representing habitat preservation.', cost: 250, icon: '🛡️' },
      { id: 'Climate Savior', name: 'Climate Savior', desc: 'An elite cosmic flame representing heroic carbon offset funding.', cost: 500, icon: '🔥' },
      { id: 'Forest Patron', name: 'Forest Patron', desc: 'A green forest canopy badge awarded to patrons of reforestation.', cost: 180, icon: '🌳' },
      { id: 'Eco-Centric Sentinel', name: 'Eco-Centric Sentinel', desc: 'An elite shamrock leaf badge representing extreme carbon mindfulness.', cost: 320, icon: '☘️' }
    ]
  };

  const currentItems = storeItems[activeTab] as { id: string; name: string; desc: string; cost: number; styleClass?: string; icon?: string; }[];

  const isOwned = (itemId: string, category: string) => {
    if (category === 'frames') return (profile.owned_frames || []).includes(itemId);
    if (category === 'themes') return (profile.owned_themes || []).includes(itemId);
    if (category === 'badges') return (profile.owned_badges || []).includes(itemId);
    return false;
  };

  const isEquipped = (itemId: string, category: string) => {
    if (category === 'frames') return profile.equipped_frame === itemId;
    if (category === 'themes') return profile.equipped_theme === itemId;
    if (category === 'badges') return profile.equipped_badge === itemId;
    return false;
  };

  const handleAction = async (item: any) => {
    const type = activeTab.slice(0, -1) as 'frame' | 'theme' | 'badge';
    const owned = isOwned(item.id, activeTab);
    
    if (owned) {
      // Equip
      await equipItem(type, item.id);
    } else {
      // Purchase
      if (profile.coins < item.cost) return;
      await purchaseItem(item.id, type, item.cost);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-left">
          <h2 className="font-heading font-black text-2xl text-white tracking-tight">Eco Store</h2>
          <p className="text-slate-400 text-sm">Spend your virtual Eco Coins on cosmetic frames, themes, and badges. No real money is involved.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl shrink-0">
          <Coins className="w-5 h-5 text-emerald-400" />
          <span className="font-heading font-black text-emerald-400 text-lg">{profile.coins}</span>
          <span className="text-[10px] uppercase font-bold text-slate-500">Coins</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-4">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id as any)}
            className={`py-3 px-2 rounded-2xl text-xs font-bold tracking-wide transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-2 ${
              activeTab === cat.id 
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Grid of items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {currentItems.map((item) => {
            const owned = isOwned(item.id, activeTab);
            const equipped = isEquipped(item.id, activeTab);
            const canAfford = profile.coins >= item.cost;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                key={item.id}
                className={`glass-panel border p-6 rounded-3xl flex flex-col justify-between gap-5 relative overflow-hidden transition-all text-left ${
                  equipped 
                    ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                {/* Visual Preview Box */}
                <div className="h-28 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-center relative overflow-hidden">
                  {activeTab === 'frames' && (
                    <div className="relative">
                      {/* Avatar Mockup */}
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black text-xl ${item.styleClass}`}>
                        <PlantAvatar username={profile.username} className="w-full h-full" />
                      </div>
                    </div>
                  )}

                  {activeTab === 'themes' && (
                    <div className={`w-full h-full absolute inset-0 ${item.styleClass} flex items-center justify-center opacity-70`}>
                      <span className="text-[10px] font-bold text-slate-400/80">Ambient Preview</span>
                    </div>
                  )}

                  {activeTab === 'badges' && (
                    <div className="text-4xl filter drop-shadow-[0_0_15px_rgba(169,85,247,0.4)]">
                      {item.icon}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1 flex-grow">
                  <h3 className="font-heading font-extrabold text-white text-base leading-snug flex items-center gap-1.5">
                    {item.name}
                    {equipped && <Sparkles className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/10 animate-pulse" />}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>

                {/* Action button */}
                <button
                  disabled={isLoading || (!owned && !canAfford)}
                  onClick={() => handleAction(item)}
                  className={`w-full py-3 rounded-2xl font-heading font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    equipped 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                      : owned 
                      ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                      : canAfford
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md hover:scale-[1.02]'
                      : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  {equipped ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" /> Equipped
                    </>
                  ) : owned ? (
                    'Equip Customisation'
                  ) : (
                    <>
                      <Coins className="w-4 h-4" /> Unlock for {item.cost}
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {currentItems.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm glass-panel rounded-3xl border border-white/5 flex flex-col items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-slate-600" />
            <span>Store items loading...</span>
          </div>
        )}
      </div>
    </div>
  );
}
