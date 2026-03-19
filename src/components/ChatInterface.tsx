import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Sparkles, 
  Cpu, 
  Zap, 
  History, 
  ScrollText, 
  BookOpen,
  Languages,
  ChevronDown,
  PlayCircle
} from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { callArivu } from '../services/geminiService';
import Markdown from 'react-markdown';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

type BotMode = 'explain' | 'quiz' | 'story' | 'feynman' | 'aacharya';
type LanguageCode = 'en' | 'ta' | 'hi' | 'ml' | 'te' | 'kn';

const MODES: Record<string, any> = {
  explain: { name: 'Synthesis', icon: BookOpen, color: 'text-blue-500' },
  quiz: { name: 'Recall', icon: Zap, color: 'text-amber-500' },
  story: { name: 'Narrative', icon: Sparkles, color: 'text-purple-500' },
  feynman: { name: 'Logic', icon: History, color: 'text-emerald-500' },
  aacharya: { name: 'Wisdom', icon: ScrollText, color: 'text-rose-500' },
};

const LANGUAGES: { code: LanguageCode; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'ta', name: 'Tamil' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
];

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function ChatInterface({ mode, onBack }: { mode: string; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      // Cancel any ongoing speech when voices change or component mounts
      window.speechSynthesis.cancel();
      
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        console.log(`Arivu: ${voices.length} voices loaded.`);
      }
    };

    // Chrome and some other browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    loadVoices();
    
    // Fallback: check every second for the first 5 seconds if no voices are found
    let attempts = 0;
    const interval = setInterval(() => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        clearInterval(interval);
      } else if (attempts > 5) {
        clearInterval(interval);
      }
      attempts++;
    }, 1000);

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const handleSend = async (textOverride?: string) => {
    const userMessage = textOverride || input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    const newUserMessage: Message = { role: 'user', text: userMessage };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const reply = await callArivu(userMessage, updatedMessages, currentLang, mode as BotMode);
      const newModelMessage: Message = { role: 'model', text: reply };
      setMessages(prev => [...prev, newModelMessage]);
      
      // Save to Firestore
      if (auth.currentUser) {
        const path = `users/${auth.currentUser.uid}/sessions`;
        if (!sessionId) {
          // Create new session
          try {
            const docRef = await addDoc(collection(db, path), {
              userId: auth.currentUser.uid,
              mode,
              language: currentLang,
              messages: [newUserMessage, newModelMessage],
              timestamp: serverTimestamp()
            });
            setSessionId(docRef.id);
          } catch (e) {
            handleFirestoreError(e, OperationType.CREATE, path);
          }
        } else {
          // Update existing session
          const sessionPath = `${path}/${sessionId}`;
          try {
            await updateDoc(doc(db, sessionPath), {
              messages: arrayUnion(newUserMessage, newModelMessage)
            });
          } catch (e) {
            handleFirestoreError(e, OperationType.UPDATE, sessionPath);
          }
        }
      }

      // Always speak the reply
      speakResponse(reply);
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const speakResponse = (text: string) => {
    if (!text || typeof window === 'undefined') return;
    
    // Reset synthesis state
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume(); // Just in case it was paused
    
    // Clean markdown and symbols for better speech synthesis
    const cleanText = text
      .replace(/[*#_~`\[\]()]/g, '') // Remove markdown symbols
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Remove emojis
      .replace(/\n+/g, '. ') // Replace newlines with pauses
      .replace(/([.!?])\s*/g, '$1   ') // Add extra breathing room after sentences
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance; // Keep reference to prevent GC
    
    // Map language codes to BCP 47
    const langMap: Record<string, string> = {
      en: 'en-US', ta: 'ta-IN', hi: 'hi-IN', ml: 'ml-IN', te: 'te-IN', kn: 'kn-IN'
    };
    const targetLang = langMap[currentLang] || 'en-US';
    utterance.lang = targetLang;

    // Adjust rate and pitch for a more natural, "wise" tone
    utterance.rate = 0.95; 
    utterance.pitch = 1.0; 
    utterance.volume = 1.0;

    // Voice selection logic
    const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
    let selectedVoice = null;

    const findVoice = (lang: string, namePart?: string, isMale?: boolean) => {
      // First try exact language match
      let filtered = voices.filter(v => v.lang.toLowerCase().startsWith(lang.toLowerCase()));
      
      // If no exact match, try just the language code (e.g. 'ta' matches 'ta-IN')
      if (filtered.length === 0) {
        filtered = voices.filter(v => v.lang.toLowerCase().includes(lang.toLowerCase()));
      }

      if (namePart) {
        const withName = filtered.find(v => v.name.toLowerCase().includes(namePart.toLowerCase()));
        if (withName) return withName;
      }

      if (isMale !== undefined) {
        const maleKeywords = ['male', 'boy', 'david', 'valluvar', 'hemant', 'google us english', 'daniel', 'microsoft'];
        const withGender = filtered.find(v => {
          const nameLower = v.name.toLowerCase();
          const isMaleName = maleKeywords.some(k => nameLower.includes(k));
          return isMale ? isMaleName : !isMaleName;
        });
        if (withGender) return withGender;
      }

      return filtered[0] || null;
    };

    if (currentLang === 'en') {
      selectedVoice = findVoice('en', 'Google US English') || 
                     findVoice('en', 'Samantha') || 
                     findVoice('en', 'Daniel') ||
                     findVoice('en', 'Premium') ||
                     findVoice('en', 'Microsoft');
    } else if (currentLang === 'ta') {
      selectedVoice = findVoice('ta', 'Valluvar', true) ||
                     findVoice('ta', 'Male', true) ||
                     findVoice('ta', 'Boy', true) ||
                     findVoice('ta', 'Tamil') ||
                     findVoice('ta');
    } else if (currentLang === 'hi') {
      selectedVoice = findVoice('hi', 'Hemant', true) ||
                     findVoice('hi', 'Male', true) ||
                     findVoice('hi', 'Hindi') ||
                     findVoice('hi');
    } else {
      const langNameMap: Record<string, string> = {
        ml: 'Malayalam', te: 'Telugu', kn: 'Kannada'
      };
      selectedVoice = findVoice(currentLang, langNameMap[currentLang]) ||
                     findVoice(currentLang);
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
      if (isHandsFree) {
        setTimeout(() => startListening(), 500);
      }
    };
    
    utterance.onerror = (event) => {
      console.error("Speech Synthesis Error:", event);
      setIsSpeaking(false);
      utteranceRef.current = null;
      // If it failed, try one more time without a specific voice
      if (selectedVoice) {
        console.log("Retrying without specific voice...");
        const fallbackUtterance = new SpeechSynthesisUtterance(cleanText);
        fallbackUtterance.lang = targetLang;
        fallbackUtterance.onstart = () => setIsSpeaking(true);
        fallbackUtterance.onend = () => {
          setIsSpeaking(false);
          if (isHandsFree) startListening();
        };
        window.speechSynthesis.speak(fallbackUtterance);
      } else if (isHandsFree) {
        startListening();
      }
    };

    // Use a small timeout to ensure cancel() has finished
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 150);
  };

  const toggleSpeech = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    speakResponse(text);
  };

  const startListening = () => {
    if (isListening) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    const langMap: Record<string, string> = {
      en: 'en-US', ta: 'ta-IN', hi: 'hi-IN', ml: 'ml-IN', te: 'te-IN', kn: 'kn-IN'
    };
    recognition.lang = langMap[currentLang] || 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (isHandsFree) {
        handleSend(transcript);
      } else {
        setInput(transcript);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="h-screen flex flex-col bg-canvas overflow-hidden">
      {/* Cinematic Header */}
      <header className="glass px-8 py-6 flex items-center justify-between border-b border-black/5 z-20">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-px bg-black/10" />
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-white border border-black/5 rounded-xl flex items-center justify-center ${MODES[mode]?.color}`}>
              {(() => {
                const Icon = MODES[mode]?.icon || Cpu;
                return <Icon size={20} />;
              })()}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`w-1 h-1 rounded-full ${availableVoices.length > 0 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-muted">
                  {availableVoices.length > 0 ? 'Neural Link Active' : 'Syncing Voices...'}
                </span>
              </div>
              <h2 className="text-xs font-bold tracking-widest uppercase text-ink">{MODES[mode]?.name || 'PROTOCOL'}</h2>
              <p className="text-[10px] text-muted font-bold tracking-widest uppercase opacity-50">Active Synthesis</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Hands-Free Toggle */}
          <button 
            onClick={() => {
              setIsHandsFree(!isHandsFree);
              if (!isHandsFree) startListening();
              else window.speechSynthesis.cancel();
            }}
            className={`flex items-center gap-3 px-6 py-3 rounded-full text-[10px] font-bold tracking-[0.3em] uppercase transition-all ${
              isHandsFree ? 'bg-ink text-canvas cinematic-shadow scale-105' : 'bg-white border border-black/5 text-muted hover:border-black/20'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isHandsFree ? 'bg-red-500 animate-pulse' : 'bg-black/20'}`} />
            {isHandsFree ? 'Protocol: Voice Mode' : 'Enable Voice Mode'}
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-full text-[10px] font-bold tracking-widest uppercase hover:border-black/20 transition-all"
            >
              <Languages size={14} />
              {LANGUAGES.find(l => l.code === currentLang)?.name}
              <ChevronDown size={12} />
            </button>
            
            <AnimatePresence>
              {showLangMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 right-0 w-40 bg-white border border-black/5 rounded-2xl shadow-xl p-2 z-50"
                >
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLang(lang.code);
                        setShowLangMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase hover:bg-black/5 transition-colors"
                    >
                      {lang.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 py-12 space-y-12 no-scrollbar"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-40">
            <div className="w-24 h-24 border border-black/10 rounded-full flex items-center justify-center animate-float">
              {(() => {
                const Icon = MODES[mode]?.icon || Sparkles;
                return <Icon size={32} strokeWidth={1} />;
              })()}
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-serif italic">Initiate Synthesis</h3>
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase">The protocol is ready for your inquiry</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-2xl space-y-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-10 rounded-[3rem] cinematic-shadow transition-all ${
                msg.role === 'user' 
                  ? 'bg-ink text-canvas rounded-tr-none' 
                  : 'bg-white text-ink rounded-tl-none border border-black/5'
              }`}>
                <div className="markdown-body prose prose-sm max-w-none leading-relaxed">
                  <Markdown>{msg.text}</Markdown>
                </div>
              </div>
              
              {msg.role === 'model' && (
                <div className="flex items-center gap-6 px-6">
                  <button 
                    onClick={() => toggleSpeech(msg.text)}
                    className={`p-3 rounded-full transition-all ${isSpeaking ? 'bg-ink text-canvas scale-110' : 'hover:bg-black/5 text-muted'}`}
                  >
                    {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-ink/20 rounded-full" />
                    <span className="text-[8px] font-bold tracking-[0.4em] uppercase text-muted opacity-40">Arivu Synthesis Protocol</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-8 rounded-[2rem] rounded-tl-none cinematic-shadow flex gap-2">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-ink rounded-full" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-ink rounded-full" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-ink rounded-full" />
            </div>
          </div>
        )}
      </main>

      {/* Control Deck */}
      <footer className="p-8 z-20">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-black/5 cinematic-shadow" />
          <div className="relative p-3 flex items-center gap-3">
            <button 
              onClick={isListening ? () => {} : startListening}
              className={`p-4 rounded-2xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-black/5 text-muted hover:bg-black/10'}`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Inquire the Protocol..."
              className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-medium placeholder:text-muted/40"
            />
            
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-4 bg-ink text-canvas rounded-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-[8px] font-bold tracking-[0.5em] uppercase text-muted opacity-30">Neural Synthesis Active • Arivu v2.0</p>
        </div>
      </footer>
    </div>
  );
}
