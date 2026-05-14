"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, Activity, Zap, Layers, FileText,
  CheckCircle, ChevronRight, Menu, Play,
  Upload, Search, BarChart3, Users, Sparkles,
  PieChart, TrendingUp, Cpu, Database,
  GraduationCap, Rocket, Target, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/landing/GlassCard";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { AuthModal } from "@/components/auth/AuthModal";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [expandedTech, setExpandedTech] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen overflow-x-hidden selection:bg-neon-crystal selection:text-black font-sans transition-colors duration-700">
      {/* Background Grid Lines - Lowered z-index and pointer-events */}
      <div className="fixed inset-0 z-0 bg-grid opacity-90 pointer-events-none" />

      {/* Dynamic Background Neon Blobs - High Intensity & Movement */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60 dark:opacity-10 transition-opacity duration-1000"
          style={{ backgroundImage: "url('/bg-frost.png')" }}
        />
        <motion.div
          className="neon-blob w-[900px] h-[900px] -top-60 -left-60 bg-neon-crystal/10 animate-float-slow hidden md:block"
        />
        <motion.div
          className="neon-blob w-[1000px] h-[1000px] -bottom-60 -right-60 bg-neon-blue/10 animate-float-reverse hidden md:block"
        />
        <motion.div
          className="neon-blob w-[700px] h-[700px] top-1/2 left-1/3 bg-neon-crystal-light/20 animate-float-slow hidden md:block"
          style={{ animationDelay: "-5s" }}
        />
        <motion.div
          className="neon-blob w-[600px] h-[600px] bottom-1/4 left-1/2 bg-neon-crystal-dark/15 animate-float-reverse hidden md:block"
          style={{ animationDelay: "-8s" }}
        />
      </div>

      {/* Modern Grid Overlay Dot */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 z-2 opacity-60 hidden md:block">
        <div className="grid grid-cols-2 gap-8">
          <div className="w-4 h-4 rounded-[var(--radius)] bg-neon-crystal shadow-[0_0_25px_var(--color-neon-crystal)]" />
          <div className="w-4 h-4 rounded-[var(--radius)] bg-neon-crystal shadow-[0_0_25px_var(--color-neon-crystal)]" />
          <div className="w-4 h-4 rounded-[var(--radius)] bg-neon-crystal shadow-[0_0_25px_var(--color-neon-crystal)]" />
          <div className="w-4 h-4 rounded-[var(--radius)] bg-neon-crystal shadow-[0_0_25px_var(--color-neon-crystal)]" />
        </div>
      </div>

      {/* Navbar - Increased z-index to 100 */}
      <nav className="sticky top-0 z-[100] w-full border-b border-white/5 bg-[var(--background)]/50 backdrop-blur-3xl">
        <div className="w-full px-8 md:px-12 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="flex gap-1.5 group-hover:scale-110 transition-transform">
              <div className="w-3 h-8 bg-neon-crystal rounded-[var(--radius)] shadow-[0_0_20px_var(--color-neon-crystal)]" />
              <div className="w-3 h-8 bg-neon-crystal-light rounded-[var(--radius)] opacity-40 shadow-[0_0_10px_var(--color-neon-crystal-light)]" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-[var(--foreground)] ml-2 uppercase italic">SENTINEL EXAMS</span>
          </motion.div>

          <div className="hidden md:flex items-center gap-12">
            <nav className="flex items-center gap-12">
              <button onClick={() => scrollToSection('research')} className="text-[11px] font-black tracking-[0.4em] text-slate-500 hover:text-neon-crystal transition-all uppercase">RESEARCH</button>
              <button onClick={() => scrollToSection('features')} className="text-[11px] font-black tracking-[0.4em] text-slate-500 hover:text-neon-crystal transition-all uppercase">FEATURES</button>
              <button onClick={() => scrollToSection('library')} className="text-[11px] font-black tracking-[0.4em] text-slate-500 hover:text-neon-crystal transition-all uppercase">LIBRARY</button>
              <button onClick={() => scrollToSection('footer')} className="text-[11px] font-black tracking-[0.4em] text-slate-500 hover:text-neon-crystal transition-all uppercase">CONTACT</button>
            </nav>
            <div className="h-8 w-px bg-slate-500/20" />
            <ThemeToggle />
            <Button
              variant="ghost"
              className="text-xs font-black tracking-widest text-[var(--foreground)] border border-[var(--foreground)]/10 px-10 hover:bg-[var(--foreground)]/5 rounded-[var(--radius)] h-12"
              onClick={() => setIsAuthOpen(true)}
            >
              LOGIN
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="rounded-[var(--radius)] px-12 font-black hover:scale-105 transition-all h-12"
              onClick={() => setIsAuthOpen(true)}
            >
              GET STARTED
            </Button>
          </div>

          <button 
            className="md:hidden text-[var(--foreground)] p-2 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-8 h-8" />
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[200] bg-[var(--background)] flex flex-col p-8 md:hidden shadow-2xl"
            >
              <div className="flex justify-between items-center mb-16">
                <span className="text-xl font-black italic uppercase">SENTINEL</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-500"
                >
                  <Activity className="w-8 h-8 rotate-45" /> {/* Close icon substitute */}
                </button>
              </div>

              <div className="flex flex-col gap-8">
                {['RESEARCH', 'FEATURES', 'LIBRARY', 'CONTACT'].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      scrollToSection(item.toLowerCase());
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-2xl font-black tracking-widest text-left hover:text-neon-crystal transition-colors italic"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-4">
                <ThemeToggle />
                <Button 
                  className="w-full h-14 font-black text-lg"
                  variant="primary"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthOpen(true);
                  }}
                >
                  GET STARTED
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="relative z-10 w-full px-8 md:px-12">
        {/* ── HERO SECTION ── Split asymmetric layout */}
        <section className="min-h-screen flex flex-col justify-center max-w-[1300px] mx-auto relative pt-20">
          <div className="grid md:grid-cols-2 gap-12 items-center min-h-[85vh]">

            {/* ── LEFT: Editorial headline + CTAs */}
            <div className="flex flex-col justify-center gap-8 md:gap-10">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="inline-flex items-center gap-3 px-4 md:px-5 py-2 md:py-2.5 self-start glass-frosted rounded-[var(--radius)] border border-neon-crystal/50"
              >
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-neon-crystal fill-neon-crystal animate-pulse" />
                <span className="text-[9px] md:text-[10px] font-black tracking-[0.4em] md:tracking-[0.5em] text-neon-crystal uppercase">KNUST · AI-POWERED</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-[100px] font-black text-[var(--foreground)] leading-[0.85] tracking-tighter italic"
              >
                CRUSH<br />
                YOUR<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-crystal-light via-neon-crystal to-neon-crystal-dark pr-2 drop-shadow-2xl">EXAMS.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-lg md:text-2xl dark:text-white leading-relaxed font-bold max-w-xl"
              >
                Stop guessing, start winning. We analyze KNUST past papers so you know <span className="text-neon-crystal">exactly what topics will drop</span>. It&apos;s that simple.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, type: "spring", damping: 20 }}
                className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full sm:w-auto mt-2"
              >
                <Button
                  variant="primary"
                  className="font-black flex items-center justify-center gap-4 w-full sm:w-auto px-6 md:px-10 py-6 md:py-6 text-lg md:text-xl hover:scale-105 active:scale-95 transition-all rounded-[var(--radius)] group"
                  onClick={() => setIsAuthOpen(true)}
                >
                  <Upload className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform" />
                  UPLOAD PAPERS
                </Button>
                <Button variant="outline" className="border border-[var(--foreground)]/15 justify-center bg-transparent hover:bg-[var(--foreground)]/5 flex items-center gap-4 w-full sm:w-auto px-6 md:px-10 py-6 md:py-6 text-lg md:text-xl text-[var(--foreground)] font-black hover:scale-105 active:scale-95 transition-all rounded-[var(--radius)] border-2">
                  <Play className="w-5 h-5 md:w-6 md:h-6" />
                  WATCH DEMO
                </Button>
              </motion.div>

              {/* Social Proof bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="flex items-center flex-wrap gap-6 md:gap-10 pt-4 md:pt-4 border-t border-[var(--foreground)]/5 w-full justify-between sm:justify-start"
              >
                {[
                  { label: "Papers Analyzed", value: "46K+" },
                  { label: "Accuracy", value: "98%" },
                  { label: "Students", value: "2K+" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-0.5 md:gap-1">
                    <span className="text-xl md:text-2xl font-black text-neon-crystal">{stat.value}</span>
                    <span className="text-[9px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.3em] text-slate-500 uppercase">{stat.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── RIGHT: Animated paper card + scroll indicator */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:flex flex-col items-center justify-center h-full min-h-[500px]"
            >
              {/* Glow blob behind card */}
              <div className="absolute inset-0 bg-neon-crystal/10 blur-[100px] rounded-full opacity-40 animate-pulsate" />

              {/* Animated paper stack */}
              <GlassCard className="relative w-full h-[420px] rounded-2xl border-white/10 overflow-hidden" blur="xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                <div className="h-full w-full p-10 flex flex-col justify-between backdrop-blur-xl">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="inline-block px-4 py-1.5 rounded-[var(--radius)] bg-neon-crystal/15 border border-neon-crystal/40">
                      <span className="text-[10px] font-black text-neon-crystal tracking-[0.3em] uppercase">AI ENGINE: SENTINEL-X</span>
                    </div>
                    <div className="flex gap-2">
                      {[0.3, 0.6, 1].map((o, i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [o, 1, o] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                          className="w-2 h-2 rounded-full bg-neon-crystal"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Paper stack animation */}
                  <div className="relative flex-1 flex items-center justify-center my-6">
                    <div className="relative w-80 h-52">
                      {[1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, rotate: i * 6, y: i * 12 }}
                          animate={{
                            opacity: 1,
                            rotate: [i * 6, i * 3, i * 6],
                            y: [i * 12, i * 12 - 10, i * 12],
                          }}
                          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                          className="absolute inset-0 glass-frosted rounded-xl border border-white/10 shadow-xl flex flex-col p-6 backdrop-blur-xl"
                          style={{ zIndex: 10 - i, transformOrigin: "bottom center" }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-lg bg-neon-crystal/15 flex items-center justify-center border border-neon-crystal/30">
                              <FileText className="w-5 h-5 text-neon-crystal" />
                            </div>
                            <div className="text-[11px] font-black text-slate-500 tracking-widest uppercase">Paper 0{i}</div>
                          </div>
                          <div className="space-y-3 flex-1">
                            <div className="w-full h-2 bg-slate-500/20 rounded-sm" />
                            <div className="w-4/5 h-2 bg-slate-500/10 rounded-sm" />
                            <div className="w-3/5 h-2 bg-neon-crystal/40 rounded-sm" />
                          </div>
                        </motion.div>
                      ))}
                      {/* Scanning line */}
                      <motion.div
                        animate={{ y: [0, 200, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-6 -left-10 -right-10 h-0.5 bg-neon-crystal shadow-[0_0_30px_var(--color-neon-crystal)] z-20 opacity-70"
                      />
                    </div>
                  </div>

                  {/* Footer stats */}
                  <div className="flex items-center justify-between border-t border-[var(--foreground)]/5 pt-4">
                    <div>
                      <div className="text-3xl font-black text-[var(--foreground)]">Pattern Hunter<span className="text-neon-crystal">.</span></div>
                      <div className="text-sm text-slate-500 font-bold mt-1">Scans thousands of pages in seconds</div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-neon-crystal" />
                  </div>
                </div>
              </GlassCard>

              {/* Scroll indicator — anchored right of centre below the card */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 1 }}
                className="mt-8 flex flex-col items-center gap-3 cursor-default select-none"
              >
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="text-[9px] font-black tracking-[0.6em] text-neon-crystal uppercase"
                >
                  SCROLL
                </motion.span>
                <div className="relative w-6 h-10 rounded-full border-2 border-neon-crystal/60 flex items-start justify-center pt-1.5">
                  <motion.div
                    animate={{ y: [0, 14, 0], opacity: [1, 0, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1 h-2.5 rounded-full bg-neon-crystal"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>


        {/* Dynamic Capability Section */}
        <section id="features" className="max-w-[1300px] mx-auto px-6 md:px-8 py-16 md:py-48">
          <div className="text-center mb-12 md:mb-32">
            <h2 className="text-5xl md:text-8xl font-black text-[var(--foreground)] uppercase tracking-tighter mb-6 md:mb-10 italic">
              STUDY SMARTER<span className="text-neon-crystal">!</span>
            </h2>
            <p className="text-xl md:text-4xl text-slate-600 dark:text-white font-bold italic">The exact roadmap to your next Grade A.</p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-14"
          >
            {[
              {
                icon: <Upload className="w-8 h-8 md:w-14 md:h-14" />,
                title: "UPLOAD",
                desc: "Drop your PDFs, screenshots, or messy scans. We handle everything."
              },
              {
                icon: <Zap className="w-8 h-8 md:w-14 md:h-14" />,
                title: "ANALYZE",
                desc: "Our AI brain hunts for repeating questions and hidden patterns."
              },
              {
                icon: <Target className="w-8 h-8 md:w-14 md:h-14" />,
                title: "CRUSH IT",
                desc: "Get a clear guide on exactly what to study to win your exam."
              }
            ].map((capability, i) => {
              const isExpanded = expandedFeature === i;
              return (
              <div key={i} className={`relative ${isExpanded ? 'col-span-2' : 'col-span-1'} lg:col-span-1`}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.2 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => setExpandedFeature(isExpanded ? null : i)}
                  className="group glass-card p-6 md:p-14 border-white/5 hover:border-neon-crystal/60 transition-all relative rounded-[var(--radius)] cursor-pointer overflow-hidden border-2 h-full"
                >
                  <div className="absolute top-4 right-4 md:top-10 md:right-10 text-[30px] md:text-[70px] font-black text-[var(--foreground)]/5 select-none tracking-tighter italic">0{i + 1}</div>
                  <motion.div
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, delay: i * 0.5 }}
                    className="w-12 h-12 md:w-24 md:h-24 rounded-xl md:rounded-3xl bg-[var(--foreground)]/5 flex items-center justify-center text-neon-crystal border border-[var(--foreground)]/10 mb-4 md:mb-12 group-hover:bg-neon-crystal group-hover:text-black transition-all duration-500 shadow-xl"
                  >
                    {capability.icon}
                  </motion.div>
                  <h3 className="text-xl md:text-4xl font-black text-[var(--foreground)] mb-2 md:mb-6 tracking-tighter italic">{capability.title}</h3>
                  <div className={`${isExpanded ? 'block' : 'hidden'} md:block transition-all duration-300`}>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-bold text-sm md:text-2xl">{capability.desc}</p>
                    <div className="mt-4 md:mt-12 flex items-center gap-3 text-neon-crystal md:opacity-0 group-hover:opacity-100 transition-all font-black text-[10px] md:text-[12px] tracking-[0.3em]">
                      <span>TRY NOW</span>
                      <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
                    </div>
                  </div>
                </motion.div>
                
                {/* Desktop Flow Arrows */}
                {i < 2 && (
                  <motion.div
                    animate={{ x: [0, 15, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="hidden lg:flex absolute -right-12 top-1/2 -translate-y-1/2 text-neon-crystal/40 z-10 pointer-events-none"
                  >
                    <ChevronRight className="w-10 h-10" />
                  </motion.div>
                )}
              </div>
            )})}
          </motion.div>
        </section>

        {/* Technical Architecture Section */}
        <section id="research" className="max-w-[1300px] mx-auto px-6 md:px-8 py-16 md:py-48 border-t border-[var(--foreground)]/5">
          <div className="text-center mb-12 md:mb-32">
            <h2 className="text-4xl md:text-7xl font-black text-[var(--foreground)] uppercase tracking-tighter mb-6 md:mb-10 italic">
              ENGINEERED FOR <span className="text-neon-crystal">EXCELLENCE</span>
            </h2>
            <p className="text-lg md:text-3xl text-slate-600 dark:text-slate-400 font-bold max-w-4xl mx-auto italic">
              Built on cutting-edge AI architecture to give you the ultimate competitive edge.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
            {[
              {
                title: "WEIGHTED DECAY",
                desc: "Our proprietary algorithm weights recent papers more heavily, ensuring you study what's relevant NOW.",
                icon: <Activity className="w-6 h-6 md:w-10 md:h-10" />
              },
              {
                title: "SEMANTIC SEARCH",
                desc: "Powered by ChromaDB and vector embeddings to catch concept variations, not just keywords.",
                icon: <Database className="w-6 h-6 md:w-10 md:h-10" />
              },
              {
                title: "BLOOM'S LEVEL",
                desc: "Understand whether you're being tested on recall, application, or critical analysis according to academic standards.",
                icon: <BarChart3 className="w-6 h-6 md:w-10 md:h-10" />
              }
            ].map((tech, i) => {
              const isExpanded = expandedTech === i;
              return (
              <GlassCard 
                key={i} 
                onClick={() => setExpandedTech(isExpanded ? null : i)}
                className={`p-6 md:p-12 border-neon-crystal/10 hover:border-neon-crystal/40 group cursor-pointer lg:cursor-default shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 ${isExpanded ? 'col-span-2' : 'col-span-1'} lg:col-span-1`}
              >
                <div className="w-12 h-12 md:w-20 md:h-20 bg-neon-crystal/10 rounded-xl md:rounded-2xl flex items-center justify-center text-neon-crystal mb-4 md:mb-8 group-hover:bg-neon-crystal group-hover:text-black transition-all">
                  {tech.icon}
                </div>
                <h3 className="text-lg md:text-3xl font-black text-[var(--foreground)] mb-2 md:mb-6 tracking-tight italic">{tech.title}</h3>
                <div className={`${isExpanded ? 'block' : 'hidden'} lg:block transition-all duration-300`}>
                  <p className="text-sm md:text-xl text-slate-600 dark:text-slate-400 font-bold leading-relaxed">{tech.desc}</p>
                </div>
              </GlassCard>
            )})}
          </div>
        </section>

        {/* Global Footer */}
        <footer id="footer" className="w-full pt-16 md:pt-48 pb-12 md:pb-24 border-t border-[var(--foreground)]/5">
          <div className="max-w-[1300px] mx-auto px-6 md:px-8 mb-16 md:mb-40 grid md:grid-cols-4 gap-12 md:gap-24 text-center md:text-left">
            <div className="col-span-1 space-y-6 md:space-y-12">
              <span className="text-2xl md:text-3xl font-black tracking-tight text-[var(--foreground)] uppercase italic">SENTINEL.</span>
              <p className="text-slate-500 font-bold leading-relaxed italic text-sm md:text-lg opacity-80">
                Helping KNUST Engineering students study smarter since 2024. Your exam shortcut.
              </p>
            </div>

            <div className="col-span-3 grid grid-cols-2 md:grid-cols-4 gap-16">
              {[
                { title: "SYSTEM", links: ["Features", "X-Engine", "Library"] },
                { title: "CAMPUS", links: ["KNUST Portal", "COE Library"] },
                { title: "DEV", links: ["API", "Status", "Docs"] },
                { title: "LEGAL", links: ["Privacy", "Terms"] }
              ].map((section) => (section.title && (
                <div key={section.title} className="space-y-8">
                  <div className="text-[12px] font-black tracking-[0.4em] text-[var(--foreground)] uppercase opacity-40">{section.title}</div>
                  <ul className="space-y-6">
                    {section.links.map(link => (
                      <li key={link}><a href="#" className="text-sm font-black text-slate-500 hover:text-neon-crystal transition-colors uppercase tracking-[0.2em] italic">{link}</a></li>
                    ))}
                  </ul>
                </div>
              )))}
            </div>
          </div>

          <div className="max-w-[1300px] mx-auto px-6 md:px-8 border-t border-[var(--foreground)]/5 pt-12 md:pt-20 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            <div className="flex flex-col gap-1 text-center md:text-left">
              <span className="text-[9px] md:text-[11px] font-black text-slate-600 tracking-[0.2em] md:tracking-[0.3em] uppercase opacity-50">
                © 2024 SENTINEL EXAMS NETWORK. BUILT FOR KNUST STUDENTS.
              </span>
              <span className="text-[10px] font-bold text-neon-crystal tracking-[0.2em] uppercase opacity-80 mt-2">
                PROJECT DEVELOPERS: ACHEAMPONG CHARLES BOTATENG & AZILAGBETOR GODBLESS
              </span>
            </div>
            <div className="flex items-center gap-4 md:gap-6 px-6 md:px-10 py-3 md:py-4 glass border-neon-crystal/50 rounded-full shadow-neon-glow hover:scale-105 transition-transform cursor-pointer">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-neon-crystal animate-pulsate" />
              <span className="text-[10px] md:text-[12px] font-black text-[var(--foreground)] tracking-[0.3em] md:tracking-[0.4em] uppercase italic">ALL SYSTEMS OPERATIONAL</span>
            </div>
          </div>
        </footer>
      </div>
      {/* ── Auth Modal Overlay ── */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </main>
  );
}
