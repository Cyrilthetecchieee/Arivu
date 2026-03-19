import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, LogOut, User, Sparkles, BookOpen, Zap, History, ScrollText, Globe, MessageSquare, Mic } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const LEARNING_CARDS = [
  { id: 'explain', title: 'Deep Explanation', icon: BookOpen, color: 'bg-blue-50', text: 'Master complex concepts through retrieval-augmented synthesis.', img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800' },
  { id: 'quiz', title: 'Active Recall', icon: Zap, color: 'bg-amber-50', text: 'Solidify neural pathways with dynamic quiz protocols.', img: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800' },
  { id: 'story', title: 'Narrative Synthesis', icon: Sparkles, color: 'bg-purple-50', text: 'Transform raw data into immersive cinematic stories.', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800' },
  { id: 'feynman', title: 'Feynman Logic', icon: History, color: 'bg-emerald-50', text: 'Simplify advanced logic into intuitive human language.', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800' },
  { id: 'aacharya', title: 'Ethical Guidance', icon: ScrollText, color: 'bg-rose-50', text: 'Explore the moral and ethical dimensions of knowledge.', img: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800' },
  { id: 'history', title: 'Session Archive', icon: MessageSquare, color: 'bg-slate-50', text: 'Review your past wisdom journeys and insights.', img: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&q=80&w=800' },
];

export default function Dashboard({ onStartSession, onViewArchive }: { onStartSession: (mode: string) => void, onViewArchive: () => void }) {
  const user = auth.currentUser;
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCards = LEARNING_CARDS.filter(card => 
    card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-canvas pb-24">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 glass px-8 py-6 flex items-center justify-between border-b border-black/5">
        <div className="flex items-center gap-12">
          <h1 className="text-3xl font-serif italic tracking-tighter text-ink">Arivu.</h1>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-bold tracking-[0.3em] uppercase text-muted">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-ink">Sanctuary</button>
            <button onClick={onViewArchive} className="hover:text-ink transition-colors">Archive</button>
            <button onClick={() => document.getElementById('protocols')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-ink transition-colors">Protocols</button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-ink transition-colors" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Wisdom..." 
              className="bg-black/5 border border-transparent focus:border-black/10 rounded-full py-3 pl-12 pr-6 outline-none text-xs font-bold tracking-widest uppercase transition-all w-64"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white border border-black/5 rounded-full">
              <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} alt="User" className="w-6 h-6 rounded-full" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-ink hidden lg:block">{user?.displayName?.split(' ')[0]}</span>
            </div>
            <button 
              onClick={() => signOut(auth)}
              className="p-3 text-muted hover:text-red-500 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 pt-16 space-y-32">
        <section id="sanctuary" className="space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted text-[10px] font-bold tracking-[0.4em] uppercase">
                <Globe size={14} />
                Knowledge Sanctuary
              </div>
              <h2 className="text-6xl font-serif italic tracking-tighter text-ink">
                What shall we <br />
                <span className="opacity-40">synthesize today?</span>
              </h2>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted flex items-center gap-2">
                <Mic size={12} className="text-ink" /> All protocols are voice-enabled
              </p>
            </div>
            
            <button 
              onClick={() => onStartSession('explain')}
              className="flex items-center gap-3 px-8 py-4 bg-ink text-canvas rounded-full font-bold tracking-widest uppercase text-xs transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={18} /> New Protocol
            </button>
          </div>

          {/* Aligned Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative overflow-hidden rounded-[2.5rem] cinematic-shadow bg-white cursor-pointer"
                onClick={() => onStartSession(card.id)}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img 
                    src={card.img} 
                    alt={card.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                    <div className={`w-12 h-12 ${card.color} text-ink rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                      <card.icon size={24} />
                    </div>
                    <h3 className="text-3xl font-serif italic mb-3">{card.title}</h3>
                    <p className="text-xs opacity-70 leading-relaxed uppercase tracking-widest line-clamp-2">
                      {card.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Protocols Section */}
        <section id="protocols" className="space-y-12 py-24 border-t border-black/5">
          <div className="space-y-4 text-center">
            <h3 className="text-4xl font-serif italic">Learning Protocols</h3>
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-muted">The architectural pillars of Arivu</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { title: 'Synthesis', desc: 'Break down complex concepts into elegant, simple explanations.', icon: BookOpen, color: 'bg-blue-50' },
              { title: 'Recall', desc: 'Test your retention with dynamic, adaptive questioning.', icon: Zap, color: 'bg-amber-50' },
              { title: 'Narrative', desc: 'Learn through the power of immersive, thematic storytelling.', icon: Sparkles, color: 'bg-purple-50' },
              { title: 'Logic', desc: 'Master the Feynman technique by teaching back to the AI.', icon: History, color: 'bg-emerald-50' },
              { title: 'Wisdom', desc: 'Engage with the Aacharya persona for deep, philosophical guidance.', icon: ScrollText, color: 'bg-rose-50' },
            ].map((p, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="p-12 bg-white rounded-[3rem] border border-black/5 cinematic-shadow space-y-6 transition-all hover:scale-[1.02]"
              >
                <div className={`w-14 h-14 ${p.color} rounded-2xl flex items-center justify-center text-ink`}>
                  <p.icon size={24} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-serif italic">{p.title}</h4>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-8 py-12 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40">
        <p className="text-[10px] font-bold tracking-[0.5em] uppercase">Arivu Wisdom Protocol • v2.0</p>
        <div className="flex gap-8 text-[10px] font-bold tracking-[0.3em] uppercase">
          <a href="#" className="hover:text-ink">Privacy</a>
          <a href="#" className="hover:text-ink">Terms</a>
          <a href="#" className="hover:text-ink">Contact</a>
        </div>
      </footer>
    </div>
  );
}
