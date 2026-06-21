import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure uploads folder exists in public/uploads
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

// Load Service Account Credentials
const serviceAccountPath = new URL('./firebase-service-account.json', import.meta.url);
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

// In-Memory Database Fallback
let isDbConnected = false;
const memDb = {
  profiles: [],
  challenges: [
    { id: 'daily_walk_bike', category: 'daily', title: 'Commute by Bike / Walk', description: 'Skip a fossil-fuel vehicle ride for active travel today.', xp_reward: 50, coin_reward: 25, progress: 0, target: 1, completed: false, badge_reward: '' },
    { id: 'daily_plant_meal', category: 'daily', title: 'Eat a Plant-Based Meal', description: 'Choose a vegan or vegetarian recipe for lunch or dinner.', xp_reward: 30, coin_reward: 15, progress: 0, target: 1, completed: false, badge_reward: '' },
    { id: 'daily_cold_wash', category: 'daily', title: 'Cold Water Laundry Wash', description: 'Wash a full laundry load at 30°C or colder to save electricity.', xp_reward: 20, coin_reward: 10, progress: 0, target: 1, completed: false, badge_reward: '' },
    { id: 'weekly_banking', category: 'weekly', title: 'Transition to Green Banking', description: 'Switch your deposits to a bank that does not fund fossil fuels.', xp_reward: 150, coin_reward: 80, progress: 0, target: 1, completed: false, badge_reward: 'Green_Investor' },
    { id: 'weekly_digital', category: 'weekly', title: 'Cloud Storage Declutter', description: 'Delete 1GB of duplicate cloud files or old email attachments.', xp_reward: 80, coin_reward: 40, progress: 0, target: 1, completed: false, badge_reward: '' },
    { id: 'monthly_offsets', category: 'monthly', title: 'Sponsor Certified Forest Offsets', description: 'Offset historical emissions by contributing to verified trees growth.', xp_reward: 300, coin_reward: 150, progress: 0, target: 1, completed: false, badge_reward: 'Forest_Sponsor' },
    { id: 'seasonal_mangroves', category: 'seasonal', title: 'Plant 10 Mangrove Trees', description: 'Support certified coastal blue carbon reforestation programs.', xp_reward: 500, coin_reward: 250, progress: 0, target: 10, completed: false, badge_reward: 'Mangrove_Guardian' }
  ],
  feed: [],
  friends: [],
  direct_messages: [],
  analytics: []
};

// Seeding Helpers for Firestore (using Firebase Admin SDK APIs)
async function seedProfiles() {
  const snapshot = await db.collection('profiles').limit(1).get();
  if (snapshot.empty) {
    console.log('Seeding default profiles in Firestore...');
    await db.collection('profiles').doc('jane@ecoverse.com').set({
      email: 'jane@ecoverse.com',
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
    });

    const mockUsers = [
      { email: 'sarah@ecoverse.com', username: 'EcoWarrior_Sarah', level: 'Guardian', xp: 980, coins: 500, streak: 7, carbon_saved: 45.2, bio: 'Co-Warden at EcoVerse.' },
      { email: 'ben@ecoverse.com', username: 'GreenTransitBen', level: 'Guardian', xp: 840, coins: 420, streak: 5, carbon_saved: 32.1, bio: 'Co-Warden at EcoVerse.' },
      { email: 'alex@ecoverse.com', username: 'ZeroWasteAlex', level: 'Explorer', xp: 760, coins: 310, streak: 4, carbon_saved: 25.8, bio: 'Co-Warden at EcoVerse.' },
      { email: 'dan@ecoverse.com', username: 'PlantPowerDan', level: 'Beginner', xp: 420, coins: 150, streak: 2, carbon_saved: 10.5, bio: 'Co-Warden at EcoVerse.' }
    ];

    for (const u of mockUsers) {
      await db.collection('profiles').doc(u.email).set({
        ...u,
        equipped_frame: 'none',
        equipped_theme: 'dark-green',
        equipped_badge: 'Seedling',
        owned_frames: ['none'],
        owned_themes: ['dark-green'],
        owned_badges: ['Seedling']
      });
    }
  }
}

