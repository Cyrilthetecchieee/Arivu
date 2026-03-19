import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import Archive from './components/Archive';
import ErrorBoundary from './components/ErrorBoundary';
import { motion, AnimatePresence } from 'motion/react';

type View = 'landing' | 'auth' | 'dashboard' | 'chat' | 'archive';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('landing');
  const [selectedMode, setSelectedMode] = useState<string>('explain');
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
      if (user) {
        if (view === 'landing' || view === 'auth') {
          setView('dashboard');
        }
      } else {
        // If user logs out, go back to landing
        if (view !== 'landing' && view !== 'auth') {
          setView('landing');
        }
      }
    });
    return () => unsubscribe();
  }, [view]);

  const handleStartSession = (mode: string) => {
    if (mode === 'history') {
      setView('archive');
      return;
    }
    setSelectedMode(mode);
    setView('chat');
  };

  if (!isAuthReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-canvas">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-black/5 border-t-black rounded-full"
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="bg-canvas min-h-screen">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <LandingPage onGetStarted={() => setView(user ? 'dashboard' : 'auth')} />
            </motion.div>
          )}

          {view === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Auth onAuthSuccess={() => setView('dashboard')} />
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Dashboard 
                onStartSession={handleStartSession} 
                onViewArchive={() => setView('archive')}
              />
            </motion.div>
          )}

          {view === 'archive' && (
            <motion.div
              key="archive"
              initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 50, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Archive onBack={() => setView('dashboard')} />
            </motion.div>
          )}

          {view === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <ChatInterface 
                mode={selectedMode} 
                onBack={() => setView('dashboard')} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
