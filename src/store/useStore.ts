import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE = 'http://localhost:5000/api';
const PHP_API_BASE = 'http://localhost:8000';

const syncProfileToFirestore = async (profile: any) => {
  try {
    if (profile && profile.email) {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      await setDoc(doc(db, 'profiles', profile.email), {
        ...profile,
        owned_frames: profile.owned_frames || ['none'],
        owned_themes: profile.owned_themes || ['dark-green'],
        owned_badges: profile.owned_badges || ['Seedling']
      });
    }
  } catch (err) {
    console.warn('Direct Firestore sync failed:', err);
  }
};

export interface Challenge {
  id: string;
  category: 'daily' | 'weekly' | 'monthly';
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  xp_reward: number;
  coin_reward: number;
}

export interface Achievement {
  id: string;
  category: string;
  name: string;
  description: string;
  completed: boolean;
  xp_reward: number;
  coin_reward: number;
  badge: string;
}

export interface SocialPost {
  id: string;
  author: string;
  avatar: string;
  avatar_bg: string;
  time: string;
  content: string;
  applauds: number;
  comments: { author: string; text: string }[];
  applauders?: string[];
}

export interface AnalyticsRecord {
  year: number;
  emissions_avoided: number;
  xp: number;
  challenge_completion: number;
}

export interface UserProfile {
  username: string;
  bio: string;
  level: string;
  xp: number;
  coins: number;
  streak: number;
  carbon_saved: number;
  equipped_frame: string;
  equipped_theme: string;
  equipped_badge: string;
  owned_frames: string[];
  owned_themes: string[];
  owned_badges: string[];
}

interface StoreState {
  // Authentication session
  isAuthenticated: boolean;
  userEmail: string | null;

  // Game States
  profile: UserProfile;
  challenges: Challenge[];
  achievements: Achievement[];
  socialPosts: SocialPost[];
  analyticsData: AnalyticsRecord[];
  chatHistory: { sender: 'bot' | 'user'; text: string }[];
  leaderboard: { username: string; xp: number; level: string }[];
  friends: {
    id: number;
    user_email: string;
    friend_email: string;
    status: 'pending' | 'accepted';
    friend_name: string;
    friend_level: string;
    friend_xp: number;
  }[];
  pendingRequests: {
    id: number;
    user_email: string;
    friend_email: string;
    status: 'pending';
    friend_name: string;
    friend_level: string;
    friend_xp: number;
  }[];
  activeChatMessages: {
    id: number;
    sender_email: string;
    receiver_email: string;
    message: string;
    media_url: string;
    media_type: string;
    created_at: string;
  }[];
  
  // Local Loading States
  isLoading: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;

  // Setters & Auth Methods
  setAuthenticated: (status: boolean, email?: string | null) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;

  // Async Database Sync Actions
  fetchData: () => Promise<void>;
  updateBio: (bio: string) => Promise<void>;
  completeChallenge: (challengeId: string) => Promise<void>;
  purchaseItem: (itemId: string, type: 'frame' | 'theme' | 'badge', cost: number) => Promise<void>;
  equipItem: (type: 'frame' | 'theme' | 'badge', value: string) => Promise<void>;
  addSocialPost: (content: string) => Promise<void>;
  applaudPost: (postId: string) => Promise<void>;
  addComment: (postId: string, commentText: string) => Promise<void>;
  triggerDailyLoginBonus: () => void;
  searchUsers: (query: string) => Promise<{ email: string; username: string; level: string; xp: number }[]>;
  fetchFriendsAndRequests: () => Promise<void>;
  sendFriendRequest: (friendEmail: string) => Promise<void>;
  approveFriendRequest: (friendEmail: string) => Promise<void>;
  fetchDirectMessages: (friendEmail: string) => Promise<void>;
  sendDirectMessage: (friendEmail: string, message: string, mediaFile?: File) => Promise<void>;
}

// Level helper
export const getLevelNumber = (xp: number): number => {
  if (xp >= 1000) return 5;
  if (xp >= 500) return 4;
  if (xp >= 250) return 3;
  if (xp >= 100) return 2;
  return 1;
};

export const getLevelName = (lvl: number): string => {
  const levels = ['Beginner', 'Explorer', 'Guardian', 'Champion', 'Protector', 'Legend'];
  return levels[Math.min(levels.length - 1, lvl - 1)];
};