async function seedChallenges() {
  const snapshot = await db.collection('challenges').limit(1).get();
  if (snapshot.empty) {
    console.log('Seeding default ecological challenges in Firestore...');
    const defaultChallenges = [
      { id: 'daily_walk_bike', category: 'daily', title: 'Commute by Bike / Walk', description: 'Skip a fossil-fuel vehicle ride for active travel today.', xp_reward: 50, coin_reward: 25, progress: 0, target: 1, completed: false, badge_reward: '' },
      { id: 'daily_plant_meal', category: 'daily', title: 'Eat a Plant-Based Meal', description: 'Choose a vegan or vegetarian recipe for lunch or dinner.', xp_reward: 30, coin_reward: 15, progress: 0, target: 1, completed: false, badge_reward: '' },
      { id: 'daily_cold_wash', category: 'daily', title: 'Cold Water Laundry Wash', description: 'Wash a full laundry load at 30°C or colder to save electricity.', xp_reward: 20, coin_reward: 10, progress: 0, target: 1, completed: false, badge_reward: '' },
      { id: 'weekly_banking', category: 'weekly', title: 'Transition to Green Banking', description: 'Switch your deposits to a bank that does not fund fossil fuels.', xp_reward: 150, coin_reward: 80, progress: 0, target: 1, completed: false, badge_reward: 'Green_Investor' },
      { id: 'weekly_digital', category: 'weekly', title: 'Cloud Storage Declutter', description: 'Delete 1GB of duplicate cloud files or old email attachments.', xp_reward: 80, coin_reward: 40, progress: 0, target: 1, completed: false, badge_reward: '' },
      { id: 'monthly_offsets', category: 'monthly', title: 'Sponsor Certified Forest Offsets', description: 'Offset historical emissions by contributing to verified trees growth.', xp_reward: 300, coin_reward: 150, progress: 0, target: 1, completed: false, badge_reward: 'Forest_Sponsor' },
      { id: 'seasonal_mangroves', category: 'seasonal', title: 'Plant 10 Mangrove Trees', description: 'Support certified coastal blue carbon reforestation programs.', xp_reward: 500, coin_reward: 250, progress: 0, target: 10, completed: false, badge_reward: 'Mangrove_Guardian' }
    ];

    for (const ch of defaultChallenges) {
      await db.collection('challenges').doc(ch.id).set(ch);
    }
  }
}

async function seedFeed() {
  const snapshot = await db.collection('feed').limit(1).get();
  if (snapshot.empty) {
    console.log('Seeding default community feed in Firestore...');
    const defaultPosts = [
      { id: 1, author: 'EcoWarrior_Sarah', avatar: 'S', avatar_bg: '#10b981', time: 'Just now', content: 'Finished all my daily challenges! The morning active commute by bicycle was amazing 🚴‍♀️☀️', applauds: 12, comments: [], applauders: [] },
      { id: 2, author: 'GreenTransitBen', avatar: 'B', avatar_bg: '#06b6d4', time: '2 hours ago', content: 'Swapped my conventional household bank to a clean green ESG bank! Starving fossil fuel funding feels awesome. (+80 coins!) 🏦🌱', applauds: 7, comments: [], applauders: [] },
      { id: 3, author: 'ZeroWasteAlex', avatar: 'A', avatar_bg: '#8b5cf6', time: '5 hours ago', content: 'Composted my kitchen scrap bin today. Reducing landfill methane yields positive impact indices! 🪱♻️', applauds: 15, comments: [{ author: 'Sarah', text: 'Amazing work, Alex!' }], applauders: [] }
    ];

    for (const post of defaultPosts) {
      await db.collection('feed').doc(`post_${post.id}`).set(post);
    }
  }
}

async function seedFriends() {
  const snapshot = await db.collection('friends').limit(1).get();
  if (snapshot.empty) {
    console.log('Seeding default friendships in Firestore...');
    const defaultFriends = [
      { id: 1, user_email: 'sarah@ecoverse.com', friend_email: 'jane@ecoverse.com', status: 'pending' },
      { id: 2, user_email: 'jane@ecoverse.com', friend_email: 'alex@ecoverse.com', status: 'accepted' }
    ];

    for (const fr of defaultFriends) {
      await db.collection('friends').doc(`friend_${fr.id}`).set(fr);
    }
  }
}

async function seedDirectMessages() {
  const snapshot = await db.collection('direct_messages').limit(1).get();
  if (snapshot.empty) {
    console.log('Seeding default direct messages in Firestore...');
    const defaultDMs = [
      { id: 1, sender_email: 'alex@ecoverse.com', receiver_email: 'jane@ecoverse.com', message: 'Hi Warden Jane! I noticed your tree density grew today. Awesome job! 🌲', media_url: '', media_type: '', created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 2, sender_email: 'jane@ecoverse.com', receiver_email: 'alex@ecoverse.com', message: 'Thanks Alex! Commuted by bicycle today to help plant those tree nodes!', media_url: '', media_type: '', created_at: new Date(Date.now() - 1800000).toISOString() }
    ];

    for (const dm of defaultDMs) {
      await db.collection('direct_messages').doc(`dm_${dm.id}`).set(dm);
    }
  }
}

