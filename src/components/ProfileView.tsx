import React, { useState, useEffect, useRef } from 'react';
import { useStore, getLevelNumber, getLevelName } from '../store/useStore';
import { 
  Award, Edit3, Flame, Trophy, Coins, Check, FileText, 
  CheckCircle2, User, Clock, Leaf, Search, MessageSquare, 
  Send, Paperclip, Plus, X, Image, Video, Users 
} from 'lucide-react';
import { motion } from 'framer-motion';
import PlantAvatar from './PlantAvatar';

export default function ProfileView() {
  const profile = useStore((state) => state.profile);
  const achievements = useStore((state) => state.achievements);
  const updateBio = useStore((state) => state.updateBio);
  const equipItem = useStore((state) => state.equipItem);
  const isLoading = useStore((state) => state.isLoading);

  const friends = useStore((state) => state.friends || []);
  const pendingRequests = useStore((state) => state.pendingRequests || []);
  const activeChatMessages = useStore((state) => state.activeChatMessages || []);
  
  const searchUsers = useStore((state) => state.searchUsers);
  const fetchFriendsAndRequests = useStore((state) => state.fetchFriendsAndRequests);
  const sendFriendRequest = useStore((state) => state.sendFriendRequest);
  const approveFriendRequest = useStore((state) => state.approveFriendRequest);
  const fetchDirectMessages = useStore((state) => state.fetchDirectMessages);
  const sendDirectMessage = useStore((state) => state.sendDirectMessage);

  const [isEditing, setIsEditing] = useState(false);
  const [bioText, setBioText] = useState(profile?.bio || '');
  const [activeSubTab, setActiveSubTab] = useState<'locker' | 'connections'>('locker');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ email: string; username: string; level: string; xp: number }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFriendEmail, setSelectedFriendEmail] = useState<string | null>(null);
  const [chatMessageText, setChatMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFriendsAndRequests();
  }, [fetchFriendsAndRequests]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatMessages]);

  const handleSelectFriend = (email: string) => {
    setSelectedFriendEmail(email);
    fetchDirectMessages(email);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFriendEmail) return;
    if (!chatMessageText.trim() && !selectedFile) return;

    await sendDirectMessage(selectedFriendEmail, chatMessageText, selectedFile || undefined);
    setChatMessageText('');
    clearFileSelection();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchUsers(searchQuery);
    setSearchResults(results || []);
    setIsSearching(false);
  };

  if (!profile) return null;

  const currentLevelNum = getLevelNumber(profile.xp);
  const currentLevelName = getLevelName(currentLevelNum);

  const handleSaveBio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bioText.trim()) return;
    await updateBio(bioText);
    setIsEditing(false);
  };

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

  // Mock activity logs
  const activityLogs = [
    { text: 'Equipped profile customization style.', time: '1 hour ago' },
    { text: `Achieved ${currentLevelName} Level Status!`, time: '1 day ago' },
    { text: 'Completed daily commute habits calibration.', time: '2 days ago' },
    { text: 'Registered account in EcoVerse environment.', time: '3 days ago' }
  ];

  return (
    <div className="flex flex-col gap-6 animate-fadeInUp">
      {/* Header */}
      <div className="text-left">
        <h2 className="font-heading font-black text-2xl text-white tracking-tight">Citizen Ledger</h2>
        <p className="text-slate-400 text-sm">Review your carbon status, streaks, unlock progress, and configure profile parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (1/3 width): Profile Summary & Activity Logs */}
        <div className="flex flex-col gap-6">
          
          {/* Avatar and Bio Card */}
          <div className="glass-panel border border-white/5 p-6 rounded-3xl flex flex-col items-center gap-5 text-center relative overflow-hidden">
            <div className="absolute right-0 top-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

            {/* Avatar Frame Box */}
            <div className="relative mt-4 shrink-0">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-heading font-black text-4xl relative overflow-hidden ${getFrameClass(profile.equipped_frame)}`}>
                <PlantAvatar username={profile.username} className="w-full h-full" />
              </div>
              {profile.equipped_badge && (
                <span className="absolute -bottom-1 -right-1 bg-purple-500 text-white border-2 border-slate-950 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  {getBadgeEmoji(profile.equipped_badge)}
                </span>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col gap-1 w-full">
              <h3 className="font-heading font-black text-xl text-white">@{profile.username}</h3>
              <span className="text-xs text-emerald-400 font-extrabold uppercase tracking-widest">Level {currentLevelNum} • {currentLevelName}</span>
            </div>

            {/* Edit Bio Form */}
            <div className="w-full border-t border-white/5 pt-4 mt-2">
              {isEditing ? (
                <form onSubmit={handleSaveBio} className="flex flex-col gap-2">
                  <label htmlFor="profile-bio-input" className="sr-only">Edit Profile Bio</label>
                  <textarea
                    id="profile-bio-input"
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 resize-none h-20"
                    placeholder="Tell the community about your green habits..."
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setBioText(profile.bio || '');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white text-[10px] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-[10px] font-black cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-slate-400 text-xs italic leading-relaxed">
                    "{profile.bio || 'Protecting the planet, one habit at a time.'}"
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[10px] font-semibold text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer mt-1"
                  >
                    <Edit3 className="w-3 h-3" /> Edit Bio
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline Card */}
          <div className="glass-panel border border-white/5 p-6 rounded-3xl text-left flex flex-col gap-4">
            <h3 className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Recent Timeline
            </h3>

            <div className="flex flex-col gap-4 relative pl-4 border-l border-white/5">
              {activityLogs.map((log, idx) => (
                <div key={idx} className="flex flex-col gap-0.5 relative text-xs">
                  {/* Timeline dot */}
                  <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]"></span>
                  <span className="text-slate-300 font-medium leading-relaxed">{log.text}</span>
                  <span className="text-[10px] text-slate-500">{log.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Columns (2/3 width): locker and achievements grid */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Sub Tab Bar */}
          <div className="flex gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 w-fit">
            <button
              onClick={() => setActiveSubTab('locker')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'locker'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" /> locker & Achievements
            </button>
            <button
              onClick={() => setActiveSubTab('connections')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'connections'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" /> Connections Portal
            </button>
          </div>

          {activeSubTab === 'locker' ? (
            <>
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="glass-panel border border-white/5 p-4 rounded-2xl text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">XP Level</span>
                  <span className="font-heading font-black text-white text-base block mt-0.5">{profile.xp} XP</span>
                </div>
                <div className="glass-panel border border-white/5 p-4 rounded-2xl text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">Eco Coins</span>
                  <span className="font-heading font-black text-emerald-400 text-base block mt-0.5">{profile.coins} 🪙</span>
                </div>
                <div className="glass-panel border border-white/5 p-4 rounded-2xl text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">Streak Fire</span>
                  <span className="font-heading font-black text-amber-500 text-base block mt-0.5 flex items-center justify-center gap-0.5">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" /> {profile.streak} Days
                  </span>
                </div>
                <div className="glass-panel border border-white/5 p-4 rounded-2xl text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">CO₂ Saved</span>
                  <span className="font-heading font-black text-cyan-400 text-base block mt-0.5">{profile.carbon_saved} kg</span>
                </div>
              </div>

              {/* Achievements Grid */}
              <div className="glass-panel border border-white/5 p-6 rounded-3xl text-left flex flex-col gap-4">
                <h3 className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-400" /> Unlocked achievements
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((ach) => {
                    const isCompleted = ach.completed;
                    return (
                      <div 
                        key={ach.id} 
                        className={`flex gap-4 p-4 rounded-2xl border transition-all ${
                          isCompleted 
                            ? 'border-emerald-500/20 bg-emerald-950/5 text-slate-200' 
                            : 'border-white/5 bg-slate-950/20 text-slate-500 opacity-60'
                        }`}
                      >
                        <div className="text-3xl shrink-0 select-none flex items-center justify-center">
                          {isCompleted ? ach.badge : '🔒'}
                        </div>
                        <div className="flex flex-col text-left gap-0.5">
                          <span className="font-heading font-bold text-white text-sm">{ach.name}</span>
                          <span className="text-[10px] text-slate-400 leading-normal">{ach.description}</span>
                          <span className="text-[9px] font-extrabold text-emerald-400 mt-1 uppercase tracking-wide">+{ach.xp_reward} XP • +{ach.coin_reward} Coins</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customize Locker */}
              <div className="glass-panel border border-white/5 p-6 rounded-3xl text-left flex flex-col gap-4">
                <h3 className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" /> Customisation Locker
                </h3>

                {/* Badges Locker */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Unlocked Badges</span>
                  <div className="flex flex-wrap gap-2">
                    {(profile.owned_badges || []).map((badge, idx) => {
                      const isEquippedBadge = profile.equipped_badge === badge;
                      return (
                        <button
                          key={idx}
                          disabled={isLoading}
                          onClick={() => equipItem('badge', badge)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isEquippedBadge 
                              ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400' 
                              : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span>🏆 {badge.replace('_', ' ')}</span>
                          {isEquippedBadge && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Frames Locker */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Unlocked Frames</span>
                  <div className="flex flex-wrap gap-2">
                    {(profile.owned_frames || []).map((frame, idx) => {
                      const isEquippedFrame = profile.equipped_frame === frame;
                      return (
                        <button
                          key={idx}
                          disabled={isLoading}
                          onClick={() => equipItem('frame', frame)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isEquippedFrame 
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                              : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span>🖼️ {frame.charAt(0).toUpperCase() + frame.slice(1)} Frame</span>
                          {isEquippedFrame && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Themes Locker */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Unlocked Ambient Themes</span>
                  <div className="flex flex-wrap gap-2">
                    {(profile.owned_themes || []).map((theme, idx) => {
                      const isEquippedTheme = profile.equipped_theme === theme;
                      return (
                        <button
                          key={idx}
                          disabled={isLoading}
                          onClick={() => equipItem('theme', theme)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isEquippedTheme 
                              ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' 
                              : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span>🎨 {theme.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Theme</span>
                          {isEquippedTheme && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="glass-panel border border-white/5 p-6 rounded-3xl text-left flex flex-col gap-5 h-[650px] relative overflow-hidden">
              <div className="absolute right-0 top-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden">
                
                {/* Left Panel: Search Users + Friend Requests + Friends List */}
                <div className="md:col-span-1 border-r border-white/5 pr-4 flex flex-col gap-4 overflow-y-auto h-full">
                  
                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <label htmlFor="user-search-input" className="sr-only">Search warden email</label>
                    <input
                      id="user-search-input"
                      type="text"
                      placeholder="Search warden email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-grow bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-slate-300 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                    />
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="p-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md"
                      aria-label="Search users"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="flex flex-col gap-1 bg-slate-950/40 p-2.5 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Search Results</span>
                        <button onClick={() => setSearchResults([])} className="text-[9px] text-slate-500 hover:text-white">Clear</button>
                      </div>
                      <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
                        {searchResults.map((user) => {
                          const isPendingReq = pendingRequests.some(r => r.user_email === user.email || r.friend_email === user.email);
                          const isAlreadyFriend = friends.some(f => f.user_email === user.email || f.friend_email === user.email);
                          return (
                            <div key={user.email} className="flex justify-between items-center p-2 rounded-xl bg-slate-900/60 border border-white/5">
                              <div className="flex flex-col text-left">
                                <span className="text-[10px] font-bold text-white">@{user.username}</span>
                                <span className="text-[8px] text-emerald-400 font-extrabold uppercase">Level {getLevelNumber(user.xp)}</span>
                              </div>
                              {isAlreadyFriend ? (
                                <span className="text-[8px] text-slate-500 font-extrabold uppercase">Friend</span>
                              ) : isPendingReq ? (
                                <span className="text-[8px] text-amber-500 font-extrabold uppercase">Pending</span>
                              ) : (
                                <button
                                  onClick={() => sendFriendRequest(user.email)}
                                  className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:text-slate-950 text-emerald-400 text-[8px] font-bold rounded-lg transition-all cursor-pointer"
                                >
                                  Request
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pending Incoming Requests */}
                  {pendingRequests.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Pending Requests ({pendingRequests.length})</span>
                      <div className="flex flex-col gap-1.5">
                        {pendingRequests.map((req) => (
                          <div key={req.id} className="flex justify-between items-center p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-left">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-white">@{req.friend_name}</span>
                              <span className="text-[8px] text-slate-400 font-extrabold uppercase">wants to connect</span>
                            </div>
                            <button
                              onClick={() => approveFriendRequest(req.user_email)}
                              className="px-2 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-[9px] font-black rounded-lg hover:scale-[1.03] transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Friends List */}
                  <div className="flex flex-col gap-2 flex-grow overflow-y-auto">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Active Friends ({friends.length})</span>
                    <div className="flex flex-col gap-1.5">
                      {friends.map((friend) => {
                        const email = friend.user_email === profile.email ? friend.friend_email : friend.user_email;
                        const isSelected = selectedFriendEmail === email;
                        return (
                          <button
                            key={friend.id}
                            onClick={() => handleSelectFriend(email)}
                            className={`w-full flex justify-between items-center p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30'
                                : 'bg-slate-950/20 border-white/5 hover:bg-slate-900/40 hover:border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <PlantAvatar username={friend.friend_name} className="w-8 h-8 shrink-0" />
                              <div className="flex flex-col">
                                <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>@{friend.friend_name}</span>
                                <span className="text-[8px] text-slate-500 font-extrabold uppercase">Level {friend.friend_level}</span>
                              </div>
                            </div>
                            <MessageSquare className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                          </button>
                        );
                      })}
                      {friends.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-8 bg-slate-950/10 border border-dashed border-white/5 rounded-2xl text-slate-500 italic text-[10px] text-center w-full">
                          <span>No active warden connections yet.</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Panel: Chat Messages Viewport */}
                <div className="md:col-span-2 flex flex-col justify-between overflow-hidden h-full">
                  {selectedFriendEmail ? (
                    <div className="flex flex-col justify-between h-full bg-slate-950/20 border border-white/5 rounded-3xl p-4 overflow-hidden relative">
                      
                      {/* Chat Header */}
                      <div className="border-b border-white/5 pb-3 mb-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-black text-xs text-white uppercase tracking-wider">
                            Transmissions: @{friends.find(f => f.user_email === selectedFriendEmail || f.friend_email === selectedFriendEmail)?.friend_name}
                          </span>
                        </div>
                        <button onClick={() => setSelectedFriendEmail(null)} className="text-slate-500 hover:text-white" aria-label="Close chat window">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Messages List */}
                      <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-3 mb-3">
                        {activeChatMessages.map((msg) => {
                          const isMe = msg.sender_email === profile.email;
                          const showImage = msg.media_url && msg.media_type === 'image';
                          const showVideo = msg.media_url && msg.media_type === 'video';
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col gap-1 max-w-[80%] text-left ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                            >
                              <div className={`p-3 rounded-2xl text-[11px] leading-relaxed border ${
                                isMe
                                  ? 'bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20 text-white rounded-tr-sm'
                                  : 'bg-slate-900/80 border-white/5 text-slate-300 rounded-tl-sm'
                              }`}>
                                {msg.message && <p>{msg.message}</p>}
                                
                                {showImage && (
                                  <a href={msg.media_url} target="_blank" rel="noreferrer" className="block mt-1.5 overflow-hidden rounded-xl border border-white/10 hover:border-emerald-400 transition-all">
                                    <img src={msg.media_url} alt="Attached Media" className="max-w-full max-h-48 object-cover" />
                                  </a>
                                )}
                                {showVideo && (
                                  <div className="block mt-1.5 overflow-hidden rounded-xl border border-white/10">
                                    <video src={msg.media_url} controls className="max-w-full max-h-48 object-cover" />
                                  </div>
                                )}
                              </div>
                              <span className="text-[8px] text-slate-600 px-1">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })}
                        {activeChatMessages.length === 0 && (
                          <div className="flex-grow flex items-center justify-center text-slate-500 italic text-[10px]">
                            <span>No transmission records. Send a message to open link.</span>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* File Upload Preview */}
                      {selectedFile && (
                        <div className="mb-2 bg-slate-950/80 border border-white/10 p-2 rounded-xl flex justify-between items-center">
                          <div className="flex items-center gap-2 text-[10px] text-slate-300">
                            {selectedFile.type.includes('video') ? <Video className="w-3.5 h-3.5 text-cyan-400" /> : <Image className="w-3.5 h-3.5 text-emerald-400" />}
                            <span className="truncate max-w-[150px]">{selectedFile.name}</span>
                          </div>
                          <button onClick={clearFileSelection} className="text-slate-500 hover:text-white" aria-label="Remove attachment">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Chat Input Form */}
                      <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-white/5 pt-3">
                        <input
                          id="chat-file-input"
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*,video/*"
                          className="hidden"
                          aria-label="Upload media attachment"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0"
                          title="Attach Image/Video"
                          aria-label="Attach media file"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                        </button>
                        
                        <label htmlFor="chat-text-input" className="sr-only">Type secure transmission</label>
                        <input
                          id="chat-text-input"
                          type="text"
                          placeholder="Type secure transmission..."
                          value={chatMessageText}
                          onChange={(e) => setChatMessageText(e.target.value)}
                          className="flex-grow bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 placeholder-slate-600"
                        />
                        
                        <button
                          type="submit"
                          disabled={!chatMessageText.trim() && !selectedFile}
                          className="px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 disabled:opacity-40"
                          aria-label="Send message"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>

                    </div>
                  ) : (
                    <div className="h-full bg-slate-950/20 border border-dashed border-white/5 rounded-3xl flex flex-col justify-center items-center text-center p-8 gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col gap-1 max-w-[240px]">
                        <span className="font-heading font-black text-xs text-slate-300 uppercase tracking-wider">Transmissions Offline</span>
                        <span className="text-[10px] text-slate-500 leading-normal">Select an approved warden from the connections list to open secure text and media channels.</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