const defaultChallenges: Challenge[] = [
  { id: 'daily_water', category: 'daily', title: 'Hydration Target', description: 'Drink at least 2L of water throughout the day.', progress: 0, target: 1, completed: false, xp_reward: 25, coin_reward: 10 },
  { id: 'daily_walk', category: 'daily', title: 'Active Transit Commute', description: 'Walk or cycle 3km today.', progress: 0, target: 1, completed: false, xp_reward: 25, coin_reward: 10 },
  { id: 'daily_focus', category: 'daily', title: 'Focus Calibration Session', description: 'Complete a 25-minute Pomodoro focus block.', progress: 0, target: 1, completed: false, xp_reward: 25, coin_reward: 10 },
  { id: 'weekly_screen', category: 'weekly', title: 'Digital Detox', description: 'Reduce non-essential screen time by 5 hours.', progress: 0, target: 1, completed: false, xp_reward: 100, coin_reward: 50 },
  { id: 'weekly_banking', category: 'weekly', title: 'Green Financed Shift', description: 'Audit banking deposits and switch to an ESG index fund.', progress: 0, target: 1, completed: false, xp_reward: 100, coin_reward: 50 },
  { id: 'monthly_decarbon', category: 'monthly', title: 'Carbon Offset Guardian', description: 'Sponsor verified coastal mangrove growth.', progress: 0, target: 1, completed: false, xp_reward: 250, coin_reward: 100 }
];

const defaultAchievements: Achievement[] = [
  { id: 'beginner', category: 'Beginner', name: 'Initiate Earthling', description: 'Complete your first daily challenge.', completed: false, xp_reward: 50, coin_reward: 25, badge: '🌱' },
  { id: 'streak_3', category: 'Streak Master', name: 'Tri-Flame Active', description: 'Maintain a consecutive 3-day habits streak.', completed: false, xp_reward: 50, coin_reward: 25, badge: '🔥' },
  { id: 'explorer_coins', category: 'Explorer', name: 'Capital Accumulator', description: 'Earn a total cumulative balance of 500 Eco Coins.', completed: false, xp_reward: 50, coin_reward: 25, badge: '🪙' },
  { id: 'champion_level', category: 'Champion', name: 'Level Elite', description: 'Reach Level 4 status.', completed: false, xp_reward: 50, coin_reward: 25, badge: '👑' },
  { id: 'hero_feed', category: 'Community Hero', name: 'Social Calibrator', description: 'Publish an achievement on the community feed.', completed: false, xp_reward: 50, coin_reward: 25, badge: '🗣️' }
];

const defaultPosts: SocialPost[] = [
  { id: 'post_1', author: 'EcoWarden_Sarah', avatar: 'S', avatar_bg: '#10b981', time: '2 hours ago', content: 'Swapped my conventional household bank to a clean green ESG bank! Starving fossil fuel funding feels awesome. (+100 coins!) 🏦🌱', applauds: 12, comments: [] },
  { id: 'post_2', author: 'ZeroWasteAlex', avatar: 'A', avatar_bg: '#8b5cf6', time: '5 hours ago', content: 'Composted my kitchen scrap bin today. Reducing landfill methane yields positive impact indices! 🪱♻️', applauds: 8, comments: [{ author: 'Ben', text: 'Great progress!' }] }
];

const defaultAnalytics: AnalyticsRecord[] = [
  { year: 2026, emissions_avoided: 12.4, xp: 120, challenge_completion: 2 },
  { year: 2027, emissions_avoided: 35.8, xp: 450, challenge_completion: 8 },
  { year: 2028, emissions_avoided: 68.2, xp: 980, challenge_completion: 19 },
  { year: 2029, emissions_avoided: 114.6, xp: 1850, challenge_completion: 34 }
];