async function seedAnalytics() {
  const snapshot = await db.collection('analytics').limit(1).get();
  if (snapshot.empty) {
    console.log('Seeding default progress analytics in Firestore...');
    const defaultAnalytics = [
      { id: 1, year: 2026, emissions_avoided: 8.4, xp: 120, challenge_completion: 2 },
      { id: 2, year: 2027, emissions_avoided: 24.6, xp: 480, challenge_completion: 7 },
      { id: 3, year: 2028, emissions_avoided: 52.8, xp: 1120, challenge_completion: 18 },
      { id: 4, year: 2029, emissions_avoided: 94.2, xp: 1980, challenge_completion: 31 },
      { id: 5, year: 2030, emissions_avoided: 145.6, xp: 3200, challenge_completion: 52 }
    ];

    for (const item of defaultAnalytics) {
      await db.collection('analytics').doc(`year_${item.year}`).set(item);
    }
  }
}

// Database Initialization Routine
async function initDb() {
  try {
    // Ping/test connection using Admin SDK APIs
    await db.collection('system').doc('ping').get();
    isDbConnected = true;
    console.log('Firebase Firestore database connected securely via Admin SDK. Checking collections...');

    // Only seed default ecological challenges
    await seedChallenges();

  } catch (err) {
    isDbConnected = false;
    console.warn('Firebase Firestore database unreachable or credentials invalid. Operating in Memory database mode.', err.message);
  }
}

// Execute DB initialization
initDb();

// --- LEVELING UTILITY ---
const LEVELS = ['Beginner', 'Explorer', 'Guardian', 'Champion', 'Protector', 'Legend'];
function calculateLevel(xp) {
  const lvlIdx = Math.min(LEVELS.length - 1, Math.floor(xp / 300));
  return LEVELS[lvlIdx];
}

// --- REST API ENDPOINTS ---

// Profile Routes
app.get('/api/profile', async (req, res) => {
  const { email, username } = req.query;
  const targetEmail = email || 'jane@ecoverse.com';
  if (isDbConnected) {
    try {
      const docRef = db.collection('profiles').doc(targetEmail);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        return res.json(docSnap.data());
      } else {
        // Create profile for this email
        const targetUsername = username || targetEmail.split('@')[0];
        const newProfile = {
          email: targetEmail,
          username: targetUsername,
          bio: 'Co-Warden at EcoVerse.',
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
        await docRef.set(newProfile);
        return res.json(newProfile);
      }
    } catch (err) {
      console.error(err);
    }
  }
  // Fallback
  let profile = memDb.profiles.find(p => p.email === targetEmail);
  if (!profile) {
    const targetUsername = username || targetEmail.split('@')[0];
    profile = {
      id: memDb.profiles.length + 1,
      username: targetUsername,
      email: targetEmail,
      bio: 'Co-Warden at EcoVerse.',
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
    memDb.profiles.push(profile);
  }
  res.json(profile);
});

app.post('/api/profile/edit', async (req, res) => {
  const { bio, email } = req.body;
  const targetEmail = email || 'jane@ecoverse.com';
  if (isDbConnected) {
    try {
      const docRef = db.collection('profiles').doc(targetEmail);
      await docRef.update({ bio });
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        return res.json(docSnap.data());
      }
    } catch (err) {
      console.error(err);
    }
  }
  // Fallback
  const profile = memDb.profiles.find(p => p.email === targetEmail) || memDb.profiles[0];
  profile.bio = bio;
  res.json(profile);
});

app.post('/api/profile/equip', async (req, res) => {
  const { type, value, email } = req.body;
  const targetEmail = email || 'jane@ecoverse.com';
  if (isDbConnected) {
    try {
      const docRef = db.collection('profiles').doc(targetEmail);
      let updateFields = {};
      if (type === 'frame') updateFields = { equipped_frame: value };
      else if (type === 'theme') updateFields = { equipped_theme: value };
      else if (type === 'badge') updateFields = { equipped_badge: value };
      
      await docRef.update(updateFields);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        return res.json(docSnap.data());
      }
    } catch (err) {
      console.error(err);
    }
  }
  // Fallback
  const profile = memDb.profiles.find(p => p.email === targetEmail) || memDb.profiles[0];
  if (type === 'frame') profile.equipped_frame = value;
  else if (type === 'theme') profile.equipped_theme = value;
  else if (type === 'badge') profile.equipped_badge = value;
  res.json(profile);
});

