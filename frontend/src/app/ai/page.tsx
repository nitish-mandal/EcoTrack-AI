'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Leaf, Trash2, Lightbulb } from 'lucide-react';
import { aiAPI } from '@/services/api';
import { useAuthStore } from '@/store';
import DashboardLayout from '@/components/DashboardLayout';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  '💡 How can I reduce my carbon footprint?',
  '🚗 What are eco-friendly transport options?',
  '🌱 Give me tips for sustainable eating',
  '⚡ How to reduce home energy consumption?',
  '♻️ What can I recycle at home?',
  '🌍 What is my environmental impact?',
];

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `# 🌱 Hello! I'm EcoBot, your AI sustainability coach!\n\nI'm here to help you:\n- **Reduce your carbon footprint** with personalized tips\n- **Understand your impact** on the environment\n- **Set & achieve** sustainability goals\n- **Learn** about eco-friendly alternatives\n\nWhat would you like to know today?`,
  timestamp: new Date(),
};

function formatContent(content: string) {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^# (.*$)/gm, '<h3 style="font-size:1.05rem;font-weight:800;margin-bottom:8px;font-family:var(--font-display)">$1</h3>')
    .replace(/^## (.*$)/gm, '<h4 style="font-weight:700;margin-bottom:6px">$1</h4>')
    .replace(/^- (.*$)/gm, '<li style="margin-left:16px;list-style:disc;margin-bottom:4px">$1</li>')
    .replace(/\n/g, '<br/>');
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dailyTip, setDailyTip] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const loadTip = async () => {
      try {
        const res = await aiAPI.getDailyTip();
        setDailyTip(res.data.data?.tip);
      } catch {
        setDailyTip('🌱 Tip: Switch to LED bulbs to reduce energy consumption by 75%!');
      }
    };
    loadTip();
  }, []);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') + '/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('ecotrack-auth') || '{}').state?.token || '' : ''}` },
        body: JSON.stringify({ message: messageText }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.data?.response || data.message, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      const localResponses: Record<string, string> = {
        transport: '🚗 **Transportation Tips:**\n- **Walk or cycle** for trips under 5km\n- Use **public transport** — 10x less CO₂ than driving\n- **Carpool** to cut emissions in half\n- Consider an **electric vehicle** for long-term savings\n- Work from home when possible to eliminate commute',
        energy: '⚡ **Energy Saving Tips:**\n- Switch to **LED bulbs** — save 75% energy\n- **Unplug devices** when not in use\n- Set AC at **24°C or higher**\n- Use **solar panels** if possible\n- **Insulate your home** to reduce heating/cooling needs',
        food: '🌱 **Sustainable Diet Tips:**\n- Try **Meatless Mondays** — beef has 60x more emissions than vegetables\n- Buy **local and seasonal** produce\n- **Reduce food waste** by meal planning\n- Choose **organic** when possible\n- **Grow your own** herbs and vegetables',
        recycle: '♻️ **Recycling Guide:**\n- **Paper**: Clean and dry, no food contamination\n- **Plastic**: Check the recycling number (1-7)\n- **Glass**: Rinse thoroughly\n- **Electronics**: Use e-waste centers, never landfill\n- **Compost** organic waste for garden use',
        default: '🌍 **Eco Tip for You!**\n\nHere are some quick wins to reduce your carbon footprint:\n\n1. **Calculate your footprint** using our calculator\n2. **Set a reduction goal** — even 10% matters\n3. **Plant trees** to offset your emissions\n4. **Join challenges** with the community\n5. **Track daily habits** to see your progress\n\nEvery action counts! 🌱',
      };

      const lower = messageText.toLowerCase();
      let response = localResponses.default;
      if (lower.includes('transport') || lower.includes('car') || lower.includes('bus') || lower.includes('drive')) response = localResponses.transport;
      else if (lower.includes('energy') || lower.includes('electric') || lower.includes('power') || lower.includes('ac')) response = localResponses.energy;
      else if (lower.includes('food') || lower.includes('eat') || lower.includes('diet') || lower.includes('veg')) response = localResponses.food;
      else if (lower.includes('recycl') || lower.includes('waste') || lower.includes('plastic')) response = localResponses.recycle;

      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    toast.success('Chat cleared!');
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 860, margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="gradient-bg animate-pulse-glow" style={{ width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(34,197,94,0.3)', flexShrink: 0 }}>
              <Bot style={{ width: 24, height: 24, color: 'white' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.01em' }}>EcoBot</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', animation: 'pulse-green 2s ease-in-out infinite' }} />
                AI Sustainability Coach · Online
              </div>
            </div>
          </div>
          <button onClick={clearChat}
            className="glass-card" style={{ padding: '10px 12px', borderRadius: 12, cursor: 'pointer', color: 'var(--text-muted)', border: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 600, transition: 'all 0.2s' }}>
            <Trash2 style={{ width: 15, height: 15 }} /> Clear
          </button>
        </div>

        {/* ── Daily Tip ── */}
        {dailyTip && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12, background: 'rgba(245,158,11,0.06)', border: '1.5px solid rgba(245,158,11,0.2)', flexShrink: 0 }}>
            <Lightbulb style={{ width: 17, height: 17, color: '#F59E0B', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.55 }}>{dailyTip}</p>
          </motion.div>
        )}

        {/* ── Chat Area ── */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18, paddingRight: 4 }}>
          <AnimatePresence>
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: msg.role === 'user' ? 'linear-gradient(135deg,#22C55E,#16A34A)' : 'var(--bg-2)', boxShadow: msg.role === 'user' ? '0 4px 12px rgba(34,197,94,0.3)' : 'none' }}>
                  {msg.role === 'user' ? <User style={{ width: 16, height: 16, color: 'white' }} /> : <Leaf style={{ width: 16, height: 16, color: 'var(--primary)' }} />}
                </div>
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'} style={{ maxWidth: '78%' }}>
                  <div style={{ fontSize: '0.9375rem', lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                  <div style={{ fontSize: '0.75rem', marginTop: 8, color: msg.role === 'user' ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)' }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Leaf style={{ width: 16, height: 16, color: 'var(--primary)' }} />
              </div>
              <div className="chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)', animation: 'float 1.4s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>EcoBot is thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Suggested Prompts ── */}
        {messages.length <= 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flexShrink: 0 }}>
            {SUGGESTED_PROMPTS.map(p => (
              <button key={p} onClick={() => sendMessage(p)}
                className="glass-card" style={{ fontSize: '0.8125rem', padding: '8px 14px', borderRadius: 12, cursor: 'pointer', color: 'var(--text-2)', border: '1px solid var(--border)', fontFamily: 'var(--font)', fontWeight: 500, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'; e.currentTarget.style.color = 'var(--primary-dark)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}>
                {p}
              </button>
            ))}
          </div>
        )}

        {/* ── Input Bar ── */}
        <div className="glass-card" style={{ borderRadius: 18, padding: '10px 10px 10px 18px', display: 'flex', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask EcoBot anything about sustainability..."
            rows={1}
            style={{ flex: 1, background: 'transparent', color: 'var(--text)', fontSize: '0.9375rem', outline: 'none', resize: 'none', minHeight: 44, maxHeight: 140, fontFamily: 'var(--font)', lineHeight: 1.6, border: 'none', padding: '10px 0' }}
            onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            className="gradient-bg" style={{ width: 46, height: 46, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(34,197,94,0.35)', opacity: (!input.trim() || loading) ? 0.45 : 1, transition: 'all 0.2s', flexShrink: 0 }}>
            <Send style={{ width: 18, height: 18, color: 'white' }} />
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
