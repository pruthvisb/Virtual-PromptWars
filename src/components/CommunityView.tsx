import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Users, Send, Heart, MessageSquare, Trophy, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PlantAvatar from './PlantAvatar';

export default function CommunityView() {
  const profile = useStore((state) => state.profile);
  const socialPosts = useStore((state) => state.socialPosts);
  const addSocialPost = useStore((state) => state.addSocialPost);
  const applaudPost = useStore((state) => state.applaudPost);
  const addComment = useStore((state) => state.addComment);
  const isLoading = useStore((state) => state.isLoading);
  const dbLeaderboard = useStore((state) => state.leaderboard || []);

  const [postText, setPostText] = useState('');
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);

  // Dynamic relative time calculations
  const formatRelativeTime = (timeStr: string) => {
    if (!timeStr) return '';
    if (timeStr === 'Just now') return 'Just now';
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      if (seconds < 60) return 'Just now';
      
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch (e) {
      return timeStr;
    }
  };

  if (!profile) return null;

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) return;
    await addSocialPost(postText);
    setPostText('');
  };

  const handleCommentSubmit = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const comment = commentTexts[postId];
    if (!comment || !comment.trim()) return;
    await addComment(postId, comment);
    setCommentTexts(prev => ({ ...prev, [postId]: '' }));
  };

  // Dynamic leaderboard computed from the DB, ensuring current user is present
  const leaderboard = React.useMemo(() => {
    const list = [...dbLeaderboard];
    const hasMe = list.some(u => u.username === profile.username);
    if (!hasMe && profile.username) {
      list.push({
        username: profile.username,
        xp: profile.xp,
        level: profile.level
      });
    }
    list.sort((a, b) => b.xp - a.xp);
    return list.map((user, idx) => ({
      rank: idx + 1,
      name: user.username,
      xp: user.xp,
      level: user.level,
      me: user.username === profile.username
    }));
  }, [dbLeaderboard, profile]);

  return (
    <div className="flex flex-col gap-6 animate-fadeInUp">
      {/* Header */}
      <div className="text-left">
        <h2 className="font-heading font-black text-2xl text-white tracking-tight">Eco Community</h2>
        <p className="text-slate-400 text-sm">Synchronize with local wardens, review rankings, and share achievements to earn XP.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Collective Targets (col-span-2) */}
        <div className="lg:col-span-2 glass-panel border border-white/5 p-6 rounded-3xl flex flex-col justify-between gap-5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <h3 className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" /> Active Grid Objective
          </h3>

          <div className="flex flex-col gap-4 text-left">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-white">June Mangrove Reforestation</span>
                <span className="text-cyan-400">385 / 500 Trees Funded</span>
              </div>
              <div className="w-full h-3 bg-slate-950/60 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full" style={{ width: '77%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-white">Active Habits Commute Swap</span>
                <span className="text-cyan-400">92 / 120 Trips Completed</span>
              </div>
              <div className="w-full h-3 bg-slate-950/60 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full" style={{ width: '76.6%' }}></div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 text-left border-t border-white/5 pt-3">
            Grid objectives are collectively shared by all connected citizens. Completing quests directly drives community milestones!
          </p>
        </div>

        {/* Leaderboard rankings */}
        <div className="glass-panel border border-white/5 p-6 rounded-3xl flex flex-col gap-4 text-left">
          <h3 className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" /> Warden Rankings
          </h3>

          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {leaderboard.map((user, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center p-2.5 rounded-xl border ${
                  user.me 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-white' 
                    : 'bg-slate-950/40 border-transparent text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-500 w-4">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                  </span>
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold ${user.me ? 'text-emerald-400' : 'text-white'}`}>
                      {user.name}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold">{user.level}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-300">{user.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Feed Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create post */}
        <div className="glass-panel border border-white/5 p-6 rounded-3xl h-fit flex flex-col gap-4 text-left">
          <h3 className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> Share Achievement
          </h3>

          <form onSubmit={handlePostSubmit} className="flex flex-col gap-3">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-xs text-slate-300 focus:outline-none focus:border-purple-500 resize-none h-28"
              placeholder="Tell other wardens about your completed quests..."
            />
            <button
              type="submit"
              disabled={isLoading || !postText.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-heading font-black text-xs tracking-wider transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
            >
              Post to Feed <Send className="w-3.5 h-3.5" />
            </button>
            <span className="text-[9px] text-slate-500 text-center">Sharing accomplishments awards +20 XP automatically!</span>
          </form>
        </div>

        {/* List posts */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <AnimatePresence>
            {socialPosts.map((post) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                key={post.id}
                className="glass-panel border border-white/5 p-5 rounded-3xl flex flex-col gap-4 text-left"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <PlantAvatar username={post.author} className="w-10 h-10 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{post.author}</span>
                      <span className="text-[10px] text-slate-500">{formatRelativeTime(post.time)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed">{post.content}</p>

                {/* React bar */}
                <div className="flex items-center gap-4 border-y border-white/5 py-2.5">
                  {(() => {
                    const hasApplauded = (post.applauders || []).includes(profile.username);
                    return (
                      <button 
                        onClick={() => applaudPost(post.id)}
                        className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
                          hasApplauded ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-emerald-400'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${hasApplauded ? 'fill-emerald-400 text-emerald-400' : 'fill-emerald-500/5 hover:fill-emerald-500'}`} />
                        <span>{hasApplauded ? 'Applauded' : 'Applaud'} ({post.applauds})</span>
                      </button>
                    );
                  })()}

                  <button 
                    onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Comments ({(post.comments || []).length})</span>
                  </button>
                </div>

                {/* Comments box */}
                {activeCommentsPostId === post.id && (
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pl-2 border-l border-white/10 pr-1">
                      {(post.comments || []).map((comment, index) => {
                        const commentAvatar = (comment.author || 'U').charAt(0).toUpperCase();
                        return (
                          <div key={index} className="flex gap-2.5 items-start text-xs bg-slate-900/60 p-3 rounded-2xl border border-white/5 shadow-sm">
                            <PlantAvatar username={comment.author} className="w-6 h-6 shrink-0" />
                            <div className="flex flex-col gap-0.5 text-left">
                              <span className="font-bold text-slate-200 text-[11px]">{comment.author}</span>
                              <span className="text-slate-300 leading-relaxed">{comment.text}</span>
                            </div>
                          </div>
                        );
                      })}
                      {(post.comments || []).length === 0 && (
                        <span className="text-[10px] text-slate-500 italic pl-1">No comments yet. Write a response!</span>
                      )}
                    </div>

                    <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex gap-2">
                      <input
                        type="text"
                        value={commentTexts[post.id] || ''}
                        onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Add comment..."
                        className="flex-grow bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !(commentTexts[post.id] || '').trim()}
                        className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wide cursor-pointer"
                      >
                        Reply
                      </button>
                    </form>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