app.post('/api/profile/purchase', async (req, res) => {
  const { id, type, cost, email } = req.body;
  const targetEmail = email || 'jane@ecoverse.com';
  if (isDbConnected) {
    try {
      const docRef = db.collection('profiles').doc(targetEmail);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      const profile = docSnap.data();

      if (profile.coins < cost) {
        return res.status(400).json({ error: 'Insufficient Eco Coins' });
      }

      let updatedOwned = [];
      let updateFields = {};

      if (type === 'frame') {
        const owned = profile.owned_frames || [];
        updatedOwned = [...owned, id];
        updateFields = { coins: profile.coins - cost, owned_frames: updatedOwned };
      } else if (type === 'theme') {
        const owned = profile.owned_themes || [];
        updatedOwned = [...owned, id];
        updateFields = { coins: profile.coins - cost, owned_themes: updatedOwned };
      } else if (type === 'badge') {
        const owned = profile.owned_badges || [];
        updatedOwned = [...owned, id];
        updateFields = { coins: profile.coins - cost, owned_badges: updatedOwned };
      }

      await docRef.update(updateFields);
      const updatedSnap = await docRef.get();
      return res.json(updatedSnap.data());
    } catch (err) {
      console.error(err);
    }
  }
  // Fallback
  const profile = memDb.profiles.find(p => p.email === targetEmail) || memDb.profiles[0];
  if (profile.coins < cost) {
    return res.status(400).json({ error: 'Insufficient Eco Coins' });
  }
  profile.coins -= cost;
  if (type === 'frame') {
    if (!profile.owned_frames.includes(id)) profile.owned_frames.push(id);
  } else if (type === 'theme') {
    if (!profile.owned_themes.includes(id)) profile.owned_themes.push(id);
  } else if (type === 'badge') {
    if (!profile.owned_badges.includes(id)) profile.owned_badges.push(id);
  }
  res.json(profile);
});

// Challenges Routes
app.get('/api/challenges', async (req, res) => {
  if (isDbConnected) {
    try {
      const snap = await db.collection('challenges').get();
      const list = [];
      snap.forEach(d => list.push(d.data()));
      list.sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.id.localeCompare(b.id);
      });
      return res.json(list);
    } catch (err) {
      console.error(err);
    }
  }
  res.json(memDb.challenges);
});

