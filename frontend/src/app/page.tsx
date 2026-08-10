"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView, animate } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Upload, Sparkles, Zap, Target, Database, Activity, BarChart3, Cpu, Menu, X, ArrowRight,
  BrainCircuit, FileText, Check, CheckCircle2, FileImage
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuthModal } from "@/components/auth/AuthModal";
import ShaderBackground from "@/components/landing/ShaderBackground";
import { ThemeToggle } from "@/components/landing/ThemeToggle";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const SPRING_MENU = { type: "spring" as const, duration: 0.45, bounce: 0.1 };
const SPRING_CARD = { type: "spring" as const, duration: 0.4, bounce: 0 };

const COURSES = ["EE321", "ME201", "CS215", "MA301", "CE271", "EE357", "PH183", "COE255", "CE355", "EE301", "CS351", "ME355"];

/* ── Animated stat counter (counts up when scrolled into view) ── */
function CountUp({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const prefersReducedMotion = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion) { setVal(to); return; }
    const controls = animate(0, to, {
      duration: 1.6,
      ease: EASE_OUT,
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to, prefersReducedMotion]);

  return (
    <span ref={ref}>
      {val.toFixed(decimals)}{suffix}
    </span>
  );
}

/* ── The hero product mock: radar scan → extract → study plan ── */
const BLOOM_TAGS: { q: string; tag: string; topic: string }[] = [
  { q: "Q.12", tag: "L4 · ANALYZE", topic: "Cache Coherence" },
  { q: "Q.07", tag: "L3 · APPLY", topic: "Pipelining" },
  { q: "Q.03", tag: "L2 · UNDERSTAND", topic: "Interrupts" },
];

