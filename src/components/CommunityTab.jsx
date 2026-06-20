import React, { useState } from 'react';
import { useAppState } from '../AppStateContext';

export default function CommunityTab() {
  const { 
    state, 
    addSocialPost, 
    applaudPost, 
    addComment, 
    getLeaderboardData 
  } = useAppState();

  const [postText, setPostText] = useState('');
  const [commentInputs, setCommentInputs] = useState({});

  const handleSharePost = (e) => {
    e.preventDefault();
    if (!postText.trim()) return;
    addSocialPost(postText);
    setPostText('');
  };

  const handleCommentSubmit = (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    addComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleCommentInputChange = (postId, val) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: val }));
  };

  const leaderboard = getLeaderboardData();

  return (
    <section id="community-page" className="tab-page active">
      <div className="community-layout">
        
        {/* Cooperative Quests & Social Feed */}
        <div className="coop-quests" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Cooperative Quests */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>Cooperative Quests</h3>
            
            <div className="glass-card" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-glass)', padding: '1rem', borderRadius: '12px' }}>
              <div className="coop-meta">
                <span className="coop-title" style={{ fontSize: '1.05rem', fontWeight: 'bold' }}>Neighborhood Solar Shift</span>
                <div className="coop-participants">
                  <div className="coop-avatar-stack">
                    <div className="coop-stack-avatar" style={{ background: '#3b82f6' }}>A</div>
                    <div className="coop-stack-avatar" style={{ background: '#f59e0b' }}>B</div>
                    <div className="coop-stack-avatar" style={{ background: '#ec4899' }}>C</div>
                    <div className="coop-stack-avatar more">+18</div>
                  </div>
                </div>
              </div>
              <div className="coop-progress-bar-container" style={{ margin: '0.75rem 0' }}>
                <div className="coop-progress-bar-fill" style={{ width: '76%' }}></div>
              </div>
              <div className="coop-stats">
                <span className="coop-time-left">3 days left</span>
                <span className="coop-target">Progress: <strong style={{ color: 'var(--color-primary)' }}>3,800 / 5,000 kg CO₂</strong></span>
              </div>
            </div>
          </div>

          {/* Social Feed */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>EcoSphere Community Feed</h3>
            
            {/* Share a post */}
            <form className="share-post-box" style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', padding: '1rem', borderRadius: '14px' }} onSubmit={handleSharePost}>
              <div className="user-avatar" id="social-my-avatar" style={{ width: '40px', height: '40px', fontSize: '0.95rem', borderRadius: '50%' }}>
                {state.userName ? state.userName.split(' ').map(n => n.charAt(0)).join('').toUpperCase() : 'JD'}
              </div>
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input 
                  type="text" 
                  id="social-post-input" 
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Share a green achievement with the neighborhood..." 
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', width: '100%' }} 
                  aria-label="Write a community post"
                />
                <button className="btn btn-primary" id="social-post-btn" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', alignSelf: 'flex-end', borderRadius: '8px' }} type="submit">Share Post</button>
              </div>
            </form>

            {/* Feed Posts */}
            <div className="feed-posts" id="social-feed-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {state.socialPosts.map((post) => (
                <div key={post.id} className="post-card" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="post-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="post-avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: post.avatarBg || '#10b981', display: 'flex', alignItems: 'center', justifycontent: 'center', fontWeight: 'bold', fontSize: '0.85rem', color: '#fff', textAlign: 'center', lineHeight: '36px', justifyContent: 'center' }}>
                      {post.avatar}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="post-author" style={{ fontSize: '0.85rem', fontWeight: 700 }}>{post.author}</span>
                      <span className="post-time" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{post.time}</span>
                    </div>
                  </div>
                  
                  <p className="post-content" style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>{post.content}</p>
                  
                  <div className="post-actions" style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)', padding: '0.5rem 0' }}>
                    <button 
                      className={`post-action-btn ${post.userApplauded ? 'active' : ''}`}
                      onClick={() => applaudPost(post.id)}
                      style={{ background: 'none', border: 'none', outline: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: post.userApplauded ? 'var(--color-primary)' : 'var(--text-muted)', fontWeight: 'bold' }}
                      type="button"
                    >
                      👏 Applaud ({post.applauds})
                    </button>
                  </div>

                  {/* Comments list */}
                  <div className="post-comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {post.comments.map((comment, index) => (
                      <div key={index} className="comment-row" style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.015)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                        <strong style={{ color: '#fff' }}>{comment.author}:</strong>
                        <span style={{ color: 'var(--text-muted)' }}>{comment.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Add a comment */}
                  <div className="post-comment-input-row" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <input 
                      type="text" 
                      placeholder="Write a comment..." 
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCommentSubmit(post.id); }}
                      style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-glass)', outline: 'none', color: 'var(--text-main)', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', flexGrow: 1 }}
                      aria-label="Comment input"
                    />
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleCommentSubmit(post.id)}
                      style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem' }}
                      type="button"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Online Citizens & Leaderboards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Active citizens online */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Active Citizens Online</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Connect and share challenges.</p>
            
            <div className="online-users-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              
              <div className="online-user-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div className="online-avatar-wrapper" style={{ position: 'relative' }}>
                  <div className="online-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>S</div>
                  <span className="online-indicator" style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', background: 'var(--color-primary)', borderRadius: '50%', border: '1.5px solid var(--bg-space)' }}></span>
                </div>
                <div className="online-info" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <span className="online-name" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sarah Jenkins</span>
                  <span className="online-status" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Just switched to green bank! 🏦</span>
                </div>
                <button className="online-action-btn added" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'default' }} type="button">Friend</button>
              </div>

              <div className="online-user-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div className="online-avatar-wrapper" style={{ position: 'relative' }}>
                  <div className="online-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>B</div>
                  <span className="online-indicator" style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', background: 'var(--color-primary)', borderRadius: '50%', border: '1.5px solid var(--bg-space)' }}></span>
                </div>
                <div className="online-info" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <span className="online-name" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Ben Miller</span>
                  <span className="online-status" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Online (Level 5)</span>
                </div>
                <button className="online-action-btn added" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'default' }} type="button">Friend</button>
              </div>

              <div className="online-user-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div className="online-avatar-wrapper" style={{ position: 'relative' }}>
                  <div className="online-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>A</div>
                  <span className="online-indicator" style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', background: 'var(--color-primary)', borderRadius: '50%', border: '1.5px solid var(--bg-space)' }}></span>
                </div>
                <div className="online-info" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <span className="online-name" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Alex Rivera</span>
                  <span className="online-status" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active (Level 3)</span>
                </div>
                <button className="online-action-btn added" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'default' }} type="button">Friend</button>
              </div>

            </div>
          </div>

          {/* District Leaderboard */}
          <div className="glass-card">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Local Leaderboard</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Compete with eco-advocates in your district.</p>
            <div className="leaderboard-list" id="leaderboard-list-container">
              {leaderboard.map((item) => (
                <div 
                  key={item.rank} 
                  className={`leaderboard-row ${item.me ? 'me' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.25rem', background: item.me ? 'rgba(0, 230, 118, 0.08)' : 'transparent', border: item.me ? '1px solid var(--border-glass-glow)' : '1px solid transparent' }}
                >
                  <span className="rank" style={{ width: '24px', fontWeight: 'bold', color: item.me ? 'var(--color-primary)' : 'var(--text-muted)' }}>#{item.rank}</span>
                  <span className="name" style={{ flexGrow: 1, fontSize: '0.85rem', fontWeight: item.me ? 'bold' : 'normal' }}>{item.name}</span>
                  <span className="points" style={{ fontWeight: 'bold', color: '#fff' }}>{item.points} pts</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