app.post('/api/challenges/complete', async (req, res) => {
  const { id, email } = req.body;
  const targetEmail = email || 'jane@ecoverse.com';
  if (isDbConnected) {
    try {
      const chDocRef = db.collection('challenges').doc(id);
      const chSnap = await chDocRef.get();
      if (!chSnap.exists) return res.status(404).json({ error: 'Challenge not found' });
      const challenge = chSnap.data();

      if (challenge.completed) {
        return res.status(400).json({ error: 'Challenge already completed' });
      }

      await chDocRef.update({ progress: challenge.target, completed: true });
      const updatedChSnap = await chDocRef.get();
      const updatedChallenge = updatedChSnap.data();

      const profDocRef = db.collection('profiles').doc(targetEmail);
      const profSnap = await profDocRef.get();
      if (!profSnap.exists) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      const profile = profSnap.data();

      const newXp = profile.xp + challenge.xp_reward;
      const newCoins = profile.coins + challenge.coin_reward;
      const newLevel = calculateLevel(newXp);
      const ownedBadges = profile.owned_badges || [];
      const hasBadgeReward = challenge.badge_reward && !ownedBadges.includes(challenge.badge_reward);
      const updatedBadges = hasBadgeReward ? [...ownedBadges, challenge.badge_reward] : ownedBadges;
      
      const carbonDelta = challenge.id.includes('walk_bike') ? 3.6 : challenge.id.includes('plant_meal') ? 1.8 : challenge.id.includes('cold_wash') ? 0.8 : challenge.id.includes('banking') ? 4.5 : challenge.id.includes('digital') ? 0.4 : challenge.id.includes('offsets') ? 15.0 : 45.0;
      const newCarbonSaved = parseFloat((parseFloat(profile.carbon_saved || 0) + carbonDelta).toFixed(1));

      await profDocRef.update({
        xp: newXp,
        coins: newCoins,
        level: newLevel,
        owned_badges: updatedBadges,
        carbon_saved: newCarbonSaved
      });
      const updatedProfSnap = await profDocRef.get();

      const analDocRef = db.collection('analytics').doc('year_2026');
      const analSnap = await analDocRef.get();
      if (analSnap.exists) {
        const analData = analSnap.data();
        await analDocRef.update({
          emissions_avoided: parseFloat((parseFloat(analData.emissions_avoided || 0) + carbonDelta).toFixed(1)),
          challenge_completion: (analData.challenge_completion || 0) + 1,
          xp: (analData.xp || 0) + challenge.xp_reward
        });
      }

      return res.json({
        challenge: updatedChallenge,
        profile: updatedProfSnap.data()
      });
    } catch (err) {
      console.error(err);
    }
  }
  // Fallback
  const challenge = memDb.challenges.find(c => c.id === id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
  if (challenge.completed) return res.status(400).json({ error: 'Challenge already completed' });

  challenge.progress = challenge.target;
  challenge.completed = true;

  const profile = memDb.profiles.find(p => p.email === targetEmail) || memDb.profiles[0];
  profile.xp += challenge.xp_reward;
  profile.coins += challenge.coin_reward;
  profile.level = calculateLevel(profile.xp);
  if (challenge.badge_reward && !profile.owned_badges.includes(challenge.badge_reward)) {
    profile.owned_badges.push(challenge.badge_reward);
  }
  const carbonDelta = challenge.id.includes('walk_bike') ? 3.6 : challenge.id.includes('plant_meal') ? 1.8 : challenge.id.includes('cold_wash') ? 0.8 : challenge.id.includes('banking') ? 4.5 : challenge.id.includes('digital') ? 0.4 : challenge.id.includes('offsets') ? 15.0 : 45.0;
  profile.carbon_saved = parseFloat((parseFloat(profile.carbon_saved) + carbonDelta).toFixed(1));

  const anal2026 = memDb.analytics.find(a => a.year === 2026);
  if (anal2026) {
    anal2026.emissions_avoided += carbonDelta;
    anal2026.challenge_completion += 1;
    anal2026.xp += challenge.xp_reward;
  }
  res.json({ challenge, profile });
});

// Community Feed Routes
app.get('/api/feed', async (req, res) => {
  if (isDbConnected) {
    try {
      const snap = await db.collection('feed').get();
      const list = [];
      snap.forEach(d => list.push(d.data()));
      list.sort((a, b) => b.id - a.id);
      return res.json(list);
    } catch (err) {
      console.error(err);
    }
  }
  res.json([...memDb.feed].sort((a, b) => b.id - a.id));
});

app.post('/api/feed/post', async (req, res) => {
  const { content, author } = req.body;
  if (isDbConnected) {
    try {
      const avatar = author.charAt(0).toUpperCase();
      const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'];
      const avatarBg = colors[Math.floor(Math.random() * colors.length)];
      
      const snap = await db.collection('feed').get();
      let maxId = 0;
      snap.forEach(d => {
        const id = d.data().id;
        if (id > maxId) maxId = id;
      });
      const newId = maxId + 1;

      const newPost = {
        id: newId,
        author,
        avatar,
        avatar_bg: avatarBg,
        time: 'Just now',
        content,
        applauds: 0,
        comments: [],
        applauders: []
      };

      await db.collection('feed').doc(`post_${newId}`).set(newPost);

      const profSnap = await db.collection('profiles').get();
      for (const d of profSnap.docs) {
        const email = d.id;
        const prof = d.data();
        const newXp = (prof.xp || 0) + 15;
        await db.collection('profiles').doc(email).update({
          xp: newXp,
          level: calculateLevel(newXp)
        });
      }

      return res.json(newPost);
    } catch (err) {
      console.error(err);
    }
  }
  const avatar = author.charAt(0).toUpperCase();
  const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'];
  const avatarBg = colors[Math.floor(Math.random() * colors.length)];
  const newPost = {
    id: memDb.feed.length > 0 ? Math.max(...memDb.feed.map(p => p.id)) + 1 : 1,
    author,
    avatar,
    avatar_bg: avatarBg,
    time: 'Just now',
    content,
    applauds: 0,
    comments: [],
    applauders: []
  };
  memDb.feed.push(newPost);
  memDb.profiles[0].xp += 15;
  res.json(newPost);
});

app.post('/api/feed/react', async (req, res) => {
  const { id, username } = req.body;
  const user = username || 'anonymous';
  const idInt = parseInt(id);
  if (isDbConnected) {
    try {
      const postRef = db.collection('feed').doc(`post_${idInt}`);
      const postSnap = await postRef.get();
      if (postSnap.exists) {
        const postData = postSnap.data();
        let applauders = postData.applauders || [];
        const index = applauders.indexOf(user);
        if (index > -1) {
          applauders.splice(index, 1);
        } else {
          applauders.push(user);
        }
        const count = applauders.length;
        await postRef.update({ applauders, applauds: count });
        
        const updatedSnap = await postRef.get();
        return res.json(updatedSnap.data());
      }
    } catch (err) {
      console.error(err);
    }
  }
  const post = memDb.feed.find(p => p.id === idInt);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (!Array.isArray(post.applauders)) post.applauders = [];
  const index = post.applauders.indexOf(user);
  if (index > -1) {
    post.applauders.splice(index, 1);
  } else {
    post.applauders.push(user);
  }
  post.applauds = post.applauders.length;
  res.json(post);
});

app.post('/api/feed/comment', async (req, res) => {
  const { id, author, text } = req.body;
  const idInt = parseInt(id);
  if (isDbConnected) {
    try {
      const postRef = db.collection('feed').doc(`post_${idInt}`);
      const postSnap = await postRef.get();
      if (postSnap.exists) {
        const postData = postSnap.data();
        const commentsList = postData.comments || [];
        const newComment = { author, text };
        const updatedComments = [...commentsList, newComment];

        await postRef.update({ comments: updatedComments });
        const updatedSnap = await postRef.get();
        return res.json(updatedSnap.data());
      }
    } catch (err) {
      console.error(err);
    }
  }
  const post = memDb.feed.find(p => p.id === idInt);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const newComment = { author, text };
  if (!Array.isArray(post.comments)) post.comments = [];
  post.comments.push(newComment);
  res.json(post);
});

// Analytics Route
app.get('/api/analytics', async (req, res) => {
  if (isDbConnected) {
    try {
      const snap = await db.collection('analytics').get();
      const list = [];
      snap.forEach(d => list.push(d.data()));
      list.sort((a, b) => a.year - b.year);
      return res.json(list);
    } catch (err) {
      console.error(err);
    }
  }
  res.json(memDb.analytics);
});

// AI Coach Tip Route
app.post('/api/ai/chat', async (req, res) => {
  const { message } = req.body;
  const msg = message.toLowerCase();
  
  let reply = '';
  if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
    reply = "Hello Warden! I am your EcoVerse AI Coach. Ask me about your habits, emissions tips, or how to maximize Eco Coins!";
  } else if (msg.includes('coin') || msg.includes('eco coin') || msg.includes('shop') || msg.includes('marketplace')) {
    reply = "You can earn Eco Coins by completing Daily/Weekly challenges. Spend your coins in the Market to buy animated avatar frames, glowing background themes, and customized profile badges!";
  } else if (msg.includes('xp') || msg.includes('level') || msg.includes('guardian')) {
    reply = "XP represents your progression. Every 300 XP levels you up. Levels include Explorer, Guardian, Protector, and Legend. Completed challenges and community posts earn you bonus XP!";
  } else if (msg.includes('habit') || msg.includes('reduce') || msg.includes('transport') || msg.includes('car')) {
    reply = "To reduce transport emissions, swap one daily fuel commute for public transit or active walking/cycling. This eliminates roughly 3.6 kg of carbon equivalents per trip!";
  } else {
    reply = "Great question! Sustainability is built on micro-actions like cold water laundry washing, digital email clearing, and plant-based nutrition swaps. Try checking off a challenge in your dashboard today!";
  }

  res.json({ reply });
});

