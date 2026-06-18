'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Image as ImageIcon, Send, TrendingUp, Award } from 'lucide-react';
import { communityAPI } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Post {
  _id: string;
  user: { _id: string; name: string; avatar?: string; ecoPoints: number };
  content: string;
  image?: string;
  likes: string[];
  comments: { _id: string; user: { name: string }; content: string; createdAt: string }[];
  createdAt: string;
}

const MOCK_POSTS: Post[] = [
  { _id: '1', user: { _id: 'u1', name: 'Aisha Rahman', ecoPoints: 6800 }, content: 'Just completed the "No Plastic Week" challenge! It was tough but totally worth it. Found some amazing alternatives to single-use plastics at my local market. 🌍♻️', likes: ['u2', 'u3', 'u4'], comments: [{ _id: 'c1', user: { name: 'James' }, content: 'Awesome job! What alternatives did you find?', createdAt: new Date().toISOString() }], createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: '2', user: { _id: 'u2', name: 'James Mitchell', ecoPoints: 7200 }, content: 'Planted 5 new saplings in our neighborhood park today! Let\'s keep making our cities greener. 🌱🌳', likes: ['u1', 'u5'], comments: [], createdAt: new Date(Date.now() - 86400000).toISOString() },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await communityAPI.getPosts();
        if (res.data.data?.length) setPosts(res.data.data);
      } catch { /* use mock */ }
    };
    load();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setLoading(true);
    try {
      const res = await communityAPI.createPost({ content: newPost });
      setPosts(prev => [res.data.data, ...prev]);
      toast.success('Post published!');
    } catch {
      const post: Post = {
        _id: Date.now().toString(),
        user: { _id: user?.id || 'me', name: user?.name || 'Me', ecoPoints: user?.ecoPoints || 0 },
        content: newPost,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
      };
      setPosts(prev => [post, ...prev]);
      toast.success('Post published!');
    } finally {
      setNewPost('');
      setLoading(false);
    }
  };

  const handleLike = async (id: string) => {
    try { await communityAPI.like(id); } catch { /* local */ }
    setPosts(prev => prev.map(p => {
      if (p._id !== id) return p;
      const isLiked = p.likes.includes(user?.id || 'me');
      return { ...p, likes: isLiked ? p.likes.filter(l => l !== (user?.id || 'me')) : [...p.likes, user?.id || 'me'] };
    }));
  };

  const handleComment = async (id: string) => {
    if (!commentText.trim()) return;
    try { await communityAPI.comment(id, commentText); } catch { /* local */ }
    setPosts(prev => prev.map(p => {
      if (p._id !== id) return p;
      return { ...p, comments: [...p.comments, { _id: Date.now().toString(), user: { name: user?.name || 'Me' }, content: commentText, createdAt: new Date().toISOString() }] };
    }));
    setCommentText('');
    toast.success('Comment added');
  };

  return (
    <DashboardLayout>
      {/* Two-column layout: feed + right sidebar */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

        {/* ── Main Feed ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Page Header */}
          <div>
            <h1 className="page-title">Community</h1>
            <p className="page-subtitle">Connect, share, and get inspired by fellow eco-warriors</p>
          </div>

          {/* Create Post */}
          <div className="glass-card" style={{ borderRadius: 20, padding: '24px' }}>
            <div style={{ display: 'flex', gap: 14 }}>
              <div className="gradient-bg" style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  placeholder="Share your eco-journey, tips, or achievements..."
                  value={newPost} onChange={e => setNewPost(e.target.value)} rows={3}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.9rem', outline: 'none', resize: 'none', fontFamily: 'var(--font)', lineHeight: 1.6 }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <button style={{ padding: '8px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8 }}>
                    <ImageIcon style={{ width: 20, height: 20 }} />
                  </button>
                  <button onClick={handlePost} disabled={!newPost.trim() || loading}
                    className="btn-primary" style={{ padding: '9px 22px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8, opacity: (!newPost.trim() || loading) ? 0.6 : 1 }}>
                    {loading ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite', display: 'inline-block' }} /> : <><Send style={{ width: 15, height: 15 }} /> Post</>}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <AnimatePresence>
              {posts.map((post, i) => {
                const isLiked = post.likes.includes(user?.id || 'me');
                return (
                  <motion.div key={post._id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass-card"
                    style={{ borderRadius: 20, padding: '24px' }}
                  >
                    {/* Post header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', fontWeight: 800, fontSize: '1.1rem', overflow: 'hidden', flexShrink: 0 }}>
                          {post.user.avatar ? <img src={post.user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : post.user.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9375rem' }}>{post.user.name}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            {new Date(post.createdAt).toLocaleDateString()} · <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{post.user.ecoPoints} pts</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p style={{ color: 'var(--text-2)', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: 20 }}>{post.content}</p>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                      <button onClick={() => handleLike(post._id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: isLiked ? '#EF4444' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}>
                        <Heart style={{ width: 18, height: 18, fill: isLiked ? 'currentColor' : 'none' }} /> {post.likes.length}
                      </button>
                      <button onClick={() => setActiveComment(activeComment === post._id ? null : post._id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}>
                        <MessageCircle style={{ width: 18, height: 18 }} /> {post.comments.length}
                      </button>
                      <button style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}>
                        <Share2 style={{ width: 16, height: 16 }} /> Share
                      </button>
                    </div>

                    {/* Comments */}
                    <AnimatePresence>
                      {activeComment === post._id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                          <div style={{ paddingTop: 20, marginTop: 16, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {post.comments.map(c => (
                              <div key={c._id} style={{ display: 'flex', gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>{c.user.name.charAt(0)}</div>
                                <div style={{ flex: 1, background: 'var(--bg)', padding: '12px 14px', borderRadius: '14px 14px 14px 4px' }}>
                                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{c.user.name}</div>
                                  <div style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>{c.content}</div>
                                </div>
                              </div>
                            ))}
                            <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                              <input type="text" placeholder="Write a comment..."
                                value={commentText} onChange={e => setCommentText(e.target.value)}
                                style={{ flex: 1, padding: '10px 16px', borderRadius: 99, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.875rem', outline: 'none', fontFamily: 'var(--font)' }}
                                onKeyDown={e => { if (e.key === 'Enter') handleComment(post._id); }} />
                              <button onClick={() => handleComment(post._id)} disabled={!commentText.trim()}
                                className="gradient-bg" style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', color: 'white', opacity: !commentText.trim() ? 0.5 : 1 }}>
                                <Send style={{ width: 15, height: 15 }} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div style={{ width: 304, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 24 }}>
          {/* Trending Topics */}
          <div className="glass-card" style={{ borderRadius: 20, padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9375rem' }}>
              <TrendingUp style={{ width: 16, height: 16, color: 'var(--primary)' }} /> Trending Topics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['#NoPlasticWeek', '#EcoTransport', '#PlantATree', '#VeganLife'].map((t, i) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onMouseEnter={e => { (e.currentTarget.querySelector('.topic-text') as HTMLElement)!.style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { (e.currentTarget.querySelector('.topic-text') as HTMLElement)!.style.color = 'var(--text-2)'; }}>
                  <span className="topic-text" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-2)', transition: 'color 0.2s' }}>{t}</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{10 - i}k posts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="glass-card" style={{ borderRadius: 20, padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9375rem' }}>
              <Award style={{ width: 16, height: 16, color: '#F59E0B' }} /> Top Contributors
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {MOCK_POSTS.map(p => p.user).map((u, i) => (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="gradient-bg" style={{ width: 40, height: 40, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>{u.name.charAt(0)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>{u.ecoPoints} pts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