function HeroScan({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0); // 0 scan, 1 extract, 2 plan

  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase(2);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const loop = () => {
      setPhase(0);
      timers.push(setTimeout(() => setPhase(1), 2400));
      timers.push(setTimeout(() => setPhase(2), 4200));
      timers.push(setTimeout(loop, 7000));
    };
    loop();
    return () => timers.forEach(clearTimeout);
  }, [prefersReducedMotion]);

  return (
    <div className="relative">
      <div className="rounded-3xl border backdrop-blur-2xl p-7 shadow-2xl overflow-hidden bg-white/70 dark:bg-[#0a0a0b]/50 border-slate-900/[0.07] dark:border-white/[0.07] shadow-slate-900/10 dark:shadow-black/40">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Sentinel Scan</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.span
              animate={prefersReducedMotion ? undefined : { opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-emerald-500"
            />
            <span className="text-[10px] font-medium text-[var(--text-muted)]">LIVE</span>
          </div>
        </div>

        {/* Radar visual */}
        <div className="relative w-52 h-52 md:w-60 md:h-60 mx-auto">
          {[100, 74, 48, 22].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-emerald-500/20"
              style={{ inset: `${(100 - size) / 2}%` }}
            />
          ))}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: "conic-gradient(from 0deg, rgba(16,185,129,0.35) 0deg, rgba(16,185,129,0.08) 45deg, transparent 60deg)" }}
            animate={prefersReducedMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 2.4, ease: "linear", repeat: Infinity }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_16px_4px_rgba(16,185,129,0.5)]"
            animate={prefersReducedMotion ? undefined : { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
          {!prefersReducedMotion && (
            <>
              <motion.div
                className="absolute w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-emerald-300"
                animate={{ left: ["50%", "82%", "30%"], top: ["50%", "26%", "66%"] }}
                transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 6px rgba(16,185,129,0.9))" }}
              />
              <motion.div
                className="absolute w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-indigo-300"
                animate={{ left: ["50%", "24%", "72%"], top: ["50%", "64%", "22%"] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                style={{ filter: "drop-shadow(0 0 6px rgba(99,102,241,0.9))" }}
              />
            </>
          )}
        </div>

        {/* Status line */}
        <div className="flex items-center justify-center gap-2 mt-5 h-4">
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500"
            >
              {phase === 0 ? "Scanning EE321 · 2019.pdf" : phase === 1 ? "Extracting questions…" : "Study plan ready"}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Extracted chips overlay */}
        <div className="relative h-24 mt-4">
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                key="chips"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="absolute inset-x-0 top-0 flex flex-col gap-2"
              >
                {BLOOM_TAGS.map((c, i) => (
                  <motion.div
                    key={c.q}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, ease: EASE_OUT, delay: 0.08 + i * 0.09 }}
                    className="flex items-center gap-3 px-3.5 py-2 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.06]"
                  >
                    <span className="text-[10px] font-black text-emerald-500 font-mono">{c.q}</span>
                    <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{c.topic}</span>
                    <span className="ml-auto text-[8px] font-black uppercase tracking-widest text-indigo-400/90 border border-indigo-400/20 bg-indigo-400/10 px-1.5 py-0.5 rounded">
                      {c.tag}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Study plan overlay — slides up over the whole card */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.98 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              className="absolute inset-x-3 bottom-3 rounded-2xl border border-emerald-500/20 bg-[var(--card-bg)]/95 backdrop-blur-2xl p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-500">Study Plan Ready</span>
                </div>
                <div className="flex gap-1.5">
                  {[FileImage, FileText, Check].map((Icon, i) => (
                    <span key={i} className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/10 flex items-center justify-center">
                      <Icon className="w-3 h-3 text-[var(--text-muted)]" />
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { topic: "Pipelining", pct: 87, hot: true },
                  { topic: "Memory Hierarchy", pct: 61, hot: false },
                  { topic: "Concurrency", pct: 44, hot: false },
                ].map((row, i) => (
                  <motion.div
                    key={row.topic}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, ease: EASE_OUT, delay: 0.15 + i * 0.1 }}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-[11px] font-semibold text-[var(--text-muted)]">{row.topic}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="h-1 flex-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.hot ? "bg-emerald-500" : "bg-emerald-500/40"}`}
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-black font-mono ${row.hot ? "text-emerald-500" : "text-[var(--text-muted)]"}`}>{row.pct}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating accent chips behind the card */}
      <div className="absolute -top-5 -left-4 -z-10 w-40 h-40 bg-emerald-500/20 blur-[80px] rounded-full" />
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const enter = (delay: number, y = 18) => ({
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.55, ease: EASE_OUT, delay },
  });

  return (
    <main className={`relative min-h-screen overflow-x-hidden selection:bg-emerald-500/30 ${isDark ? 'dark' : 'light'}`}>
      {/* ── BACKGROUND — mint water-plane shader (one palette, both modes) + legibility scrims ── */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
        <div className={`absolute inset-0 transition-colors duration-500 ${isDark ? 'bg-[#050505]' : 'bg-[#fafafa]'}`} />
        <ShaderBackground isDark={isDark} />
        <div className="absolute inset-0 bg-grid opacity-[0.05] dark:opacity-[0.07]" />
        {/* top scrim — nav + headline stay on solid page color */}
        <div className={`absolute inset-x-0 top-0 h-[48vh] bg-gradient-to-b ${isDark ? 'from-[#050505] via-[#050505]/55 to-transparent' : 'from-[#fafafa] via-[#fafafa]/55 to-transparent'}`} />
        {/* left scrim — hero text column stays crisp in light mode */}
        <div className={`absolute left-0 top-0 h-[72vh] w-[52%] bg-gradient-to-r ${isDark ? 'from-[#050505]/80 via-[#050505]/35 to-transparent' : 'from-[#fafafa]/75 via-[#fafafa]/30 to-transparent'}`} />
        {/* bottom scrim — footer text stays readable */}
        <div className={`absolute inset-x-0 bottom-0 h-[22vh] bg-gradient-to-t ${isDark ? 'from-[#050505] to-transparent' : 'from-[#fafafa] to-transparent'}`} />
      </div>

      {/* ── TRANSLUCENT NAV ── */}
      <header className="sticky top-0 z-[100]">
        <nav className={`h-16 px-6 md:px-10 flex items-center justify-between border-b backdrop-blur-2xl backdrop-saturate-150 ${
          isDark ? 'border-white/[0.06] bg-[#050505]/55' : 'border-slate-900/[0.06] bg-white/60'
        }`}>            <a href="#" className="flex items-center gap-3 group" aria-label="SENTINEL home">
            <div className="w-2.5 h-6 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] group-hover:scale-y-125 transition-transform duration-500" />
            <span className={`font-display text-xl font-bold tracking-tighter uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>SENTINEL</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className={`text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${isDark ? 'text-white/50 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>Features</a>
            <a href="#how" className={`text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${isDark ? 'text-white/50 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>How It Works</a>
            <a href="#stack" className={`text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${isDark ? 'text-white/50 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>The Stack</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" className={`text-xs font-bold ${isDark ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`} onClick={() => setIsAuthOpen(true)}>LOGIN</Button>
            <Button variant="primary" className="text-xs font-bold px-4 py-2 rounded-lg" onClick={() => setIsAuthOpen(true)}>GET STARTED</Button>
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
                <span className="font-display text-lg font-bold tracking-tight uppercase">SENTINEL</span>
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

      <div className="relative z-10 w-full px-6 md:px-12 max-w-[1400px] mx-auto pt-14 md:pt-20">
        {/* ── HERO ── */}
        <section className="grid lg:grid-cols-[1.05fr_0.95fr] gap-16 lg:gap-20 items-center min-h-[85vh] pb-16 md:pb-24">
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
              className={`font-display text-[clamp(2.75rem,9vw,7rem)] font-bold leading-[0.9] tracking-[-0.035em] uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              Master<br />Every<br />
              <span className="font-serif-accent italic font-normal lowercase text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-400">Exam.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.14 }}
              className={`text-base md:text-lg max-w-xl leading-relaxed font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}
            >
              Upload your past papers. SENTINEL scans every question, classifies it by Bloom's Taxonomy, and builds a ranked study plan — high-yield topics, mock strategy, ready to export.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.22 }}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <Button variant="primary" className="px-6 sm:px-10 py-3 sm:py-5 text-sm sm:text-base font-bold tracking-normal rounded-xl" onClick={() => setIsAuthOpen(true)}>
                Start Scanning — Free
              </Button>
              <Button variant="outline" onClick={() => {
                document.getElementById('how')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
              }} className={`px-6 sm:px-10 py-3 sm:py-5 text-sm sm:text-base font-bold tracking-normal rounded-xl group ${
                isDark
                  ? 'border-white/15 text-white hover:bg-white/5 hover:border-white/25'
                  : 'border-slate-300 text-slate-900 hover:bg-slate-100 hover:border-slate-400'
              }`}>
                See How It Works <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.32 }}
              className={`flex gap-12 pt-8 border-t ${isDark ? 'border-white/[0.07]' : 'border-slate-200'}`}
            >
              <div>
                <div className={`font-display text-2xl md:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <CountUp to={46.2} decimals={1} suffix="K" />
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-[0.18em] mt-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Files Indexed</div>
              </div>
              <div>
                <div className="font-display text-2xl md:text-3xl font-bold tracking-tight text-emerald-500">
                  <CountUp to={98.4} decimals={1} suffix="%" />
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-[0.18em] mt-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Pattern Sync</div>
              </div>
            </motion.div>
          </div>

          {/* Animated product mock */}
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.25 }}
            className="hidden lg:block relative"
          >
            <HeroScan prefersReducedMotion={prefersReducedMotion} />
          </motion.div>
        </section>

        {/* ── COURSE MARQUEE ── */}
        <motion.div {...enter(0, 12)} className="mb-16 md:mb-24">
          <div className="overflow-hidden py-6 border-y border-[var(--foreground)]/[0.06] [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
            <div className="flex w-max animate-marquee">
              {/* Two identical halves (each with a trailing gap) so the -50% loop is seamless */}
              {[0, 1].map((half) => (
                <div key={half} className="flex gap-12 pr-12 whitespace-nowrap">
                  {COURSES.map((c) => (
                    <span key={`${c}-${half}`} className={`text-sm font-black tracking-[0.3em] ${isDark ? 'text-white/[0.16]' : 'text-slate-900/[0.14]'}`}>{c}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="py-16 md:py-28 mb-8 md:mb-16">
          <motion.div {...enter(0)} className="text-center mb-16 max-w-3xl mx-auto">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500 mb-5">Three steps</div>
            <h2 className={`font-display text-3xl md:text-6xl font-bold uppercase tracking-tighter leading-[0.95] ${isDark ? 'text-white' : 'text-slate-900'}`}>
              From PDF to <span className="font-serif-accent italic font-normal text-emerald-500 lowercase">plan.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
            {/* connecting line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" aria-hidden />
            {[
              {
                icon: Upload,
                step: "01",
                title: "Upload past papers",
                desc: "Drop in any PDF, scan, or photo. OCR pulls out every question, formula, and diagram — messy handwriting included.",
              },
              {
                icon: BrainCircuit,
                step: "02",
                title: "AI classifies everything",
                desc: "Bloom's level, topic, difficulty, calculation-heavy flags. SENTINEL reads a decade of exam patterns in seconds.",
              },
              {
                icon: Target,
                step: "03",
                title: "Study with certainty",
                desc: "High-yield topics ranked by probability, mock session strategy, and a plan you can export as Markdown, PDF, or PNG.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                {...enter(0.08 + i * 0.1)}
                whileHover={prefersReducedMotion ? undefined : { y: -6, transition: SPRING_CARD }}
                className="relative text-center md:text-left"
              >
                <div className="flex flex-col items-center md:items-start gap-5">
                  <div className={`relative w-20 h-20 rounded-3xl border backdrop-blur-xl flex items-center justify-center ${
                    isDark ? 'bg-white/[0.04] border-white/10' : 'bg-white/80 border-slate-900/10'
                  }`}>
                    <s.icon className="w-8 h-8 text-emerald-500" />
                    <span className={`absolute -top-2 -right-2 text-[9px] font-black px-2 py-1 rounded-full border ${
                      isDark ? 'bg-[#0a0a0b] border-white/10 text-emerald-400' : 'bg-white border-slate-200 text-emerald-600'
                    }`}>{s.step}</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className={`font-display text-lg font-bold uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.title}</h3>
                    <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-white/45' : 'text-slate-500'}`}>{s.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FEATURES BENTO ── */}
        <section id="features" className="py-20 md:py-32 mb-8 md:mb-16">
          <motion.div {...enter(0)} className="text-center mb-16 md:mb-24 max-w-3xl mx-auto">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500 mb-5">Capabilities</div>
            <h2 className={`font-display text-3xl md:text-6xl font-bold uppercase tracking-tighter leading-[0.95] ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Smarter, Faster, <span className="font-serif-accent italic font-normal text-emerald-500 lowercase">Stronger.</span>
            </h2>
            <p className={`text-base md:text-lg font-medium mt-6 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
              Everything SENTINEL extracts from a single exam paper — in under a minute.
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
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className={`font-display text-2xl md:text-3xl font-bold uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Unified Engine</h3>
                  <p className={`font-medium text-base leading-relaxed ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Drop in any past paper — PDF, scan, or photo. OCR extracts every question, formula, and diagram with high-fidelity character recognition.</p>
                  <div className="flex gap-2 pt-1">
                    {["PDF", "SCAN", "PHOTO"].map((t) => (
                      <span key={t} className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-500">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Pulse — small */}
            <motion.div {...enter(0.08)} whileHover={prefersReducedMotion ? undefined : { y: -6, transition: SPRING_CARD }} className="md:col-span-4">
              <div className={`rounded-3xl h-full p-8 flex flex-col justify-between border backdrop-blur-xl transition-colors duration-300 ${
                isDark ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]' : 'bg-white/70 border-slate-900/[0.07] hover:bg-white/90'
              }`}>
                <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="space-y-4">
                  <h3 className={`font-display text-xl md:text-2xl font-bold uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Pulse</h3>
                  <p className={`font-medium leading-relaxed text-sm ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Instant pattern recognition across a decade of KNUST exams.</p>
                  <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-indigo-400/20 bg-indigo-400/10 text-indigo-400">10 YEARS OF DATA</span>
                </div>
              </div>
            </motion.div>

            {/* Focus Point — small */}
            <motion.div {...enter(0.14)} whileHover={prefersReducedMotion ? undefined : { y: -6, transition: SPRING_CARD }} className="md:col-span-4">
              <div className={`rounded-3xl h-full p-8 flex flex-col justify-between border backdrop-blur-xl transition-colors duration-300 ${
                isDark ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]' : 'bg-white/70 border-slate-900/[0.07] hover:bg-white/90'
              }`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3 ${isDark ? 'bg-white text-[#050505]' : 'bg-slate-900 text-white'}`}>
                  <Target className="w-6 h-6" />
                </div>
                <div className="space-y-4">
                  <h3 className={`font-display text-xl md:text-2xl font-bold uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Focus Point</h3>
                  <p className={`font-medium leading-relaxed text-sm ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Every topic ranked by probability of appearing on your next paper.</p>
                  <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-400">PROBABILITY SCORE</span>
                </div>
              </div>
            </motion.div>

            {/* Predictive Analytics — large */}
            <motion.div {...enter(0.2)} whileHover={prefersReducedMotion ? undefined : { y: -6, transition: SPRING_CARD }} className="md:col-span-8">
              <div className={`rounded-3xl h-full p-8 md:p-12 grid md:grid-cols-2 items-center gap-8 border backdrop-blur-xl transition-colors duration-300 ${
                isDark ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]' : 'bg-white/70 border-slate-900/[0.07] hover:bg-white/90'
              }`}>
                <div className="space-y-6">
                  <h3 className={`font-display text-2xl md:text-3xl font-bold uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Predictive Analytics</h3>
                  <p className={`font-medium text-base leading-relaxed ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Bloom's distribution, year-over-year trends, and your knowledge gaps — one dashboard, no guesswork.</p>
                  <Button variant="outline" className={`w-fit rounded-lg px-5 py-2 text-xs sm:text-sm ${isDark ? 'border-white/15 text-white hover:bg-white/5' : 'border-slate-300 text-slate-900 hover:bg-slate-100'}`}>View Model Details</Button>
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
        <section id="stack" className={`py-20 md:py-32 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="lg:col-span-1">
              <motion.div {...enter(0)}>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500 mb-5">Under the hood</div>
                <h2 className={`font-display text-3xl md:text-6xl font-bold uppercase tracking-tighter leading-[0.95] mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>The Stack<br /><span className="font-serif-accent italic font-normal text-emerald-500 lowercase">Behind It.</span></h2>
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
                  className={`p-7 md:p-8 rounded-2xl border backdrop-blur-xl transition-colors duration-300 group ${
                    isDark
                      ? 'bg-white/[0.02] border-white/[0.06] hover:bg-emerald-500/[0.04] hover:border-emerald-500/25'
                      : 'bg-white/60 border-slate-900/[0.06] hover:bg-emerald-50/80 hover:border-emerald-300'
                  }`}
                >
                  <div className="w-11 h-11 text-emerald-500 mb-5 bg-emerald-500/10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    <tech.icon className="w-5 h-5" />
                  </div>
                  <h3 className={`font-display text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{tech.title}</h3>
                  <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{tech.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-16 md:py-24">
          <motion.div {...enter(0)} className={`relative overflow-hidden rounded-[2rem] border p-10 md:p-20 text-center backdrop-blur-2xl ${
            isDark ? 'border-emerald-500/20 bg-emerald-500/[0.04]' : 'border-emerald-300/50 bg-emerald-50/70'
          }`}>
            <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[80%] aspect-square rounded-full bg-emerald-500/15 blur-[100px] pointer-events-none" aria-hidden />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 mb-8">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">Free for KNUST students</span>
              </div>
              <h2 className={`font-display text-3xl md:text-7xl font-bold uppercase tracking-tighter leading-[0.9] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Ready to master<br /><span className="font-serif-accent italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-400 lowercase">your next exam?</span>
              </h2>
              <p className={`text-base md:text-lg font-medium mt-6 max-w-xl mx-auto ${isDark ? 'text-white/45' : 'text-slate-500'}`}>
                The past papers are already out there. SENTINEL turns them into your study plan in under a minute.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                <Button variant="primary" className="px-6 sm:px-12 py-3 sm:py-5 text-sm sm:text-base font-bold tracking-normal rounded-xl" onClick={() => setIsAuthOpen(true)}>
                  Start Scanning — Free
                </Button>
                <Button variant="outline" className={`px-6 sm:px-10 py-3 sm:py-5 text-sm sm:text-base font-bold tracking-normal rounded-xl ${isDark ? 'border-white/15 text-white hover:bg-white/5' : 'border-slate-300 text-slate-900 hover:bg-slate-100'}`} onClick={() => setIsAuthOpen(true)}>
                  Create Account
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── FOOTER ── */}
        <footer className={`w-full pt-16 md:pt-24 pb-12 md:pb-20 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="grid md:grid-cols-4 gap-12 md:gap-16 mb-16">
            <div className="col-span-1 space-y-5">
              <span className={`font-display text-xl font-bold tracking-tight uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>SENTINEL.</span>
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
                animate={prefersReducedMotion ? undefined : { opacity: [0.5, 1, 0.5] }}
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