// Friends & Connections Routes
app.get('/api/friends', async (req, res) => {
  const { email, action, q } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Missing email parameter' });
  }

  if (isDbConnected) {
    try {
      if (action === 'search') {
        const searchPattern = (q || '').toLowerCase();
        const snap = await db.collection('profiles').get();
        const list = [];
        snap.forEach(d => {
          const u = d.data();
          const usernameMatch = u.username && u.username.toLowerCase().includes(searchPattern);
          const emailMatch = u.email && u.email.toLowerCase().includes(searchPattern);
          if ((usernameMatch || emailMatch) && u.email !== email) {
            list.push({
              email: u.email,
              username: u.username,
              level: u.level,
              xp: u.xp
            });
          }
        });
        return res.json(list.slice(0, 10));
      }

      const snap = await db.collection('friends').get();
      const friendsList = [];
      for (const d of snap.docs) {
        const row = d.data();
        if (row.user_email === email || row.friend_email === email) {
          const friendEmail = (row.user_email === email) ? row.friend_email : row.user_email;
          
          const profRef = db.collection('profiles').doc(friendEmail);
          const profSnap = await profRef.get();
          let prof = profSnap.exists ? profSnap.data() : null;
          
          if (!prof) {
            const name = friendEmail.split('@')[0];
            prof = { username: name, level: 'Beginner', xp: 0 };
          }

          friendsList.push({
            id: row.id,
            user_email: row.user_email,
            friend_email: row.friend_email,
            status: row.status,
            friend_name: prof.username,
            friend_level: prof.level,
            friend_xp: prof.xp
          });
        }
      }
      return res.json(friendsList);
    } catch (err) {
      console.error(err);
    }
  }
  if (action === 'search') {
    const results = memDb.profiles.filter(p => p.email !== email && (p.username.toLowerCase().includes((q || '').toLowerCase()) || p.email.toLowerCase().includes((q || '').toLowerCase())));
    return res.json(results.map(r => ({ email: r.email, username: r.username, level: r.level, xp: r.xp })));
  }

  const friendsList = [];
  for (const row of memDb.friends) {
    if (row.user_email === email || row.friend_email === email) {
      const friendEmail = (row.user_email === email) ? row.friend_email : row.user_email;
      let prof = memDb.profiles.find(p => p.email === friendEmail);
      if (!prof) {
        const name = friendEmail.split('@')[0];
        prof = { username: name, level: 'Beginner', xp: 0 };
      }
      friendsList.push({
        id: row.id,
        user_email: row.user_email,
        friend_email: row.friend_email,
        status: row.status,
        friend_name: prof.username,
        friend_level: prof.level,
        friend_xp: prof.xp
      });
    }
  }
  res.json(friendsList);
});

