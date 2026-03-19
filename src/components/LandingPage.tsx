import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Zap, Globe, BookOpen, ScrollText, History, Cpu, MessageSquare } from 'lucide-react';

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-canvas overflow-x-hidden selection:bg-ink selection:text-canvas">
      {/* Split Hero Section */}
      <section className="min-h-screen flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 py-20 space-y-12 bg-white">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 text-muted text-[10px] font-bold tracking-[0.5em] uppercase">
              <div className="w-6 h-px bg-ink/20" />
              Arivu Protocol v2.0
            </div>
            <h1 className="text-7xl md:text-9xl font-serif italic tracking-tighter leading-[0.85] text-ink">
              Wisdom <br />
              <span className="opacity-30">Synthesized.</span>
            </h1>
            <p className="text-muted text-lg md:text-xl font-light leading-relaxed max-w-md serif italic">
              Transforming raw information into cinematic neural pathways. Experience the future of deep learning.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <button 
              onClick={onGetStarted}
              className="group flex items-center gap-6 px-10 py-5 bg-ink text-canvas rounded-full font-bold tracking-[0.2em] uppercase text-[10px] transition-all hover:scale-105 active:scale-95 cinematic-shadow"
            >
              Initiate Protocol
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </div>

        <div className="flex-1 relative bg-canvas flex items-center justify-center p-8 lg:p-24 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg aspect-[3/4] rounded-[4rem] overflow-hidden cinematic-shadow"
          >
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110"
            >
              <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-ink-flow-in-water-34440-large.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            <div className="absolute bottom-12 left-12 text-white">
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-60 mb-2">Neural Core</p>
              <h3 className="text-2xl font-serif italic">The Library of Alexandria, <br />reimagined.</h3>
            </div>
          </motion.div>
          
          {/* Floating Accents */}
          <motion.div 
            animate={{ 
              y: [0, -30, 0],
              rotate: [0, 45, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 w-24 h-24 border border-ink/5 rounded-full flex items-center justify-center text-ink/20"
          >
            <Sparkles size={24} />
          </motion.div>
        </div>
      </section>

      {/* The Pillars - Clean Grid */}
      <section className="py-40 px-8 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-24">
          {[
            { title: 'Synthesis', icon: BookOpen, desc: 'Breaking down complexity into elegant, cinematic insights.', img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600' },
            { title: 'Recall', icon: Zap, desc: 'Solidifying knowledge through active neural retrieval.', img: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=600' },
            { title: 'Wisdom', icon: ScrollText, desc: 'Connecting data to philosophical and ethical roots.', img: 'https://images.unsplash.com/photo-1526721940322-145d6f95c467?auto=format&fit=crop&q=80&w=600' },
          ].map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="space-y-8 group"
            >
              <div className="relative aspect-square rounded-[3rem] overflow-hidden cinematic-shadow mb-10">
                <img 
                  src={pillar.img} 
                  alt={pillar.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-ink">
                  <pillar.icon size={18} />
                </div>
                <h3 className="text-2xl font-serif italic">{pillar.title}</h3>
              </div>
              <p className="text-muted text-sm leading-relaxed font-light uppercase tracking-widest opacity-60">
                {pillar.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Narrative Section - Minimal Split */}
      <section className="py-40 px-8 lg:px-24 border-t border-black/5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-32">
          <div className="flex-1 space-y-12">
            <h2 className="text-5xl md:text-7xl font-serif italic tracking-tighter leading-tight">
              A Dialogue <br />
              <span className="opacity-30">with Knowledge.</span>
            </h2>
            <div className="space-y-6 text-muted font-light leading-relaxed text-lg">
              <p>Arivu is not a search engine. It is a synthesizer. It engages you in a profound dialogue, challenging your assumptions and building neural bridges between disparate ideas.</p>
              <p>Whether you are mastering quantum physics or exploring ancient philosophy, the protocol adapts to your cognitive rhythm.</p>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="space-y-2">
                <h4 className="text-3xl font-serif italic">98%</h4>
                <p className="text-[8px] font-bold tracking-widest uppercase text-muted">Retention Rate</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-serif italic">5+</h4>
                <p className="text-[8px] font-bold tracking-widest uppercase text-muted">Learning Protocols</p>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            <motion.div
              whileHover={{ rotate: -2 }}
              className="relative z-10 w-full aspect-square rounded-[4rem] overflow-hidden cinematic-shadow"
            >
              <img 
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800" 
                alt="Interface" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-canvas rounded-[3rem] border border-black/5 -z-10" />
          </div>
        </div>
      </section>

      {/* Final CTA - Minimalist */}
      <section className="py-60 px-8 text-center bg-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto space-y-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black/5 rounded-full mb-8">
            <Sparkles size={32} className="text-ink" />
          </div>
          <h2 className="text-6xl md:text-8xl font-serif italic tracking-tighter leading-tight">
            Begin the <br />
            <span className="opacity-30">Synthesis.</span>
          </h2>
          <button 
            onClick={onGetStarted}
            className="px-16 py-8 bg-ink text-canvas rounded-full font-bold tracking-[0.3em] uppercase text-[10px] transition-all hover:scale-105 active:scale-95 cinematic-shadow"
          >
            Enter the Sanctuary
          </button>
        </motion.div>
      </section>

      {/* Simple Footer */}
      <footer className="py-20 px-8 border-t border-black/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-8">
            <h2 className="text-3xl font-serif italic tracking-tighter">Arivu.</h2>
            <div className="h-4 w-px bg-black/10" />
            <p className="text-[8px] font-bold tracking-[0.4em] uppercase text-muted">The Wisdom Protocol v2.0.5</p>
          </div>
          <div className="flex gap-12 text-[9px] font-bold tracking-[0.3em] uppercase text-muted">
            <a href="#" className="hover:text-ink transition-colors">Archive</a>
            <a href="#" className="hover:text-ink transition-colors">Protocols</a>
            <a href="#" className="hover:text-ink transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
