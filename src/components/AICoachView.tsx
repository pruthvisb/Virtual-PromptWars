import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Send, Sparkles, User, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const urlStr = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);
  if (!isLocalHost && (urlStr.includes('localhost:') || urlStr.includes('127.0.0.1:'))) {
    throw new Error(`Bypassing local connection to ${urlStr} in production.`);
  }
  return window.fetch(input, init);
};

export default function AICoachView() {
  const chatHistory = useStore((state) => state.chatHistory);
  const isLoading = useStore((state) => state.isLoading);
  const showToast = useStore((state) => state.showToast);

  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat history
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleSend = (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    // Send query
    triggerSend(inputText);
    setInputText('');
  };

  const triggerSend = async (text: string) => {
    // Write message locally
    useStore.setState((state) => ({
      chatHistory: [...state.chatHistory, { sender: 'user', text }]
    }));

    // Trigger AI loading state
    useStore.setState({ isLoading: true });

    try {
      const res = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      useStore.setState((state) => ({
        chatHistory: [...state.chatHistory, { sender: 'bot', text: data.reply }]
      }));
    } catch (err) {
      // Local fallback mock response
      const lowMsg = text.toLowerCase();
      let reply = "Great question! Sustainability is built on simple daily actions like walk/bike transit commutes, plant-based meals, and digital cloud clearings.";
      
      if (lowMsg.includes('score') || lowMsg.includes('footprint') || lowMsg.includes('how am i doing')) {
        reply = "Your current footprint baseline is 18.2 kg CO₂e/day, but with your active quests completed today, you have successfully saved emissions! Keep it up.";
      } else if (lowMsg.includes('highest') || lowMsg.includes('emitter') || lowMsg.includes('worst')) {
        reply = "Your single largest carbon category is Conventional Transport Commuting. Consider walking, cycling, or public transit to wipe this out!";
      } else if (lowMsg.includes('bank') || lowMsg.includes('finance') || lowMsg.includes('money')) {
        reply = "Conventional commercial banks represent the highest silent capital funders of oil/gas grids. Swapping your bank deposits to a clean green ESG bank will wipe out financed emissions!";
      }

      useStore.setState((state) => ({
        chatHistory: [...state.chatHistory, { sender: 'bot', text: reply }]
      }));
      showToast('Offline fallback mock reply.', 'info');
    } finally {
      useStore.setState({ isLoading: false });
    }
  };

  const chips = [
    { label: '📊 Footprint Score', text: 'How is my carbon footprint doing today?' },
    { label: '🔥 Highest Emitter', text: 'What is my highest emission domain?' },
    { label: '🚴 Reduce Transport', text: 'How do I cut down transport emissions?' },
    { label: '🏦 Swapping Banks', text: 'Tell me how to reduce banking emissions' }
  ];

  return (
    <div className="flex flex-col gap-4 animate-fadeInUp h-[calc(100vh-12rem)] max-h-[600px]">
      {/* Header */}
      <div className="text-left">
        <h2 className="font-heading font-black text-2xl text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400 fill-emerald-400/10 animate-pulse" /> AI Carbon Coach
        </h2>
        <p className="text-slate-400 text-sm">Ask about your baseline twin, carbon auditing, and habits suggestions.</p>
      </div>

      {/* Chat Messages Viewport */}
      <div className="flex-grow glass-panel border border-white/5 rounded-3xl p-5 flex flex-col justify-between overflow-hidden relative">
        <div className="absolute right-0 top-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-4 mb-4">
          {(chatHistory || []).map((msg, idx) => {
            const isBot = msg.sender === 'bot';
            return (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] text-left ${isBot ? 'self-start' : 'self-end flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  isBot 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                    : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                }`}>
                  {isBot ? <Cpu className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Msg text */}
                <div className={`p-4 rounded-3xl text-xs leading-relaxed border ${
                  isBot 
                    ? 'bg-slate-900/80 border-white/5 text-slate-200 rounded-tl-sm' 
                    : 'bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20 text-white rounded-tr-sm'
                }`}>
                  {msg.text.split('\n').map((line, lineIdx) => {
                    const boldRegex = /\*\*(.*?)\*\*/g;
                    let match;
                    const parts = [];
                    let lastIndex = 0;
                    while ((match = boldRegex.exec(line)) !== null) {
                      parts.push(line.substring(lastIndex, match.index));
                      parts.push(<strong key={match.index} className="text-emerald-400 font-extrabold">{match[1]}</strong>);
                      lastIndex = boldRegex.lastIndex;
                    }
                    parts.push(line.substring(lastIndex));
                    return (
                      <div key={lineIdx} className={lineIdx > 0 ? 'mt-1.5' : ''}>
                        {parts.length > 1 ? parts : line}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex gap-3 self-start max-w-[80%] text-left animate-pulse">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <Cpu className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-900/80 border border-white/5 p-4 rounded-3xl rounded-tl-sm text-xs text-slate-400">
                <span>Warden is formulating reply...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Prompt Chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {chips.map((chip, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => triggerSend(chip.text)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white text-[10px] font-semibold tracking-wide transition-all cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Text Input Area */}
        <form onSubmit={handleSend} className="flex gap-2">
          <label htmlFor="ai-chat-input" className="sr-only">Ask Carbon Coach</label>
          <input
            id="ai-chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Ask Carbon Coach about your footprints..."
            className="flex-grow bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 placeholder-slate-600"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-heading font-black flex items-center justify-center transition-all cursor-pointer shadow-md"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