app.post('/api/friends', async (req, res) => {
  const { action, user_email, friend_email } = req.body;
  if (!user_email || !friend_email) {
    return res.status(400).json({ error: 'Missing email parameters' });
  }

  if (user_email === friend_email) {
    return res.status(400).json({ error: 'Cannot add yourself as a friend' });
  }

  if (isDbConnected) {
    try {
      if (action === 'send') {
        const snap = await db.collection('friends').get();
        let exists = false;
        snap.forEach(d => {
          const f = d.data();
          if ((f.user_email === user_email && f.friend_email === friend_email) ||
              (f.user_email === friend_email && f.friend_email === user_email)) {
            exists = true;
          }
        });
        if (exists) {
          return res.json({ status: 'exists' });
        }

        let maxId = 0;
        snap.forEach(d => {
          if (d.data().id > maxId) maxId = d.data().id;
        });
        const newId = maxId + 1;

        const newFriend = {
          id: newId,
          user_email,
          friend_email,
          status: 'pending',
          created_at: new Date().toISOString()
        };
        await db.collection('friends').doc(`friend_${newId}`).set(newFriend);
        return res.json(newFriend);
      } else if (action === 'approve') {
        const snap = await db.collection('friends').get();
        let targetDocId = null;
        let friendData = null;
        snap.forEach(d => {
          const f = d.data();
          if ((f.user_email === friend_email && f.friend_email === user_email) ||
              (f.user_email === user_email && f.friend_email === friend_email)) {
            targetDocId = d.id;
            friendData = f;
          }
        });

        if (!targetDocId) {
          return res.status(404).json({ error: 'Friend request not found' });
        }

        await db.collection('friends').doc(targetDocId).update({ status: 'accepted' });
        friendData.status = 'accepted';
        return res.json(friendData);
      }
    } catch (err) {
      console.error(err);
    }
  }
  if (action === 'send') {
    const exists = memDb.friends.some(f => (f.user_email === user_email && f.friend_email === friend_email) || (f.user_email === friend_email && f.friend_email === user_email));
    if (exists) return res.json({ status: 'exists' });

    const newFriend = {
      id: memDb.friends.length > 0 ? Math.max(...memDb.friends.map(f => f.id)) + 1 : 1,
      user_email,
      friend_email,
      status: 'pending'
    };
    memDb.friends.push(newFriend);
    return res.json(newFriend);
  } else if (action === 'approve') {
    const friend = memDb.friends.find(f => (f.user_email === friend_email && f.friend_email === user_email) || (f.user_email === user_email && f.friend_email === friend_email));
    if (!friend) return res.status(404).json({ error: 'Friend request not found' });
    friend.status = 'accepted';
    return res.json(friend);
  }
  res.status(400).json({ error: 'Invalid action' });
});

