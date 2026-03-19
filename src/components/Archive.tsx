import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  History, 
  Calendar, 
  MessageSquare, 
  ChevronRight, 
  Trash2,
  Search,
  BookOpen,
  Zap,
  Sparkles,
  ScrollText,
  Clock
} from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import Markdown from 'react-markdown';

const MODES: Record<string, any> = {
  explain: { name: 'Synthesis', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
  quiz: { name: 'Recall', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
  story: { name: 'Narrative', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-50' },
  feynman: { name: 'Logic', icon: History, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  aacharya: { name: 'Wisdom', icon: ScrollText, color: 'text-rose-500', bg: 'bg-rose-50' },
};

interface Session {
  id: string;
  mode: string;
  language: string;
  messages: { role: 'user' | 'model'; text: string }[];
  timestamp: Timestamp;
}

export default function Archive({ onBack }: { onBack: () => void }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      if (!auth.currentUser) return;
      setIsLoading(true);
      try {
        const q = query(
          collection(db, 'users', auth.currentUser.uid, 'sessions'),
          orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!auth.currentUser || !window.confirm("Are you sure you want to delete this session?")) return;
    
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'sessions', id));
      setSessions(prev => prev.filter(s => s.id !== id));
      if (selectedSession?.id === id) setSelectedSession(null);
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase())) ||
    MODES[s.mode]?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-canvas flex flex-col overflow-hidden">
      {/* Header */}
      <header className="glass px-8 py-6 flex items-center justify-between border-b border-black/5 z-20">
        <div className="flex items-center gap-6">
          <button 
            onClick={selectedSession ? () => setSelectedSession(null) : onBack}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-px bg-black/10" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border border-black/5 rounded-xl flex items-center justify-center text-ink">
              <History size={20} />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-xs font-bold tracking-widest uppercase text-ink">
                {selectedSession ? 'Session Details' : 'Wisdom Archive'}
              </h2>
              <p className="text-[10px] text-muted font-bold tracking-widest uppercase opacity-50">
                {selectedSession ? 'Reviewing Protocol' : 'Past Syntheses'}
              </p>
            </div>
          </div>
        </div>

        {!selectedSession && (
          <div className="relative group hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-ink transition-colors" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Archive..." 
              className="bg-black/5 border border-transparent focus:border-black/10 rounded-full py-3 pl-12 pr-6 outline-none text-xs font-bold tracking-widest uppercase transition-all w-64"
            />
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-8 no-scrollbar">
        <AnimatePresence mode="wait">
          {selectedSession ? (
            <motion.div 
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="flex items-center justify-between border-b border-black/5 pb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${MODES[selectedSession.mode]?.bg} ${MODES[selectedSession.mode]?.color} rounded-2xl flex items-center justify-center`}>
                    {(() => {
                      const Icon = MODES[selectedSession.mode]?.icon || History;
                      return <Icon size={24} />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif italic">{MODES[selectedSession.mode]?.name}</h3>
                    <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase text-muted">
                      <Calendar size={12} />
                      {selectedSession.timestamp?.toDate().toLocaleDateString()}
                      <span className="opacity-20">•</span>
                      <Clock size={12} />
                      {selectedSession.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={(e) => handleDelete(e, selectedSession.id)}
                  className="p-4 text-muted hover:text-red-500 transition-colors bg-white border border-black/5 rounded-2xl"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="space-y-12">
                {selectedSession.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-2xl space-y-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`p-8 rounded-[2rem] cinematic-shadow ${
                        msg.role === 'user' ? 'bg-ink text-canvas rounded-tr-none' : 'bg-white text-ink rounded-tl-none'
                      }`}>
                        <div className="markdown-body prose prose-sm max-w-none">
                          <Markdown>{msg.text}</Markdown>
                        </div>
                      </div>
                      <span className="text-[8px] font-bold tracking-widest uppercase text-muted opacity-40">
                        {msg.role === 'user' ? 'Inquiry' : 'Arivu Synthesis'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto"
            >
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-2 border-black/5 border-t-black rounded-full"
                  />
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <History size={48} strokeWidth={1} />
                  <p className="text-[10px] font-bold tracking-widest uppercase">No wisdom journeys found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSessions.map((session, i) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -5 }}
                      onClick={() => setSelectedSession(session)}
                      className="group relative bg-white rounded-[2rem] p-8 border border-black/5 cinematic-shadow cursor-pointer overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => handleDelete(e, session.id)}
                          className="p-2 text-muted hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="space-y-6">
                        <div className={`w-12 h-12 ${MODES[session.mode]?.bg} ${MODES[session.mode]?.color} rounded-2xl flex items-center justify-center`}>
                          {(() => {
                            const Icon = MODES[session.mode]?.icon || History;
                            return <Icon size={24} />;
                          })()}
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-xl font-serif italic">{MODES[session.mode]?.name}</h4>
                          <p className="text-[10px] font-bold tracking-widest uppercase text-muted line-clamp-2 leading-relaxed">
                            {session.messages[0]?.text}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-black/5">
                          <div className="flex items-center gap-2 text-[8px] font-bold tracking-widest uppercase text-muted">
                            <Calendar size={10} />
                            {session.timestamp?.toDate().toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-[8px] font-bold tracking-widest uppercase text-ink">
                            <MessageSquare size={10} />
                            {session.messages.length} Parts
                            <ChevronRight size={10} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
