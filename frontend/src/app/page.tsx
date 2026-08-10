"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Upload, Sparkles, Zap, Target, Database, Activity, BarChart3, Cpu, Menu, X, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { AuthModal } from "@/components/auth/AuthModal";

// Apple-flavored motion tokens (emil-kowalski / apple-design skill)
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const SPRING_MENU = { type: "spring" as const, duration: 0.45, bounce: 0.1 };
const SPRING_CARD = { type: "spring" as const, duration: 0.4, bounce: 0 };

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close the mobile menu on Escape
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMobileMenuOpen]);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  // Entrance variants — fade only for reduced-motion users (Apple: gentler equivalent)
  const enter = (delay: number, y = 18) => ({
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.55, ease: EASE_OUT, delay },
  });

  return (
    <main className={`relative min-h-screen overflow-x-hidden selection:bg-emerald-500/30 ${isDark ? 'dark' : 'light'}`}>
      {/* ── QUIET BACKGROUND — one layer, no noise ── */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
        <div className={`absolute inset-0 transition-colors duration-500 ${isDark ? 'bg-[#050505]' : 'bg-[#fafafa]'}`} />
        {/* Subtle brand grid (radially masked, matches the dashboard) */}
        <div className="absolute inset-0 bg-grid opacity-[0.12] dark:opacity-[0.10]" />
        {/* Two soft, static glow blooms — no animation */}
        <div className="absolute -top-[25%] right-[-10%] w-[70%] aspect-square rounded-full bg-emerald-500/[0.07] blur-[120px]" />
        <div className="absolute bottom-[-25%] left-[-8%] w-[55%] aspect-square rounded-full bg-indigo-500/[0.06] blur-[120px]" />
      </div>

      {/* ── TRANSLUCENT NAV (Apple material) ── */}
      <header className="sticky top-0 z-[100]">
        <nav className={`h-16 px-6 md:px-10 flex items-center justify-between border-b backdrop-blur-2xl backdrop-saturate-150 ${
          isDark ? 'border-white/[0.06] bg-[#050505]/55' : 'border-slate-900/[0.06] bg-white/60'
        }`}>
          <a href="#" className="flex items-center gap-3 group" aria-label="SENTINEL home">
            <div className="w-2.5 h-6 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] group-hover:scale-y-125 transition-transform duration-500" />
            <span className={`text-xl font-black tracking-tighter uppercase italic ${isDark ? 'text-white' : 'text-slate-900'}`}>SENTINEL</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className={`text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${isDark ? 'text-white/50 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>Features</a>
            <a href="#stack" className={`text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${isDark ? 'text-white/50 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>The Stack</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" className={`text-xs font-bold ${isDark ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`} onClick={() => setIsAuthOpen(true)}>LOGIN</Button>
            <Button variant="primary" className="text-xs font-bold px-5 py-2.5 rounded-full" onClick={() => setIsAuthOpen(true)}>GET STARTED</Button>
          </div>

          <button className={`md:hidden ${isDark ? 'text-white' : 'text-slate-900'}`} onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>
        </nav>
      </header>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={SPRING_MENU}
              className={`fixed top-0 right-0 z-[120] h-full w-[82%] max-w-[320px] border-l p-8 flex flex-col md:hidden ${
                isDark ? 'bg-[#0a0a0b] border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className={`flex justify-between items-center mb-12 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span className="text-lg font-black italic tracking-widest">SENTINEL</span>
                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu"><X className="w-6 h-6" /></button>
              </div>
              <div className="flex flex-col gap-6">
                <ThemeToggle />
                <Button variant="outline" className={`justify-center ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-200 text-slate-900 hover:bg-slate-100'}`} onClick={() => setIsAuthOpen(true)}>LOG IN</Button>
                <Button variant="primary" className="justify-center" onClick={() => setIsAuthOpen(true)}>JOIN NOW</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full px-6 md:px-12 max-w-[1400px] mx-auto pt-14 md:pt-24">
        {/* ── HERO ── */}
        <section className="grid lg:grid-cols-[1.05fr_0.95fr] gap-16 lg:gap-20 items-center min-h-[80vh] pb-20 md:pb-32">
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full self-start"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-bold tracking-[0.22em] text-emerald-600 dark:text-emerald-400 uppercase">KNUST Academic Intelligence</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.05 }}
              className={`text-[clamp(3.25rem,9vw,7rem)] font-black leading-[0.9] tracking-[-0.03em] uppercase italic ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              Master<br />Every<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-400">Exam.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.14 }}
              className={`text-base md:text-lg max-w-xl leading-relaxed font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}
            >
              Sentinel uses semantic AI to bridge the gap between past papers and future success. Stop hoping for luck; start studying with <span className="text-emerald-500 font-bold">certainty</span>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.22 }}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <Button variant="primary" className="px-10 py-5 text-base font-bold rounded-full" onClick={() => setIsAuthOpen(true)}>
                Start Scanning
              </Button>
              <Button variant="outline" className={`px-10 py-5 text-base font-bold rounded-full group ${
                isDark
                  ? 'border-white/15 text-white hover:bg-white/5 hover:border-white/25'
                  : 'border-slate-300 text-slate-900 hover:bg-slate-100 hover:border-slate-400'
              }`}>
                Watch Demo <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.32 }}
              className={`flex gap-12 pt-8 border-t ${isDark ? 'border-white/[0.07]' : 'border-slate-200'}`}
            >
              <div>
                <div className={`text-2xl md:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>46.2K</div>
                <div className={`text-[10px] font-bold uppercase tracking-[0.18em] mt-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Files Indexed</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black tracking-tight text-emerald-500">98.4%</div>
                <div className={`text-[10px] font-bold uppercase tracking-[0.18em] mt-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Pattern Sync</div>
              </div>
            </motion.div>
          </div>

          {/* Analysis Preview — floating glass panel */}
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.25 }}
            className="hidden lg:block"
          >
            <div className={`rounded-3xl border backdrop-blur-2xl p-7 flex flex-col gap-6 shadow-2xl ${
              isDark
                ? 'bg-white/[0.03] border-white/[0.07] shadow-black/40'
                : 'bg-white/70 border-slate-900/[0.06] shadow-slate-900/10'
            }`}>
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Analysis Preview</div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-medium text-[var(--text-muted)]">Ready</span>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-[var(--text-muted)]">Topic Coverage</span>
                    <span className="text-emerald-500 font-bold">87%</span>
                  </div>
                  <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div className="h-full w-[87%] bg-emerald-500 rounded-full" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-[var(--text-muted)]">Bloom's Distribution</span>
                    <span className="text-[var(--text-muted)]">Analyzed</span>
                  </div>
                  <div className="flex gap-1 h-6">
                    <div className={`flex-1 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} title="Remember" />
                    <div className={`flex-1 rounded ${isDark ? 'bg-white/15' : 'bg-slate-300'}`} title="Understand" />
                    <div className="flex-[2] bg-emerald-500/70 rounded" title="Apply" />
                    <div className="flex-1 bg-emerald-500/45 rounded" title="Analyze" />
                    <div className="flex-1 bg-emerald-400/25 rounded" title="Evaluate" />
                  </div>
                </div>

                <div className={`pt-5 border-t ${isDark ? 'border-white/[0.07]' : 'border-slate-200'}`}>
                  <div className="text-[11px] font-medium text-[var(--text-muted)] mb-3">Recent Analysis</div>
                  <div className="space-y-2.5 text-[10px] font-medium">
                    {[
                      ["EE321 — Circuit Analysis", "12 questions"],
                      ["ME201 — Thermodynamics", "8 questions"],
                      ["CS215 — Data Structures", "15 questions"],
                    ].map(([name, count]) => (
                      <div key={name} className="flex justify-between">
                        <span className="text-[var(--text-muted)]">{name}</span>
                        <span className="text-emerald-500/80">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`flex justify-between text-[10px] font-medium text-[var(--text-muted)] pt-5 border-t ${isDark ? 'border-white/[0.07]' : 'border-slate-200'}`}>
                <span>3 papers processed</span>
                <span>2024</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── FEATURES BENTO ── */}
        <section id="features" className="py-20 md:py-36 mb-8 md:mb-20">
          <motion.div {...enter(0)} className="text-center mb-16 md:mb-24 max-w-3xl mx-auto">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500 mb-5">Capabilities</div>
            <h2 className={`text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-[0.95] ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Smarter, Faster, <span className="text-emerald-500">Stronger.</span>
            </h2>
            <p className={`text-base md:text-lg font-medium mt-6 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
              The most advanced exam intelligence suite ever built for students.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
            {/* Unified Engine — large */}
            <motion.div {...enter(0.02)} whileHover={prefersReducedMotion ? undefined : { y: -6, transition: SPRING_CARD }} className="md:col-span-8">
              <div className={`rounded-3xl h-full p-8 md:p-12 flex flex-col justify-end overflow-hidden border backdrop-blur-xl transition-colors duration-300 ${
                isDark
                  ? 'bg-white/[0.03] border-emerald-500/15 hover:bg-white/[0.05]'
                  : 'bg-white/70 border-emerald-200/60 hover:bg-white/90'
              }`}>
                <div className="max-w-md space-y-5">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className={`text-2xl md:text-3xl font-black uppercase italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Unified Engine</h3>
                  <p className={`font-medium text-base leading-relaxed ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Drag and drop any file format. Our engine extracts text, formulas, and diagrams with OCR precision.</p>
                </div>
              </div>
            </motion.div>

            {/* AI Pulse — small */}
            <motion.div {...enter(0.08)} whileHover={prefersReducedMotion ? undefined : { y: -6, transition: SPRING_CARD }} className="md:col-span-4">
              <div className={`rounded-3xl h-full p-8 flex flex-col justify-between border backdrop-blur-xl transition-colors duration-300 ${
                isDark ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]' : 'bg-white/70 border-slate-900/[0.07] hover:bg-white/90'
              }`}>
                <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="space-y-4">
                  <h3 className={`text-xl md:text-2xl font-black uppercase italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Pulse</h3>
                  <p className={`font-medium leading-relaxed text-sm ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Instant pattern recognition across 10 years of data.</p>
                </div>
              </div>
            </motion.div>

            {/* Focus Point — small */}
            <motion.div {...enter(0.14)} whileHover={prefersReducedMotion ? undefined : { y: -6, transition: SPRING_CARD }} className="md:col-span-4">
              <div className={`rounded-3xl h-full p-8 flex flex-col justify-between border backdrop-blur-xl transition-colors duration-300 ${
                isDark ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]' : 'bg-white/70 border-slate-900/[0.07] hover:bg-white/90'
              }`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white text-[#050505]' : 'bg-slate-900 text-white'}`}>
                  <Target className="w-6 h-6" />
                </div>
                <div className="space-y-4">
                  <h3 className={`text-xl md:text-2xl font-black uppercase italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Focus Point</h3>
                  <p className={`font-medium leading-relaxed text-sm ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Ranked topics by probability of appearance.</p>
                </div>
              </div>
            </motion.div>

            {/* Predictive Analytics — large */}
            <motion.div {...enter(0.2)} whileHover={prefersReducedMotion ? undefined : { y: -6, transition: SPRING_CARD }} className="md:col-span-8">
              <div className={`rounded-3xl h-full p-8 md:p-12 grid md:grid-cols-2 items-center gap-8 border backdrop-blur-xl transition-colors duration-300 ${
                isDark ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]' : 'bg-white/70 border-slate-900/[0.07] hover:bg-white/90'
              }`}>
                <div className="space-y-6">
                  <h3 className={`text-2xl md:text-3xl font-black uppercase italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Predictive Analytics</h3>
                  <p className={`font-medium text-base leading-relaxed ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Visualizing the academic roadmap. See exactly what you're up against.</p>
                  <Button variant="outline" className={`w-fit rounded-full px-6 py-2 ${isDark ? 'border-white/15 text-white hover:bg-white/5' : 'border-slate-300 text-slate-900 hover:bg-slate-100'}`}>View Model Details</Button>
                </div>
                <div className="space-y-4">
                  {[60, 85, 45, 95].map((w, i) => (
                    <div key={i} className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${w}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: EASE_OUT, delay: i * 0.08 }}
                        className={`h-full rounded-full ${i === 3 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : isDark ? 'bg-white/20' : 'bg-slate-400/30'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── TECHNICAL STACK ── */}
        <section id="stack" className={`py-20 md:py-36 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="lg:col-span-1">
              <motion.div {...enter(0)}>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500 mb-5">Under the hood</div>
                <h2 className={`text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-[0.95] mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>The Stack<br /><span className="text-emerald-500">Behind It.</span></h2>
                <p className={`text-base font-medium leading-relaxed ${isDark ? 'text-white/40' : 'text-slate-500'}`}>SENTINEL isn't just a UI — it's a massive distributed vector engine designed to scale with your academic career.</p>
              </motion.div>
            </div>

            <div className="lg:col-span-2 grid md:grid-cols-2 gap-5 md:gap-6">
              {[
                { title: "Vector ChromaDB", desc: "Our database handles millions of semantic document chunks with near-zero latency retrieval.", icon: Database },
                { title: "Weight Decay v2", desc: "Algorithm that prioritizes recent exam trends to ensure you don't study legacy material.", icon: Activity },
                { title: "Bloom Metric", desc: "AI-extracted difficulty categorization based on Bloom's Taxonomy of academic standards.", icon: BarChart3 },
                { title: "Neural OCR", desc: "Handwritten and messy PDF support with high-fidelity character recognition.", icon: Cpu },
              ].map((tech, i) => (
                <motion.div
                  key={tech.title}
                  {...enter(0.05 + i * 0.06)}
                  whileHover={prefersReducedMotion ? undefined : { y: -4, transition: SPRING_CARD }}
                  className={`p-7 md:p-8 rounded-2xl border backdrop-blur-xl transition-colors duration-300 ${
                    isDark
                      ? 'bg-white/[0.02] border-white/[0.06] hover:bg-emerald-500/[0.04] hover:border-emerald-500/25'
                      : 'bg-white/60 border-slate-900/[0.06] hover:bg-emerald-50/80 hover:border-emerald-300'
                  }`}
                >
                  <div className="w-11 h-11 text-emerald-500 mb-5 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <tech.icon className="w-5 h-5" />
                  </div>
                  <h3 className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{tech.title}</h3>
                  <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{tech.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className={`w-full pt-16 md:pt-28 pb-12 md:pb-20 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="grid md:grid-cols-4 gap-12 md:gap-16 mb-16">
            <div className="col-span-1 space-y-5">
              <span className={`text-xl font-black tracking-tight uppercase italic ${isDark ? 'text-white' : 'text-slate-900'}`}>SENTINEL.</span>
              <p className={`font-medium leading-relaxed text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                Precision examination tools for the future of engineering. Built for KNUST Students by the SENTINEL Network.
              </p>
            </div>

            <div className="col-span-3 grid grid-cols-2 md:grid-cols-4 gap-10">
              {[
                { title: "Engine", links: ["Scanning", "VectorDB", "API"] },
                { title: "Library", links: ["COE Portal", "Syllabus", "Archive"] },
                { title: "Network", links: ["Community", "Growth", "Labs"] },
                { title: "Status", links: ["Live", "Cloud", "Uptime"] },
              ].map((sec) => (
                <div key={sec.title} className="space-y-4">
                  <span className={`text-[10px] font-black tracking-[0.28em] uppercase ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{sec.title}</span>
                  <ul className="space-y-2.5">
                    {sec.links.map((l) => (
                      <li key={l}>
                        <a href="#" className={`text-sm font-medium transition-colors ${isDark ? 'text-white/50 hover:text-emerald-400' : 'text-slate-500 hover:text-emerald-600'}`}>{l}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className={`pt-10 flex flex-col md:flex-row items-center justify-between gap-8 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <div className="flex flex-col gap-1.5 text-center md:text-left">
              <span className={`text-[9px] font-black tracking-[0.28em] uppercase ${isDark ? 'text-white/40' : 'text-slate-400'}`}>© 2024 SENTINEL ACADEMIC NETWORK.</span>
              <span className="text-[10px] font-black text-emerald-500 tracking-[0.2em] uppercase">Developers: A. Charles & A. Godbless</span>
            </div>
            <div className={`flex items-center gap-3 px-6 py-3 rounded-full border backdrop-blur-xl transition-transform hover:scale-105 ${
              isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white/70 border-slate-900/[0.08]'
            }`}>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              />
              <span className={`text-[10px] font-bold tracking-[0.28em] uppercase ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Neural Hub Online</span>
            </div>
          </div>
        </footer>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </main>
  );
}