// Direct Messages Routes
app.get('/api/messages', async (req, res) => {
  const { email, friend } = req.query;
  if (!email || !friend) {
    return res.status(400).json({ error: 'Missing email parameters' });
  }

  if (isDbConnected) {
    try {
      const snap = await db.collection('direct_messages').get();
      const list = [];
      snap.forEach(d => {
        const m = d.data();
        if ((m.sender_email === email && m.receiver_email === friend) ||
            (m.sender_email === friend && m.receiver_email === email)) {
          list.push(m);
        }
      });
      list.sort((a, b) => a.id - b.id);
      return res.json(list);
    } catch (err) {
      console.error(err);
    }
  }
  const filtered = memDb.direct_messages.filter(m => (m.sender_email === email && m.receiver_email === friend) || (m.sender_email === friend && m.receiver_email === email));
  res.json(filtered.sort((a, b) => a.id - b.id));
});

app.post('/api/messages', async (req, res) => {
  const { sender_email, receiver_email, message, media_url, media_type } = req.body;
  if (!sender_email || !receiver_email) {
    return res.status(400).json({ error: 'Missing sender or receiver email' });
  }

  if (isDbConnected) {
    try {
      const snap = await db.collection('direct_messages').get();
      let maxId = 0;
      snap.forEach(d => {
        if (d.data().id > maxId) maxId = d.data().id;
      });
      const newId = maxId + 1;

      const newDm = {
        id: newId,
        sender_email,
        receiver_email,
        message: message || '',
        media_url: media_url || '',
        media_type: media_type || '',
        created_at: new Date().toISOString()
      };

      await db.collection('direct_messages').doc(`dm_${newId}`).set(newDm);
      return res.json(newDm);
    } catch (err) {
      console.error(err);
    }
  }
  const newDm = {
    id: memDb.direct_messages.length > 0 ? Math.max(...memDb.direct_messages.map(m => m.id)) + 1 : 1,
    sender_email,
    receiver_email,
    message: message || '',
    media_url: media_url || '',
    media_type: media_type || '',
    created_at: new Date().toISOString()
  };
  memDb.direct_messages.push(newDm);
  res.json(newDm);
});

// Base64 File Upload Route
app.post('/api/upload', async (req, res) => {
  const { fileData, fileName } = req.body;
  if (!fileData || !fileName) {
    return res.status(400).json({ error: 'Missing file data or file name' });
  }

  try {
    const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 file data format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const ext = path.extname(fileName).toLowerCase().replace('.', '');
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm', 'ogg'];
    if (!allowedExts.includes(ext)) {
      return res.status(400).json({ error: 'File extension not allowed' });
    }

    const newName = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const targetPath = path.join(uploadsDir, newName);

    await fs.promises.writeFile(targetPath, buffer);

    const publicUrl = `http://localhost:5000/uploads/${newName}`;
    res.json({
      url: publicUrl,
      name: fileName,
      type: mimeType.startsWith('video') ? 'video' : 'image'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save file: ' + err.message });
  }
});

// Leaderboard Route
app.get('/api/leaderboard', async (req, res) => {
  if (isDbConnected) {
    try {
      const snap = await db.collection('profiles').get();
      let list = [];
      snap.forEach(d => {
        const u = d.data();
        list.push({
          username: u.username,
          xp: u.xp,
          level: u.level,
          email: u.email
        });
      });

      if (list.length < 4) {
        const seededNames = list.map(r => r.username);
        const mocks = [
          { username: 'EcoWarrior_Sarah', xp: 980, level: 'Guardian', email: 'sarah@ecoverse.com' },
          { username: 'GreenTransitBen', xp: 840, level: 'Guardian', email: 'ben@ecoverse.com' },
          { username: 'ZeroWasteAlex', xp: 760, level: 'Explorer', email: 'alex@ecoverse.com' }
        ];
        for (const m of mocks) {
          if (!seededNames.includes(m.username)) {
            await db.collection('profiles').doc(m.email).set({
              ...m,
              bio: 'Co-Warden at EcoVerse.',
              equipped_frame: 'none',
              equipped_theme: 'dark-green',
              equipped_badge: 'Seedling',
              owned_frames: ['none'],
              owned_themes: ['dark-green'],
              owned_badges: ['Seedling'],
              coins: 300,
              streak: 4,
              carbon_saved: 30
            });
            list.push(m);
          }
        }
      }
      list.sort((a, b) => b.xp - a.xp);
      return res.json(list.slice(0, 10).map(s => ({ username: s.username, xp: s.xp, level: s.level })));
    } catch (err) {
      console.error(err);
    }
  }
  const sorted = [...memDb.profiles].sort((a, b) => b.xp - a.xp);
  res.json(sorted.map(s => ({ username: s.username, xp: s.xp, level: s.level })));
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`EcoVerse Express API running on http://localhost:${PORT}`);
});