const defaultProfile: UserProfile = {
  username: 'Warden_Jane',
  bio: 'Protecting the planet, one habit at a time.',
  level: 'Beginner',
  xp: 120,
  coins: 250,
  streak: 3,
  carbon_saved: 15.4,
  equipped_frame: 'none',
  equipped_theme: 'dark-green',
  equipped_badge: 'Seedling',
  owned_frames: ['none'],
  owned_themes: ['dark-green'],
  owned_badges: ['Seedling']
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userEmail: null,
      profile: defaultProfile,
      challenges: defaultChallenges,
      achievements: defaultAchievements,
      socialPosts: defaultPosts,
      analyticsData: defaultAnalytics,
      chatHistory: [
        { sender: 'bot', text: 'Welcome to EcoVerse, Warden. Ask me about your habits, emissions, or how to maximize Eco Coins!' }
      ],
      leaderboard: [],
      friends: [],
      pendingRequests: [],
      activeChatMessages: [],
      isLoading: false,
      toast: null,

      setAuthenticated: (status, email = null) => {
        set({ isAuthenticated: status, userEmail: email });
        if (status) {
          get().triggerDailyLoginBonus();
        }
      },

      showToast: (message, type = 'info') => {
        set({ toast: { message, type } });
      },

      clearToast: () => set({ toast: null }),

      // Trigger daily login bonus
      triggerDailyLoginBonus: () => {
        const lastLogin = localStorage.getItem('last_login_date');
        const todayStr = new Date().toDateString();
        if (lastLogin !== todayStr) {
          localStorage.setItem('last_login_date', todayStr);
          
          set((state) => {
            const nextXp = state.profile.xp + 10;
            const nextCoins = state.profile.coins + 5;
            const nextLevelNum = getLevelNumber(nextXp);
            const nextLevelName = getLevelName(nextLevelNum);
            const nextStreak = state.profile.streak + 1;

            const updatedProfile = {
              ...state.profile,
              xp: nextXp,
              coins: nextCoins,
              level: nextLevelName,
              streak: nextStreak
            };

            // Check achievements triggers for streak
            let updatedAchievements = [...state.achievements];
            if (nextStreak >= 3) {
              updatedAchievements = updatedAchievements.map(ach => {
                if (ach.id === 'streak_3' && !ach.completed) {
                  return { ...ach, completed: true };
                }
                return ach;
              });
            }

            return {
              profile: updatedProfile,
              achievements: updatedAchievements
            };
          });

          get().showToast('Daily Login Bonus: +10 XP, +5 Eco Coins!', 'success');
        }
      },

      // Fetch all from DB (with LocalStorage fallbacks on throw)
      fetchData: async () => {
        set({ isLoading: true });
        
        // 1. Fetch core telemetry from Node Express / PostgreSQL
        let profileRes = null;
        let challengesRes = null;
        let analyticsRes = null;
        try {
          const [prof, chal, anal] = await Promise.all([
            fetch(`${API_BASE}/profile?email=${encodeURIComponent(get().userEmail || 'jane@ecoverse.com')}&username=${encodeURIComponent(get().profile.username || '')}`).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
            fetch(`${API_BASE}/challenges`).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
            fetch(`${API_BASE}/analytics`).then(r => { if (!r.ok) throw new Error(); return r.json(); })
          ]);
          profileRes = prof;
          challengesRes = chal;
          analyticsRes = anal;
        } catch (err) {
          console.warn('Node backend unreachable. Syncing with client-side Firestore...');
          try {
            const { doc, getDoc, collection, getDocs } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            const email = get().userEmail || 'jane@ecoverse.com';
            
            // Fetch profile
            const profSnap = await getDoc(doc(db, 'profiles', email));
            if (profSnap.exists()) {
              profileRes = profSnap.data();
            }

            // Fetch challenges
            const chalSnap = await getDocs(collection(db, 'challenges'));
            if (!chalSnap.empty) {
              challengesRes = chalSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            }

            // Fetch analytics
            const analSnap = await getDocs(collection(db, 'analytics'));
            if (!analSnap.empty) {
              analyticsRes = analSnap.docs.map(d => d.data());
            }
          } catch (fireErr) {
            console.error('Firestore client-side fetch failed:', fireErr);
          }
        }

        // 2. Fetch community feed from Node Express (with PHP/Local fallbacks)
        let feedRes = [];
        try {
          const r = await fetch(`${API_BASE}/feed`);
          if (r.ok) feedRes = await r.json();
          else throw new Error();
        } catch (expressErr) {
          console.warn('Express feed server unreachable, falling back to client-side Firestore...');
          try {
            const { collection, getDocs } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            const feedSnap = await getDocs(collection(db, 'feed'));
            if (!feedSnap.empty) {
              feedRes = feedSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            } else {
              throw new Error();
            }
          } catch (fireErr) {
            try {
              const r = await fetch(`${PHP_API_BASE}/feed.php`);
              if (r.ok) feedRes = await r.json();
              else throw new Error();
            } catch (phpErr) {
              feedRes = get().socialPosts || [];
            }
          }
        }

        // 3. Fetch leaderboard from Node Express (with PHP/local mock fallbacks)
        let leaderboardRes = [];
        try {
          const r = await fetch(`${API_BASE}/leaderboard`);
          if (r.ok) leaderboardRes = await r.json();
          else throw new Error();
        } catch (expressErr) {
          console.warn('Express leaderboard server unreachable, falling back to client-side Firestore...');
          try {
            const { collection, getDocs } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            const profilesSnap = await getDocs(collection(db, 'profiles'));
            if (!profilesSnap.empty) {
              const list = profilesSnap.docs.map(d => d.data());
              // Sort descending by xp
              list.sort((a: any, b: any) => (b.xp || 0) - (a.xp || 0));
              leaderboardRes = list.map((u: any) => ({
                username: u.username || 'Warden',
                xp: u.xp || 0,
                level: u.level || 'Beginner'
              }));
            } else {
              throw new Error();
            }
          } catch (fireErr) {
            try {
              const r = await fetch(`${PHP_API_BASE}/leaderboard.php`);
              if (r.ok) leaderboardRes = await r.json();
              else throw new Error();
            } catch (phpErr) {
              leaderboardRes = [
                { username: 'EcoWarrior_Sarah', xp: 980, level: 'Guardian' },
                { username: 'GreenTransitBen', xp: 840, level: 'Guardian' },
                { username: 'ZeroWasteAlex', xp: 760, level: 'Explorer' },
                { username: get().profile?.username || 'Warden_Jane', xp: get().profile?.xp || 120, level: get().profile?.level || 'Beginner' }
              ];
            }
          }
        }

        // 4. Update the Zustand store state
        set((state) => {
          const updatedProfile = profileRes ? {
            ...state.profile,
            ...profileRes,
            owned_frames: profileRes.owned_frames || ['none'],
            owned_themes: profileRes.owned_themes || ['dark-green'],
            owned_badges: profileRes.owned_badges || ['Seedling']
          } : state.profile;

          const updatedChallenges = challengesRes ? challengesRes.map((c: any) => ({
            id: c.id,
            category: c.category,
            title: c.title,
            description: c.description,
            progress: c.progress,
            target: c.target,
            completed: c.completed,
            xp_reward: c.xp_reward,
            coin_reward: c.coin_reward
          })) : state.challenges;

          const updatedAnalytics = analyticsRes || state.analyticsData;

          return {
            profile: updatedProfile,
            challenges: updatedChallenges,
            socialPosts: feedRes,
            leaderboard: leaderboardRes,
            analyticsData: updatedAnalytics,
            isLoading: false
          };
        });
      },

      // Update Biography
      updateBio: async (newBio) => {
        set((state) => ({
          profile: { ...state.profile, bio: newBio }
        }));

        try {
          await fetch(`${API_BASE}/profile/edit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bio: newBio, email: get().userEmail || 'jane@ecoverse.com' })
          });
          get().showToast('Biography updated!', 'success');
        } catch (err) {
          await syncProfileToFirestore(get().profile);
          get().showToast('Saved to Local Storage (database sync offline).', 'info');
        }
      },

      // Complete Quest Challenge
      completeChallenge: async (challengeId) => {
        let isNewlyComplete = false;
        
        set((state) => {
          const nextChallenges = state.challenges.map(c => {
            if (c.id === challengeId && !c.completed) {
              isNewlyComplete = true;
              return { ...c, completed: true, progress: c.target };
            }
            return c;
          });

          if (!isNewlyComplete) return {};

          const challengeObj = state.challenges.find(c => c.id === challengeId)!;
          const nextXp = state.profile.xp + challengeObj.xp_reward;
          const nextCoins = state.profile.coins + challengeObj.coin_reward;
          const nextLvlNum = getLevelNumber(nextXp);
          const nextLvlName = getLevelName(nextLvlNum);

          const updatedProfile = {
            ...state.profile,
            xp: nextXp,
            coins: nextCoins,
            level: nextLvlName,
            carbon_saved: parseFloat((state.profile.carbon_saved + 3.5).toFixed(1))
          };

          // Achievements checklist checking
          let updatedAchievements = [...state.achievements];
          
          // First challenge complete
          const hasZeroCompletes = state.challenges.filter(c => c.completed).length === 0;
          if (hasZeroCompletes) {
            updatedAchievements = updatedAchievements.map(ach => {
              if (ach.id === 'beginner' && !ach.completed) {
                return { ...ach, completed: true };
              }
              return ach;
            });
          }

          // Reach level 4 status
          if (nextLvlNum >= 4) {
            updatedAchievements = updatedAchievements.map(ach => {
              if (ach.id === 'champion_level' && !ach.completed) {
                return { ...ach, completed: true };
              }
              return ach;
            });
          }

          return {
            challenges: nextChallenges,
            profile: updatedProfile,
            achievements: updatedAchievements
          };
        });

        if (!isNewlyComplete) return;

        // Custom sound or animation cue
        window.dispatchEvent(new CustomEvent('questComplete', { detail: { id: challengeId } }));

        try {
          const res = await fetch(`${API_BASE}/challenges/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: challengeId, email: get().userEmail || 'jane@ecoverse.com' })
          });
          if (res.ok) {
            const data = await res.json();
            set({
              profile: {
                ...get().profile,
                ...data.profile
              }
            });
            get().showToast('Sync with PostgreSQL database complete!', 'success');
          }
        } catch (err) {
          await syncProfileToFirestore(get().profile);
          get().showToast('Quest logged to local workspace ledger.', 'success');
        }
      },

      // Purchase Shop Item
      purchaseItem: async (itemId, type, cost) => {
        if (get().profile.coins < cost) {
          get().showToast('Insufficient Eco Coins balance.', 'error');
          return;
        }

        set((state) => {
          const profileCopy = { ...state.profile };
          profileCopy.coins -= cost;

          if (type === 'frame') {
            profileCopy.owned_frames = [...profileCopy.owned_frames, itemId];
          } else if (type === 'theme') {
            profileCopy.owned_themes = [...profileCopy.owned_themes, itemId];
          } else if (type === 'badge') {
            profileCopy.owned_badges = [...profileCopy.owned_badges, itemId];
          }

          // Achievements checks
          let updatedAchievements = [...state.achievements];
          const newCoinAccum = 1000 - profileCopy.coins; // total spent + current
          if (newCoinAccum >= 500) {
            updatedAchievements = updatedAchievements.map(ach => {
              if (ach.id === 'explorer_coins' && !ach.completed) {
                return { ...ach, completed: true };
              }
              return ach;
            });
          }

          return {
            profile: profileCopy,
            achievements: updatedAchievements
          };
        });

        try {
          const res = await fetch(`${API_BASE}/profile/purchase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: itemId, type, cost, email: get().userEmail || 'jane@ecoverse.com' })
          });
          if (res.ok) {
            const data = await res.json();
            set({
              profile: {
                ...get().profile,
                ...data
              }
            });
            get().showToast('Store transaction saved to cloud.', 'success');
          }
        } catch (err) {
          await syncProfileToFirestore(get().profile);
          get().showToast('Unlocked cosmetic locally!', 'success');
        }
      },

      // Equip Shop Item
      equipItem: async (type, value) => {
        set((state) => {
          const profileCopy = { ...state.profile };
          if (type === 'frame') profileCopy.equipped_frame = value;
          else if (type === 'theme') profileCopy.equipped_theme = value;
          else if (type === 'badge') profileCopy.equipped_badge = value;
          return { profile: profileCopy };
        });

        try {
          const res = await fetch(`${API_BASE}/profile/equip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, value, email: get().userEmail || 'jane@ecoverse.com' })
          });
          if (res.ok) {
            const data = await res.json();
            set({ profile: data });
            get().showToast(`Equipped ${type} customisation.`, 'success');
          }
        } catch (err) {
          await syncProfileToFirestore(get().profile);
          get().showToast(`Equipped locally.`, 'success');
        }
      },

      // Add Feed Post
      addSocialPost: async (content) => {
        const username = get().profile.username;
        const avatar = username.charAt(0).toUpperCase();
        const newPost: SocialPost = {
          id: `post_${Date.now()}`,
          author: username,
          avatar,
          avatar_bg: '#10b981',
          time: 'Just now',
          content,
          applauds: 0,
          comments: []
        };

        set((state) => {
          // Add post + give 20 XP for community activity
          const nextXp = state.profile.xp + 20;
          const nextLvlNum = getLevelNumber(nextXp);
          const nextLvlName = getLevelName(nextLvlNum);

          const updatedProfile = {
            ...state.profile,
            xp: nextXp,
            level: nextLvlName
          };

          // Check community hero achievements
          let updatedAchievements = [...state.achievements];
          updatedAchievements = updatedAchievements.map(ach => {
            if (ach.id === 'hero_feed' && !ach.completed) {
              return { ...ach, completed: true };
            }
            return ach;
          });

          return {
            socialPosts: [newPost, ...state.socialPosts],
            profile: updatedProfile,
            achievements: updatedAchievements
          };
        });

        try {
          const res = await fetch(`${API_BASE}/feed/post`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, author: username })
          });
          if (res.ok) {
            const data = await res.json();
            // sync id from DB
            set((state) => ({
              socialPosts: state.socialPosts.map(p => p.time === 'Just now' ? data : p)
            }));
            get().showToast('Story broadcasted to community!', 'success');
            get().fetchData(); // reload feed + leaderboard with new weights
            return;
          }
        } catch (err) {
          console.warn('Express post offline, trying PHP');
        }

        try {
          const res = await fetch(`${PHP_API_BASE}/post.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, author: username })
          });
          if (res.ok) {
            const data = await res.json();
            // sync id from DB
            set((state) => ({
              socialPosts: state.socialPosts.map(p => p.time === 'Just now' ? data : p)
            }));
            get().showToast('Story broadcasted to community!', 'success');
            get().fetchData(); // reload feed + leaderboard with new weights
            return;
          }
        } catch (err) {
          console.warn('PHP post offline, trying direct Firestore');
        }

        // Firestore direct client fallback
        try {
          const { doc, setDoc } = await import('firebase/firestore');
          const { db } = await import('../firebase');
          await setDoc(doc(db, 'feed', newPost.id), {
            ...newPost,
            applauders: []
          });
          await syncProfileToFirestore(get().profile);
          get().showToast('Story broadcasted to cloud community!', 'success');
        } catch (fireErr) {
          get().showToast('Story published in Local Storage.', 'success');
        }
      },

      // Applaud Feed Post
      applaudPost: async (postId) => {
        const username = get().profile.username;
        set((state) => ({
          socialPosts: state.socialPosts.map(p => {
            if (p.id !== postId) return p;
            const applauders = p.applauders || [];
            const hasApplauded = applauders.includes(username);
            const nextApplauders = hasApplauded
              ? applauders.filter(u => u !== username)
              : [...applauders, username];
            return {
              ...p,
              applauders: nextApplauders,
              applauds: nextApplauders.length
            };
          })
        }));

        try {
          const res = await fetch(`${API_BASE}/feed/react`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: postId, username })
          });
          if (res.ok) return;
        } catch (err) {
          console.warn('Express feed react offline, trying PHP');
        }

        try {
          await fetch(`${PHP_API_BASE}/react.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: postId, username })
          });
        } catch (err) {
          // ignore error for visual reacts
        }
      },

      // Add Comment to Post
      addComment: async (postId, commentText) => {
        const username = get().profile.username;
        const newComment = { author: username, text: commentText };

        set((state) => ({
          socialPosts: state.socialPosts.map(p => 
            p.id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p
          )
        }));

        try {
          const res = await fetch(`${API_BASE}/feed/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: postId, author: username, text: commentText })
          });
          if (res.ok) {
            get().showToast('Comment published.', 'success');
            return;
          }
        } catch (err) {
          console.warn('Express comment offline, trying PHP');
        }

        try {
          await fetch(`${PHP_API_BASE}/comment.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: postId, author: username, text: commentText })
          });
          get().showToast('Comment published.', 'success');
        } catch (err) {
          // local fallback runs fine
        }
      },

      // Connection Portal search
      searchUsers: async (query) => {
        const myEmail = get().userEmail || 'jane@ecoverse.com';
        try {
          const res = await fetch(`${API_BASE}/friends?action=search&email=${encodeURIComponent(myEmail)}&q=${encodeURIComponent(query)}`);
          if (res.ok) {
            return await res.json();
          }
        } catch (err) {
          console.warn('Express server search offline, trying PHP');
        }
        try {
          const res = await fetch(`${PHP_API_BASE}/friends.php?action=search&email=${encodeURIComponent(myEmail)}&q=${encodeURIComponent(query)}`);
          if (res.ok) {
            return await res.json();
          }
        } catch (err) {
          console.warn('PHP server search offline');
        }
        // Fallback: search default mock list
        const mocks = [
          { email: 'sarah@ecoverse.com', username: 'EcoWarrior_Sarah', level: 'Guardian', xp: 980 },
          { email: 'ben@ecoverse.com', username: 'GreenTransitBen', level: 'Guardian', xp: 840 },
          { email: 'alex@ecoverse.com', username: 'ZeroWasteAlex', level: 'Explorer', xp: 760 },
          { email: 'dan@ecoverse.com', username: 'PlantPowerDan', level: 'Beginner', xp: 420 }
        ];
        return mocks.filter(u => u.email !== myEmail && (u.username.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())));
      },

      // Fetch friendships lists
      fetchFriendsAndRequests: async () => {
        const myEmail = get().userEmail || 'jane@ecoverse.com';
        try {
          const res = await fetch(`${API_BASE}/friends?email=${encodeURIComponent(myEmail)}`);
          if (res.ok) {
            const list = await res.json();
            const friends = list.filter((f: any) => f.status === 'accepted');
            const pending = list.filter((f: any) => f.status === 'pending' && f.friend_email === myEmail);
            set({ friends, pendingRequests: pending });
            return;
          }
        } catch (err) {
          console.warn('Express server offline, trying PHP');
        }
        try {
          const res = await fetch(`${PHP_API_BASE}/friends.php?email=${encodeURIComponent(myEmail)}`);
          if (res.ok) {
            const list = await res.json();
            const friends = list.filter((f: any) => f.status === 'accepted');
            const pending = list.filter((f: any) => f.status === 'pending' && f.friend_email === myEmail);
            set({ friends, pendingRequests: pending });
            return;
          }
        } catch (err) {
          console.warn('PHP server offline, using cached friends');
        }
        
        // Fallback: local persistence or default mock values
        set((state) => {
          const defaultFriendsList = [
            { id: 2, user_email: 'jane@ecoverse.com', friend_email: 'alex@ecoverse.com', status: 'accepted' as const, friend_name: 'ZeroWasteAlex', friend_level: 'Explorer', friend_xp: 760 }
          ];
          const defaultRequestsList = [
            { id: 1, user_email: 'sarah@ecoverse.com', friend_email: 'jane@ecoverse.com', status: 'pending' as const, friend_name: 'EcoWarrior_Sarah', friend_level: 'Guardian', friend_xp: 980 }
          ];
          return {
            friends: state.friends && state.friends.length > 0 ? state.friends : defaultFriendsList,
            pendingRequests: state.pendingRequests && state.pendingRequests.length > 0 ? state.pendingRequests : defaultRequestsList
          };
        });
      },

      // Send friend request
      sendFriendRequest: async (friendEmail) => {
        const myEmail = get().userEmail || 'jane@ecoverse.com';
        try {
          const res = await fetch(`${API_BASE}/friends`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'send', user_email: myEmail, friend_email: friendEmail })
          });
          if (res.ok) {
            get().showToast('Friend request sent!', 'success');
            get().fetchFriendsAndRequests();
            return;
          }
        } catch (err) {
          console.warn('Express server send request offline, trying PHP');
        }
        try {
          const res = await fetch(`${PHP_API_BASE}/friends.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'send', user_email: myEmail, friend_email: friendEmail })
          });
          if (res.ok) {
            get().showToast('Friend request sent!', 'success');
            get().fetchFriendsAndRequests();
            return;
          }
        } catch (err) {
          get().showToast('Sent friend request locally.', 'success');
          // Add locally
          set((state) => {
            const name = friendEmail.split('@')[0];
            const newReq = {
              id: Date.now(),
              user_email: myEmail,
              friend_email: friendEmail,
              status: 'pending' as const,
              friend_name: name,
              friend_level: 'Beginner',
              friend_xp: 0
            };
            return {
              pendingRequests: [...state.pendingRequests, newReq]
            };
          });
        }
      },

      // Approve friend request
      approveFriendRequest: async (friendEmail) => {
        const myEmail = get().userEmail || 'jane@ecoverse.com';
        try {
          const res = await fetch(`${API_BASE}/friends`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'approve', user_email: myEmail, friend_email: friendEmail })
          });
          if (res.ok) {
            get().showToast('Friend request approved!', 'success');
            get().fetchFriendsAndRequests();
            return;
          }
        } catch (err) {
          console.warn('Express server approve request offline, trying PHP');
        }
        try {
          const res = await fetch(`${PHP_API_BASE}/friends.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'approve', user_email: myEmail, friend_email: friendEmail })
          });
          if (res.ok) {
            get().showToast('Friend request approved!', 'success');
            get().fetchFriendsAndRequests();
            return;
          }
        } catch (err) {
          get().showToast('Approved request locally.', 'success');
          set((state) => {
            const request = state.pendingRequests.find(r => r.user_email === friendEmail || r.friend_email === friendEmail);
            if (!request) return {};
            const approved = {
              ...request,
              status: 'accepted' as const
            };
            return {
              friends: [...state.friends, approved],
              pendingRequests: state.pendingRequests.filter(r => r.user_email !== friendEmail && r.friend_email !== friendEmail)
            };
          });
        }
      },

      // Fetch DMs
      fetchDirectMessages: async (friendEmail) => {
        const myEmail = get().userEmail || 'jane@ecoverse.com';
        try {
          const res = await fetch(`${API_BASE}/messages?email=${encodeURIComponent(myEmail)}&friend=${encodeURIComponent(friendEmail)}`);
          if (res.ok) {
            const data = await res.json();
            set({ activeChatMessages: data });
            return;
          }
        } catch (err) {
          console.warn('Express DM server offline, trying PHP');
        }
        try {
          const res = await fetch(`${PHP_API_BASE}/messages.php?email=${encodeURIComponent(myEmail)}&friend=${encodeURIComponent(friendEmail)}`);
          if (res.ok) {
            const data = await res.json();
            set({ activeChatMessages: data });
            return;
          }
        } catch (err) {
          console.warn('PHP server offline, using offline DMs');
        }

        // Fallback DMs for testing
        set((state) => {
          const defaultMessages = [
            { id: 1, sender_email: 'alex@ecoverse.com', receiver_email: 'jane@ecoverse.com', message: 'Hi Warden Jane! I noticed your tree density grew today. Awesome job! 🌲', media_url: '', media_type: '', created_at: new Date(Date.now() - 3600000).toISOString() },
            { id: 2, sender_email: 'jane@ecoverse.com', receiver_email: 'alex@ecoverse.com', message: 'Thanks Alex! Commuted by bicycle today to help plant those tree nodes!', media_url: '', media_type: '', created_at: new Date(Date.now() - 1800000).toISOString() }
          ];
          return {
            activeChatMessages: state.activeChatMessages && state.activeChatMessages.length > 0 ? state.activeChatMessages : defaultMessages
          };
        });
      },

      // Send Direct Message
      sendDirectMessage: async (friendEmail, message, mediaFile) => {
        const myEmail = get().userEmail || 'jane@ecoverse.com';
        
        let mediaUrl = '';
        let mediaType = '';

        if (mediaFile) {
          try {
            // Convert file to base64
            const base64String = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(mediaFile);
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = (err) => reject(err);
            });

            // Try to upload to Express first
            let uploaded = false;
            try {
              const uploadRes = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileData: base64String, fileName: mediaFile.name })
              });
              if (uploadRes.ok) {
                const data = await uploadRes.json();
                mediaUrl = data.url;
                mediaType = data.type;
                uploaded = true;
              }
            } catch (err) {
              console.warn('Express upload failed, trying PHP fallback:', err);
            }

            // Fallback to PHP multipart upload if Node Express failed
            if (!uploaded) {
              const formData = new FormData();
              formData.append('file', mediaFile);
              const uploadRes = await fetch(`${PHP_API_BASE}/upload.php`, {
                method: 'POST',
                body: formData
              });
              if (uploadRes.ok) {
                const data = await uploadRes.json();
                mediaUrl = data.url;
                mediaType = data.type;
              } else {
                const errData = await uploadRes.json();
                throw new Error(errData.error || 'Server upload failure');
              }
            }
          } catch (uploadErr: any) {
            console.error('File upload failed:', uploadErr);
            get().showToast(`Media upload failed: ${uploadErr.message || uploadErr}. Sending text only.`, 'error');
          }
        }

        const mockNewDm = {
          id: Date.now(),
          sender_email: myEmail,
          receiver_email: friendEmail,
          message,
          media_url: mediaUrl,
          media_type: mediaType,
          created_at: new Date().toISOString()
        };

        set((state) => ({
          activeChatMessages: [...(state.activeChatMessages || []), mockNewDm]
        }));

        try {
          const res = await fetch(`${API_BASE}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sender_email: myEmail,
              receiver_email: friendEmail,
              message,
              media_url: mediaUrl,
              media_type: mediaType
            })
          });
          if (res.ok) {
            const data = await res.json();
            set((state) => ({
              activeChatMessages: state.activeChatMessages.map(m => m.id === mockNewDm.id ? data : m)
            }));
            return;
          }
        } catch (err) {
          console.warn('Express send DM offline, trying PHP');
        }

        try {
          const res = await fetch(`${PHP_API_BASE}/messages.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sender_email: myEmail,
              receiver_email: friendEmail,
              message,
              media_url: mediaUrl,
              media_type: mediaType
            })
          });
          if (res.ok) {
            const data = await res.json();
            set((state) => ({
              activeChatMessages: state.activeChatMessages.map(m => m.id === mockNewDm.id ? data : m)
            }));
          }
        } catch (err) {
          // Keep local mock message if server is offline
        }
      }
    }),
    {
      name: 'ecoverse-state-storage', // key in LocalStorage
      partialize: (state) => ({
        profile: state.profile,
        challenges: state.challenges,
        achievements: state.achievements,
        socialPosts: state.socialPosts,
        analyticsData: state.analyticsData,
        chatHistory: state.chatHistory,
        leaderboard: state.leaderboard,
        friends: state.friends,
        pendingRequests: state.pendingRequests
      })
    }
  )
);
