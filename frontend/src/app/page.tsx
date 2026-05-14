"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Upload, Sparkles, Activity, Zap, Target, Database, BarChart3, Menu, X, Cpu, Globe, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { AuthModal } from "@/components/auth/AuthModal";

const springTransition = { type: "spring" as const, damping: 15, stiffness: 400 };

const particles = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: `${Math.random() * 5}s`,
  duration: `${3 + Math.random() * 4}s`
}));

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <main className={`relative min-h-screen overflow-x-hidden selection:bg-emerald-500/30 ${isDark ? 'dark' : 'light'}`}>
      
      {/* ── BACKGROUND LAYERS - DARK ── */}
      {isDark && (
        <>
          <div 
            className="fixed inset-0 z-0" 
            style={{
              background: 'radial-gradient(ellipse at center, #0D0D0F 0%, #050505 50%, #020204 100%)'
            }}
          />
          <div 
            className="fixed inset-0 z-[1] pointer-events-none" 
            style={{
              opacity: 0.035,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
            }}
          />
          
          {/* Mathematical Grid Background */}
          <svg className="fixed inset-0 z-[1] pointer-events-none w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="mathGrid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
              </pattern>
              <pattern id="smallGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#smallGrid)" />
            <rect width="100%" height="100%" fill="url(#mathGrid)" />
          </svg>

          {/* Coordinate Axes */}
          <svg className="fixed inset-0 z-[1] pointer-events-none w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* X-axis */}
            <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
            <polygon points="95%,50% 88%,47% 88%,53%" fill="rgba(255,255,255,0.3)"/>
            {/* Y-axis */}
            <line x1="50%" y1="95%" x2="50%" y2="5%" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
            <polygon points="50%,5% 47%,12% 53%,12%" fill="rgba(255,255,255,0.3)"/>
            {/* Axis markers */}
            <text x="93%" y="58%" fill="rgba(255,255,255,0.4)" fontSize="12" fontFamily="monospace">x</text>
            <text x="54%" y="10%" fill="rgba(255,255,255,0.4)" fontSize="12" fontFamily="monospace">y</text>
            {/* Origin marker */}
            <circle cx="50%" cy="50%" r="3" fill="rgba(16,185,129,0.5)"/>
          </svg>

          {/* Mathematical Function Curves */}
          <svg className="fixed inset-0 z-[1] pointer-events-none w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Sine wave */}
            <path 
              d="M 10% 30% Q 17.5% 15% 25% 30% T 40% 30% T 55% 30% T 70% 30% T 85% 30%" 
              fill="none" 
              stroke="rgba(16,185,129,0.2)" 
              strokeWidth="1.5"
            />
            {/* Cosine wave offset */}
            <path 
              d="M 10% 70% Q 17.5% 55% 25% 70% T 40% 70% T 55% 70% T 70% 70% T 85% 70%" 
              fill="none" 
              stroke="rgba(99,102,241,0.15)" 
              strokeWidth="1.5"
            />
            {/* Parabola */}
            <path 
              d="M 70% 85% Q 85% 50% 95% 20%" 
              fill="none" 
              stroke="rgba(255,255,255,0.1)" 
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            {/* Hyperbola branch */}
            <path 
              d="M 5% 90% Q 25% 55% 45% 45% Q 65% 35% 95% 10%" 
              fill="none" 
              stroke="rgba(255,255,255,0.08)" 
              strokeWidth="1"
            />
            {/* Tangent curve approximation */}
            <path 
              d="M 10% 85% L 15% 75% L 20% 65% L 25% 55% L 30% 45% L 35% 35% L 40% 30% L 45% 28% L 50% 30% L 55% 35% L 60% 45% L 65% 55% L 70% 65% L 75% 75% L 80% 85%" 
              fill="none" 
              stroke="rgba(16,185,129,0.12)" 
              strokeWidth="1"
              strokeDasharray="2 3"
            />
          </svg>

          {/* Geometric Constructions */}
          <svg className="fixed inset-0 z-[1] pointer-events-none w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Golden ratio circles */}
            <circle cx="85%" cy="15%" r="8%" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
            <circle cx="85%" cy="15%" r="5%" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
            <circle cx="85%" cy="15%" r="3%" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
            
            {/* Triangle construction */}
            <polygon points="10%,80% 25%,80% 17.5%,65%" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8"/>
            <circle cx="10%" cy="80%" r="0.5%" fill="rgba(255,255,255,0.15)"/>
            <circle cx="25%" cy="80%" r="0.5%" fill="rgba(255,255,255,0.15)"/>
            <circle cx="17.5%" cy="65%" r="0.5%" fill="rgba(255,255,255,0.15)"/>
            <line x1="10%" y1="80%" x2="17.5%" y2="65%" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
            <line x1="25%" y1="80%" x2="17.5%" y2="65%" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
            <line x1="10%" y1="80%" x2="25%" y2="80%" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
            
            {/* Fibonacci spiral approximation */}
            <path 
              d="M 75% 75% L 75% 60% L 90% 60% L 90% 75% L 60% 75% L 60% 45% L 100% 45% L 100% 100% L 45% 100% L 45% 75%" 
              fill="none" 
              stroke="rgba(16,185,129,0.08)" 
              strokeWidth="1"
            />
            
            {/* Vector arrows */}
            <line x1="20%" y1="20%" x2="35%" y2="12%" stroke="rgba(99,102,241,0.2)" strokeWidth="1.5"/>
            <polygon points="35%,12% 32%,13% 33%,16%" fill="rgba(99,102,241,0.2)"/>
            <line x1="20%" y1="20%" x2="28%" y2="28%" stroke="rgba(16,185,129,0.2)" strokeWidth="1.5"/>
            <polygon points="28%,28% 25%,25% 27%,22%" fill="rgba(16,185,129,0.2)"/>
          </svg>

          {/* Geometric Constructions */}
          <svg className="fixed inset-0 z-[1] pointer-events-none w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15%" cy="85%" r="8%" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
            <circle cx="15%" cy="85%" r="6%" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
            <circle cx="15%" cy="85%" r="4%" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
            <circle cx="15%" cy="85%" r="2%" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
            {/* Radial lines */}
            <line x1="15%" y1="85%" x2="23%" y2="77%" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
            <line x1="15%" y1="85%" x2="7%" y2="77%" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
            <line x1="15%" y1="85%" x2="15%" y2="77%" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
            <line x1="15%" y1="85%" x2="23%" y2="85%" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
            {/* Point on circle */}
            <circle cx="21%" cy="81%" r="0.4%" fill="rgba(16,185,129,0.4)"/>
            <line x1="15%" y1="85%" x2="21%" y2="81%" stroke="rgba(16,185,129,0.2)" strokeWidth="0.8"/>
          </svg>

          {/* Equation Fragments - Dark (Animated & Glowing) */}
          <svg className="fixed inset-0 z-[2] pointer-events-none w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <motion.text 
              x="60%" y="95%" 
              fill="rgba(16,185,129,0.4)" 
              fontSize="16" 
              fontFamily="monospace"
              animate={{ opacity: [0.3, 0.7, 0.3], x: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              e^(iπ) + 1 = 0
            </motion.text>
            <motion.text 
              x="8%" y="45%" 
              fill="rgba(99,102,241,0.35)" 
              fontSize="14" 
              fontFamily="monospace"
              animate={{ opacity: [0.25, 0.6, 0.25], y: [0, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              y = mx + b
            </motion.text>
            <motion.text 
              x="75%" y="8%" 
              fill="rgba(255,255,255,0.3)" 
              fontSize="13" 
              fontFamily="monospace"
              animate={{ opacity: [0.2, 0.5, 0.2], x: [0, -4, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              f'(x) = lim
            </motion.text>
            <motion.text 
              x="3%" y="78%" 
              fill="rgba(16,185,129,0.35)" 
              fontSize="12" 
              fontFamily="monospace"
              animate={{ opacity: [0.25, 0.55, 0.25], y: [0, 4, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
              a² + b² = c²
            </motion.text>
            <motion.text 
              x="85%" y="55%" 
              fill="rgba(99,102,241,0.3)" 
              fontSize="11" 
              fontFamily="monospace"
              animate={{ opacity: [0.2, 0.5, 0.2], y: [0, -2, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            >
              √(x² + y²)
            </motion.text>
            <motion.text 
              x="50%" y="25%" 
              fill="rgba(255,255,255,0.25)" 
              fontSize="10" 
              fontFamily="monospace"
              animate={{ opacity: [0.15, 0.4, 0.15], x: [0, 3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              ∑(i=1 to n)
            </motion.text>
            <motion.text 
              x="25%" y="12%" 
              fill="rgba(16,185,129,0.3)" 
              fontSize="11" 
              fontFamily="monospace"
              animate={{ opacity: [0.2, 0.45, 0.2], y: [0, -3, 0] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
            >
              dx/dy
            </motion.text>
            <motion.text 
              x="90%" y="92%" 
              fill="rgba(255,255,255,0.25)" 
              fontSize="12" 
              fontFamily="monospace"
              animate={{ opacity: [0.15, 0.4, 0.15], x: [0, -3, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
            >
              ∫f(x)dx
            </motion.text>
          </svg>

          {/* Floating Math Symbols - Dark */}
          <svg className="fixed inset-0 z-[2] pointer-events-none w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <motion.text 
              x="5%" y="25%" 
              fill="rgba(16,185,129,0.25)" 
              fontSize="60" 
              fontFamily="serif"
              animate={{ y: [0, -10, 0], opacity: [0.15, 0.35, 0.15], rotate: [0, 5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
              √
            </motion.text>
            <motion.text 
              x="88%" y="35%" 
              fill="rgba(99,102,241,0.2)" 
              fontSize="50" 
              fontFamily="serif"
              animate={{ y: [0, 8, 0], opacity: [0.12, 0.3, 0.12], rotate: [0, -3, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              Δ
            </motion.text>
            <motion.text 
              x="92%" y="70%" 
              fill="rgba(16,185,129,0.2)" 
              fontSize="55" 
              fontFamily="serif"
              animate={{ y: [0, -6, 0], opacity: [0.12, 0.28, 0.12], rotate: [0, 4, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            >
              ∞
            </motion.text>
            <motion.text 
              x="12%" y="92%" 
              fill="rgba(255,255,255,0.18)" 
              fontSize="65" 
              fontFamily="serif"
              animate={{ y: [0, 5, 0], opacity: [0.1, 0.25, 0.1], rotate: [0, -5, 0] }}
              transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
            >
              π
            </motion.text>
            <motion.text 
              x="45%" y="88%" 
              fill="rgba(99,102,241,0.15)" 
              fontSize="45" 
              fontFamily="serif"
              animate={{ y: [0, -8, 0], opacity: [0.08, 0.22, 0.08] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
            >
              Σ
            </motion.text>
            <motion.text 
              x="3%" y="55%" 
              fill="rgba(16,185,129,0.2)" 
              fontSize="55" 
              fontFamily="serif"
              animate={{ y: [0, 6, 0], opacity: [0.12, 0.3, 0.12] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
            >
              ∫
            </motion.text>
          </svg>

          {/* Vertex markers on curves */}
          <svg className="fixed inset-0 z-[2] pointer-events-none w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <motion.g animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 3, repeat: Infinity }}>
              <circle cx="25%" cy="30%" r="3" fill="rgba(16,185,129,0.5)"/>
              <circle cx="40%" cy="30%" r="3" fill="rgba(16,185,129,0.5)"/>
              <circle cx="55%" cy="30%" r="3" fill="rgba(16,185,129,0.5)"/>
              <circle cx="70%" cy="30%" r="3" fill="rgba(16,185,129,0.5)"/>
              <circle cx="85%" cy="30%" r="3" fill="rgba(16,185,129,0.5)"/>
            </motion.g>
            <motion.g animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 4, repeat: Infinity }}>
              <circle cx="25%" cy="70%" r="3" fill="rgba(99,102,241,0.4)"/>
              <circle cx="40%" cy="70%" r="3" fill="rgba(99,102,241,0.4)"/>
              <circle cx="55%" cy="70%" r="3" fill="rgba(99,102,241,0.4)"/>
              <circle cx="70%" cy="70%" r="3" fill="rgba(99,102,241,0.4)"/>
              <circle cx="85%" cy="70%" r="3" fill="rgba(99,102,241,0.4)"/>
            </motion.g>
          </svg>
          
          {/* Ambient glow blooms - Dark */}
          <motion.div 
            animate={{ y: [0, 20, 0], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="fixed -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full z-[1] pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.1) 50%, transparent 70%)',
              filter: 'blur(60px)'
            }}
          />
          <motion.div 
            animate={{ y: [0, -15, 0], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="fixed -top-[15%] -right-[10%] w-[55%] h-[55%] rounded-full z-[1] pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 70%)',
              filter: 'blur(80px)'
            }}
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-full z-[1] pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.06) 0%, transparent 70%)',
              filter: 'blur(100px)'
            }}
          />
          
          {/* Decorative arcs - Dark */}
          <div className="fixed top-[10%] right-[5%] w-[40%] h-[40%] rounded-full z-[1] pointer-events-none" style={{ border: '1px solid rgba(255, 255, 255, 0.15)', transform: 'rotate(45deg)' }} />
          <div className="fixed bottom-[15%] left-[5%] w-[30%] h-[30%] rounded-full z-[1] pointer-events-none" style={{ border: '1px solid rgba(16, 185, 129, 0.2)', transform: 'rotate(-30deg)' }} />
          
          {/* Orbital paths - Dark */}
          <div className="fixed top-[20%] right-[15%] w-[300px] h-[300px] rounded-full z-[1] pointer-events-none" style={{ border: '1px dashed rgba(255, 255, 255, 0.12)', transform: 'rotate(15deg)' }} />
          <div className="fixed bottom-[25%] left-[10%] w-[200px] h-[200px] rounded-full z-[1] pointer-events-none" style={{ border: '1px dashed rgba(255, 255, 255, 0.1)', transform: 'rotate(-25deg)' }} />
          
          {/* Light streaks - Dark */}
          <div className="fixed left-[15%] top-[10%] w-px h-[200px] z-[1] pointer-events-none bg-gradient-to-b from-transparent via-white/20 to-transparent" style={{ transform: 'rotate(15deg)' }} />
          <div className="fixed right-[20%] top-[20%] w-px h-[200px] z-[1] pointer-events-none bg-gradient-to-b from-transparent via-white/15 to-transparent" style={{ transform: 'rotate(-20deg)' }} />
          <div className="fixed left-[40%] bottom-[30%] w-px h-[200px] z-[1] pointer-events-none bg-gradient-to-b from-transparent via-white/12 to-transparent" style={{ transform: 'rotate(10deg)' }} />
          
          {/* Particle stars - Dark */}
          <div className="fixed inset-0 z-[2] pointer-events-none overflow-hidden">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute w-[3px] h-[3px] rounded-full"
                style={{ left: p.left, top: p.top, background: 'rgba(255, 255, 255, 0.6)' }}
                animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.5, 1] }}
                transition={{ duration: parseFloat(p.duration), repeat: Infinity, ease: "easeInOut", delay: parseFloat(p.delay) }}
              />
            ))}
          </div>
        </>
      )}

      {/* ── BACKGROUND LAYERS - LIGHT ── */}
      {!isDark && (
        <>
          <div 
            className="fixed inset-0 z-0" 
            style={{
              background: 'radial-gradient(ellipse at center, #f8fafc 0%, #e2e8f0 40%, #cbd5e1 100%)'
            }}
          />
          <div 
            className="fixed inset-0 z-[1] pointer-events-none" 
            style={{
              opacity: 0.02,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'
            }}
          />
          
          {/* Mathematical Grid Background - Light */}
          <svg className="fixed inset-0 z-[1] pointer-events-none w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="mathGridLight" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5"/>
              </pattern>
              <pattern id="smallGridLight" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#smallGridLight)" />
            <rect width="100%" height="100%" fill="url(#mathGridLight)" />
          </svg>

          {/* Coordinate Axes - Light */}
          <svg className="fixed inset-0 z-[1] pointer-events-none w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="rgba(0,0,0,0.12)" strokeWidth="1"/>
            <polygon points="95%,50% 88%,47% 88%,53%" fill="rgba(0,0,0,0.2)"/>
            <line x1="50%" y1="95%" x2="50%" y2="5%" stroke="rgba(0,0,0,0.12)" strokeWidth="1"/>
            <polygon points="50%,5% 47%,12% 53%,12%" fill="rgba(0,0,0,0.2)"/>
            <text x="93%" y="58%" fill="rgba(0,0,0,0.25)" fontSize="12" fontFamily="monospace">x</text>
            <text x="54%" y="10%" fill="rgba(0,0,0,0.25)" fontSize="12" fontFamily="monospace">y</text>
            <circle cx="50%" cy="50%" r="3" fill="rgba(16,185,129,0.4)"/>
          </svg>

          {/* Mathematical Function Curves - Light */}
          <svg className="fixed inset-0 z-[1] pointer-events-none w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M 10% 30% Q 17.5% 15% 25% 30% T 40% 30% T 55% 30% T 70% 30% T 85% 30%" 
              fill="none" 
              stroke="rgba(16,185,129,0.15)" 
              strokeWidth="1.5"
            />
            <path 
              d="M 10% 70% Q 17.5% 55% 25% 70% T 40% 70% T 55% 70% T 70% 70% T 85% 70%" 
              fill="none" 
              stroke="rgba(99,102,241,0.12)" 
              strokeWidth="1.5"
            />
            <path 
              d="M 70% 85% Q 85% 50% 95% 20%" 
              fill="none" 
              stroke="rgba(0,0,0,0.08)" 
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path 
              d="M 5% 90% Q 25% 55% 45% 45% Q 65% 35% 95% 10%" 
              fill="none" 
              stroke="rgba(0,0,0,0.06)" 
              strokeWidth="1"
            />
            <path 
              d="M 10% 85% L 15% 75% L 20% 65% L 25% 55% L 30% 45% L 35% 35% L 40% 30% L 45% 28% L 50% 30% L 55% 35% L 60% 45% L 65% 55% L 70% 65% L 75% 75% L 80% 85%" 
              fill="none" 
              stroke="rgba(16,185,129,0.1)" 
              strokeWidth="1"
              strokeDasharray="2 3"
            />
          </svg>

          {/* Geometric Constructions - Light */}
          <svg className="fixed inset-0 z-[1] pointer-events-none w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="85%" cy="15%" r="8%" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
            <circle cx="85%" cy="15%" r="5%" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5"/>
            <circle cx="85%" cy="15%" r="3%" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5"/>
            
            <polygon points="10%,80% 25%,80% 17.5%,65%" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8"/>
            <circle cx="10%" cy="80%" r="0.5%" fill="rgba(0,0,0,0.12)"/>
            <circle cx="25%" cy="80%" r="0.5%" fill="rgba(0,0,0,0.12)"/>
            <circle cx="17.5%" cy="65%" r="0.5%" fill="rgba(0,0,0,0.12)"/>
            <line x1="10%" y1="80%" x2="17.5%" y2="65%" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5"/>
            <line x1="25%" y1="80%" x2="17.5%" y2="65%" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5"/>
            <line x1="10%" y1="80%" x2="25%" y2="80%" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5"/>
            
            <path 
              d="M 75% 75% L 75% 60% L 90% 60% L 90% 75% L 60% 75% L 60% 45% L 100% 45% L 100% 100% L 45% 100% L 45% 75%" 
              fill="none" 
              stroke="rgba(16,185,129,0.08)" 
              strokeWidth="1"
            />
            
            <line x1="20%" y1="20%" x2="35%" y2="12%" stroke="rgba(99,102,241,0.15)" strokeWidth="1.5"/>
            <polygon points="35%,12% 32%,13% 33%,16%" fill="rgba(99,102,241,0.15)"/>
            <line x1="20%" y1="20%" x2="28%" y2="28%" stroke="rgba(16,185,129,0.15)" strokeWidth="1.5"/>
            <polygon points="28%,28% 25%,25% 27%,22%" fill="rgba(16,185,129,0.15)"/>
          </svg>

          {/* Mathematical Notation - Light (Glowing & Animated) */}
          <svg className="fixed inset-0 z-[2] pointer-events-none w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glowLight" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <motion.text 
              x="3%" y="60%" 
              fill="rgba(16,185,129,0.5)" 
              fontSize="80" 
              fontFamily="serif"
              filter="url(#glowLight)"
              animate={{ y: [0, -8, 0], opacity: [0.35, 0.6, 0.35] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              ∫
            </motion.text>
            <motion.text 
              x="92%" y="75%" 
              fill="rgba(99,102,241,0.45)" 
              fontSize="40" 
              fontFamily="serif"
              filter="url(#glowLight)"
              animate={{ y: [0, 6, 0], opacity: [0.3, 0.55, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              Σ
            </motion.text>
            <motion.text 
              x="15%" y="92%" 
              fill="rgba(0,0,0,0.4)" 
              fontSize="50" 
              fontFamily="serif"
              animate={{ y: [0, -5, 0], opacity: [0.25, 0.45, 0.25] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
              π
            </motion.text>
            <motion.text 
              x="80%" y="90%" 
              fill="rgba(16,185,129,0.5)" 
              fontSize="45" 
              fontFamily="serif"
              filter="url(#glowLight)"
              animate={{ y: [0, 7, 0], opacity: [0.3, 0.55, 0.3] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            >
              ∞
            </motion.text>
            <motion.text 
              x="88%" y="40%" 
              fill="rgba(0,0,0,0.35)" 
              fontSize="35" 
              fontFamily="serif"
              animate={{ y: [0, -4, 0], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
            >
              Δ
            </motion.text>
            <motion.text 
              x="5%" y="25%" 
              fill="rgba(99,102,241,0.45)" 
              fontSize="50" 
              fontFamily="sans-serif"
              filter="url(#glowLight)"
              animate={{ y: [0, 5, 0], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
            >
              √
            </motion.text>
          </svg>

          {/* Equation Fragments - Light (Glowing & Animated) */}
          <svg className="fixed inset-0 z-[2] pointer-events-none w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glowLightEq" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <motion.text 
              x="60%" y="95%" 
              fill="rgba(16,185,129,0.5)" 
              fontSize="16" 
              fontFamily="monospace"
              filter="url(#glowLightEq)"
              animate={{ opacity: [0.35, 0.7, 0.35], x: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              e^(iπ) + 1 = 0
            </motion.text>
            <motion.text 
              x="8%" y="45%" 
              fill="rgba(99,102,241,0.5)" 
              fontSize="14" 
              fontFamily="monospace"
              filter="url(#glowLightEq)"
              animate={{ opacity: [0.3, 0.6, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              y = mx + b
            </motion.text>
            <motion.text 
              x="75%" y="8%" 
              fill="rgba(0,0,0,0.4)" 
              fontSize="13" 
              fontFamily="monospace"
              animate={{ opacity: [0.25, 0.5, 0.25], x: [0, -4, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              f'(x) = lim
            </motion.text>
            <motion.text 
              x="3%" y="78%" 
              fill="rgba(16,185,129,0.5)" 
              fontSize="12" 
              fontFamily="monospace"
              filter="url(#glowLightEq)"
              animate={{ opacity: [0.3, 0.6, 0.3], y: [0, 4, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
              a² + b² = c²
            </motion.text>
            <motion.text 
              x="85%" y="55%" 
              fill="rgba(99,102,241,0.45)" 
              fontSize="11" 
              fontFamily="monospace"
              filter="url(#glowLightEq)"
              animate={{ opacity: [0.25, 0.55, 0.25], y: [0, -2, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            >
              √(x² + y²)
            </motion.text>
            <motion.text 
              x="50%" y="25%" 
              fill="rgba(0,0,0,0.35)" 
              fontSize="10" 
              fontFamily="monospace"
              animate={{ opacity: [0.2, 0.45, 0.2], x: [0, 3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              ∑(i=1 to n)
            </motion.text>
          </svg>

          {/* Vertex markers on curves - Light */}
          <svg className="fixed inset-0 z-[2] pointer-events-none w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <motion.g animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }}>
              <circle cx="25%" cy="30%" r="3" fill="rgba(16,185,129,0.5)"/>
              <circle cx="40%" cy="30%" r="3" fill="rgba(16,185,129,0.5)"/>
              <circle cx="55%" cy="30%" r="3" fill="rgba(16,185,129,0.5)"/>
              <circle cx="70%" cy="30%" r="3" fill="rgba(16,185,129,0.5)"/>
              <circle cx="85%" cy="30%" r="3" fill="rgba(16,185,129,0.5)"/>
            </motion.g>
            <motion.g animate={{ opacity: [0.25, 0.55, 0.25] }} transition={{ duration: 4, repeat: Infinity }}>
              <circle cx="25%" cy="70%" r="3" fill="rgba(99,102,241,0.5)"/>
              <circle cx="40%" cy="70%" r="3" fill="rgba(99,102,241,0.5)"/>
              <circle cx="55%" cy="70%" r="3" fill="rgba(99,102,241,0.5)"/>
              <circle cx="70%" cy="70%" r="3" fill="rgba(99,102,241,0.5)"/>
              <circle cx="85%" cy="70%" r="3" fill="rgba(99,102,241,0.5)"/>
            </motion.g>
          </svg>

          {/* Polar Coordinate System - Light */}
          <svg className="fixed inset-0 z-[1] pointer-events-none w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15%" cy="85%" r="8%" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
            <circle cx="15%" cy="85%" r="6%" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
            <circle cx="15%" cy="85%" r="4%" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5"/>
            <circle cx="15%" cy="85%" r="2%" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5"/>
            <line x1="15%" y1="85%" x2="23%" y2="77%" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5"/>
            <line x1="15%" y1="85%" x2="7%" y2="77%" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5"/>
            <line x1="15%" y1="85%" x2="15%" y2="77%" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5"/>
            <line x1="15%" y1="85%" x2="23%" y2="85%" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5"/>
            <circle cx="21%" cy="81%" r="0.4%" fill="rgba(16,185,129,0.3)"/>
            <line x1="15%" y1="85%" x2="21%" y2="81%" stroke="rgba(16,185,129,0.15)" strokeWidth="0.8"/>
          </svg>

          {/* Equation Fragments - Light */}
          <svg className="fixed inset-0 z-[1] pointer-events-none w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <text x="60%" y="95%" fill="rgba(0,0,0,0.04)" fontSize="14" fontFamily="monospace">e^(iπ) + 1 = 0</text>
            <text x="8%" y="45%" fill="rgba(0,0,0,0.03)" fontSize="12" fontFamily="monospace">y = mx + b</text>
            <text x="75%" y="5%" fill="rgba(0,0,0,0.03)" fontSize="12" fontFamily="monospace">f'(x) = lim</text>
            <text x="3%" y="75%" fill="rgba(16,185,129,0.04)" fontSize="11" fontFamily="monospace">a² + b² = c²</text>
          </svg>

          {/* Vertex markers on curves - Light */}
          <svg className="fixed inset-0 z-[1] pointer-events-none w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25%" cy="30%" r="3" fill="rgba(16,185,129,0.25)"/>
            <circle cx="40%" cy="30%" r="3" fill="rgba(16,185,129,0.25)"/>
            <circle cx="55%" cy="30%" r="3" fill="rgba(16,185,129,0.25)"/>
            <circle cx="70%" cy="30%" r="3" fill="rgba(16,185,129,0.25)"/>
            <circle cx="85%" cy="30%" r="3" fill="rgba(16,185,129,0.25)"/>
            <circle cx="25%" cy="70%" r="3" fill="rgba(99,102,241,0.2)"/>
            <circle cx="40%" cy="70%" r="3" fill="rgba(99,102,241,0.2)"/>
            <circle cx="55%" cy="70%" r="3" fill="rgba(99,102,241,0.2)"/>
            <circle cx="70%" cy="70%" r="3" fill="rgba(99,102,241,0.2)"/>
            <circle cx="85%" cy="70%" r="3" fill="rgba(99,102,241,0.2)"/>
          </svg>
          
          {/* Ambient glow blooms - Light */}
          <motion.div 
            animate={{ y: [0, 20, 0], opacity: [0.7, 0.9, 0.7] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="fixed -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full z-[1] pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 50%, transparent 70%)',
              filter: 'blur(60px)'
            }}
          />
          <motion.div 
            animate={{ y: [0, -15, 0], opacity: [0.6, 0.8, 0.6] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="fixed -top-[15%] -right-[10%] w-[55%] h-[55%] rounded-full z-[1] pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0.04) 50%, transparent 70%)',
              filter: 'blur(80px)'
            }}
          />
          
          {/* Decorative arcs - Light */}
          <div className="fixed top-[10%] right-[5%] w-[40%] h-[40%] rounded-full z-[1] pointer-events-none" style={{ border: '1px solid rgba(0, 0, 0, 0.08)', transform: 'rotate(45deg)' }} />
          <div className="fixed bottom-[15%] left-[5%] w-[30%] h-[30%] rounded-full z-[1] pointer-events-none" style={{ border: '1px solid rgba(16, 185, 129, 0.15)', transform: 'rotate(-30deg)' }} />
          
          {/* Orbital paths - Light */}
          <div className="fixed top-[20%] right-[15%] w-[300px] h-[300px] rounded-full z-[1] pointer-events-none" style={{ border: '1px dashed rgba(0, 0, 0, 0.06)', transform: 'rotate(15deg)' }} />
          <div className="fixed bottom-[25%] left-[10%] w-[200px] h-[200px] rounded-full z-[1] pointer-events-none" style={{ border: '1px dashed rgba(0, 0, 0, 0.05)', transform: 'rotate(-25deg)' }} />
          
          {/* Particle stars - Light */}
          <div className="fixed inset-0 z-[2] pointer-events-none overflow-hidden">
            {particles.map((p) => (
              <motion.div
                key={`light-${p.id}`}
                className="absolute w-[2px] h-[2px] rounded-full"
                style={{ left: p.left, top: p.top, background: 'rgba(0, 0, 0, 0.2)' }}
                animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.3, 1] }}
                transition={{ duration: parseFloat(p.duration), repeat: Infinity, ease: "easeInOut", delay: parseFloat(p.delay) }}
              />
            ))}
          </div>
        </>
      )}

      {/* ── NAVIGATION ── */}
      <nav className={`sticky top-0 z-[100] w-full border-b px-6 md:px-12 h-16 flex items-center justify-between ${
        isDark 
          ? 'border-white/5 bg-[#050505]/60' 
          : 'border-slate-200/50 bg-white/60'
      } backdrop-blur-xl`}>
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className={`w-2.5 h-6 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.6)] group-hover:scale-y-125 transition-transform duration-500 ${isDark ? 'bg-emerald-500' : 'bg-emerald-500'}`} />
          <span className={`text-xl font-black tracking-tighter uppercase italic ${isDark ? 'text-white' : 'text-slate-900'}`}>SENTINEL</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <ThemeToggle />
          <Button variant="ghost" className={`text-xs font-bold ${isDark ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`} onClick={() => setIsAuthOpen(true)}>LOGIN</Button>
          <Button variant="primary" className="text-xs font-bold px-5 py-2.5 rounded-full" onClick={() => setIsAuthOpen(true)}>GET STARTED</Button>
        </div>
        
        <button className={`md:hidden ${isDark ? 'text-white' : 'text-slate-900'}`} onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
      </nav>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={springTransition}
              className={`fixed top-0 right-0 z-[120] h-full w-[80%] max-w-[320px] border-l p-8 shadow-2xl flex flex-col md:hidden ${
                isDark ? 'bg-[#0D0D0F] border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className={`flex justify-between items-center mb-12 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span className="text-lg font-black italic tracking-widest">SENTINEL</span>
                <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
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

      <div className="relative z-10 w-full px-6 md:px-12 max-w-[1400px] mx-auto pt-12 md:pt-24">
        
        {/* ── HERO SECTION ── */}
        <section className="min-h-[75vh] grid lg:grid-cols-[1fr_0.8fr] gap-16 items-center mb-32">
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full self-start"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-600 uppercase">KNUST ACADEMIC INTELLIGENCE</span>
            </motion.div>

            <h1 className={`text-6xl md:text-8xl font-black leading-[0.85] tracking-tighter uppercase italic ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Master<br />Every<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-400">Exam.</span>
            </h1>

            <p className={`text-lg md:text-xl max-w-xl leading-relaxed font-medium ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
              Sentinel uses semantic AI to bridge the gap between past papers and future success. Stop hoping for luck; start studying with <span className="text-emerald-500 font-bold underline decoration-emerald-500/30 underline-offset-4">certainty</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="primary" className="px-12 py-7 text-lg font-bold rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)]" onClick={() => setIsAuthOpen(true)}>
                Start Scanning
              </Button>
              <Button variant={isDark ? "outline" : "outline"} className={`px-12 py-7 text-lg font-bold rounded-2xl transition-colors group ${
                isDark 
                  ? 'border-white/10 text-white hover:bg-white/5 hover:border-white/20' 
                  : 'border-slate-300 text-slate-900 hover:bg-slate-100 hover:border-slate-400'
              }`}>
                Watch Demo <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className={`flex gap-12 pt-10 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
              <div>
                <div className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>46.2K</div>
                <div className={`text-[11px] font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Files Indexed</div>
              </div>
              <div>
                <div className="text-3xl font-black text-emerald-500">98.4%</div>
                <div className={`text-[11px] font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Pattern Sync</div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className={`rounded border w-full p-6 flex flex-col justify-between ${
              isDark 
                ? 'bg-[#0D0D0F]/50 border-white/10' 
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="text-xs font-medium text-[var(--text-muted)]">Analysis Preview</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-[var(--text-muted)]">Ready</span>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                {/* Simple data visualization - academic style */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[var(--text-muted)]">Topic Coverage</span>
                    <span className="text-emerald-500 font-medium">87%</span>
                  </div>
                  <div className="h-2 bg-[var(--muted)] rounded overflow-hidden">
                    <div className="h-full w-[87%] bg-emerald-500 rounded" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[var(--text-muted)]">Bloom's Distribution</span>
                    <span className="text-[var(--text-muted)]">Analyzed</span>
                  </div>
                  <div className="flex gap-1 h-6">
                    <div className="flex-1 bg-slate-700/50 rounded" title="Remember" />
                    <div className="flex-1 bg-slate-600/50 rounded" title="Understand" />
                    <div className="flex-[2] bg-emerald-500/70 rounded" title="Apply" />
                    <div className="flex-1 bg-emerald-500/50 rounded" title="Analyze" />
                    <div className="flex-1 bg-emerald-400/30 rounded" title="Evaluate" />
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                  <div className="text-[10px] text-[var(--text-muted)] mb-2">Recent Analysis</div>
                  <div className="space-y-2 text-[9px]">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">EE321 - Circuit Analysis</span>
                      <span className="text-emerald-500/70">12 questions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">ME201 - Thermodynamics</span>
                      <span className="text-emerald-500/70">8 questions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">CS215 - Data Structures</span>
                      <span className="text-emerald-500/70">15 questions</span>
                    </div>
                  </div>
                </div>
              </div>
               
              <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>3 papers processed</span>
                <span>2024</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES BENTO GRID ── */}
        <section id="features" className="py-24 md:py-48 mb-24">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className={`text-4xl md:text-7xl font-black uppercase tracking-tighter mb-8 italic ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Smarter, Faster, <span className="text-emerald-500">Stronger.</span>
            </h2>
            <p className={`text-lg md:text-2xl font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>The most advanced exam intelligence suite ever built for students.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px] md:auto-rows-[350px]">
            <motion.div whileHover={{ y: -8 }} className="md:col-span-8 group relative">
              <div className={`rounded-3xl h-full p-10 flex flex-col justify-end overflow-hidden hover:opacity-90 transition-all duration-300 ${
                isDark 
                  ? 'bg-[#0D0D0F]/70 backdrop-blur-xl border border-emerald-500/20 hover:bg-[#0D0D0F]/80' 
                  : 'bg-white/70 backdrop-blur-xl border border-emerald-200/50 hover:bg-white/90'
              }`}>
                <div className="max-w-md space-y-4">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h3 className={`text-4xl font-black uppercase italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Unified Engine</h3>
                  <p className={`font-medium text-lg leading-snug ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Drag and drop any file format. Our engine extracts text, formulas, and diagrams with OCR precision.</p>
                </div>
                <div className={`absolute top-10 right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 ${isDark ? '' : 'text-slate-900'}`}>
                  <Globe className="w-64 h-64 -rotate-12" />
                </div>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -8 }} className="md:col-span-4">
              <div className={`rounded-3xl h-full p-10 flex flex-col justify-between hover:opacity-90 transition-all duration-300 ${
                isDark 
                  ? 'bg-[#0D0D0F]/70 backdrop-blur-xl border border-white/5 hover:bg-[#0D0D0F]/80' 
                  : 'bg-white/70 backdrop-blur-xl border border-slate-200/50 hover:bg-white/90'
              }`}>
                <div className="w-14 h-14 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                  <Zap className="w-7 h-7" />
                </div>
                <div className="space-y-4">
                  <h3 className={`text-3xl font-black uppercase italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Pulse</h3>
                  <p className={`font-medium leading-tight ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Instant pattern recognition across 10 years of data.</p>
                </div>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -8 }} className="md:col-span-4">
              <div className={`rounded-3xl h-full p-10 flex flex-col justify-between hover:opacity-90 transition-all duration-300 ${
                isDark 
                  ? 'bg-[#0D0D0F]/70 backdrop-blur-xl border border-white/5 hover:bg-[#0D0D0F]/80' 
                  : 'bg-white/70 backdrop-blur-xl border border-slate-200/50 hover:bg-white/90'
              }`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white text-[#050505]' : 'bg-slate-900 text-white'}`}>
                  <Target className="w-7 h-7" />
                </div>
                <div className="space-y-4">
                  <h3 className={`text-3xl font-black uppercase italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Focus Point</h3>
                  <p className={`font-medium leading-tight ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Ranked topics by probability of appearance.</p>
                </div>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -8 }} className="md:col-span-8">
              <div className={`rounded-3xl h-full p-10 grid md:grid-cols-2 items-center gap-10 overflow-hidden hover:opacity-90 transition-all duration-300 ${
                isDark 
                  ? 'bg-[#0D0D0F]/70 backdrop-blur-xl border border-white/5 hover:bg-[#0D0D0F]/80' 
                  : 'bg-white/70 backdrop-blur-xl border border-slate-200/50 hover:bg-white/90'
              }`}>
                <div className="space-y-6">
                  <h3 className={`text-4xl font-black uppercase italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Predictive Analytics</h3>
                  <p className={`font-medium text-lg leading-snug ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Visualizing the academic roadmap. See exactly what you're up against.</p>
                  <Button variant="outline" className={`w-fit rounded-full px-6 py-2 ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-slate-300 text-slate-900 hover:bg-slate-100'}`}>View Model Details</Button>
                </div>
                <div className="relative h-full flex flex-col justify-center">
                  <div className="space-y-3">
                    {[60, 85, 45, 95].map((w, i) => (
                      <div key={i} className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                        <motion.div 
                          initial={{ width: 0 }} whileInView={{ width: `${w}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                          className={`h-full ${i === 3 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : isDark ? 'bg-white/20' : 'bg-slate-400/30'}`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className={`absolute -bottom-10 right-0 text-[120px] font-black italic opacity-[0.03] select-none ${isDark ? 'text-white' : 'text-slate-900'}`}>DATA</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── TECHNICAL STACK ── */}
        <section id="research" className={`py-24 md:py-48 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1">
              <h2 className={`text-5xl font-black uppercase tracking-tighter mb-8 italic ${isDark ? 'text-white' : 'text-slate-900'}`}>The Stack<br /><span className="text-emerald-500">Behind It.</span></h2>
              <p className={`text-lg font-medium leading-relaxed ${isDark ? 'text-white/40' : 'text-slate-500'}`}>SENTINEL isn't just a UI—it's a massive distributed vector engine designed to scale with your academic career.</p>
            </div>
            
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
              {[
                { title: "Vector ChromaDB", desc: "Our database handles millions of semantic document chunks with near-zero latency retrieval.", icon: <Database /> },
                { title: "Weight Decay v2", desc: "Algorithm that prioritizes recent exam trends to ensure you don't study legacy material.", icon: <Activity /> },
                { title: "Bloom Metric", desc: "AI-extracted difficulty categorization based on Bloom's Taxonomy of academic standards.", icon: <BarChart3 /> },
                { title: "Neural OCR", desc: "Handwritten and messy PDF support with high-fidelity character recognition.", icon: <Cpu /> }
              ].map((tech, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -4 }}
                  className={`p-8 rounded-3xl transition-all duration-300 ${
                    isDark 
                      ? 'bg-white/[0.02] border border-white/5 hover:bg-emerald-500/5 hover:border-emerald-500/20' 
                      : 'bg-slate-50 border border-slate-200/50 hover:bg-emerald-50 hover:border-emerald-200'
                  }`}
                >
                  <div className="w-12 h-12 text-emerald-500 mb-6 bg-emerald-500/10 rounded-xl flex items-center justify-center">{tech.icon}</div>
                  <h3 className={`text-xl font-bold mb-2 uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{tech.title}</h3>
                  <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{tech.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className={`w-full pt-16 md:pt-32 pb-12 md:pb-24 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <div className="grid md:grid-cols-4 gap-16 md:gap-24 text-center md:text-left mb-24">
            <div className="col-span-1 space-y-6">
              <span className={`text-2xl font-black tracking-tight uppercase italic ${isDark ? 'text-white' : 'text-slate-900'}`}>SENTINEL.</span>
              <p className={`font-medium leading-relaxed text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                Precision examination tools for the future of engineering. Built for KNUST Students by the SENTINEL Network.
              </p>
            </div>

            <div className="col-span-3 grid grid-cols-2 md:grid-cols-4 gap-12">
              {[
                { title: "Engine", links: ["Scanning", "VectorDB", "API"] },
                { title: "Library", links: ["COE Portal", "Syllabus", "Archive"] },
                { title: "Network", links: ["Community", "Growth", "Labs"] },
                { title: "Status", links: ["Live", "Cloud", "Uptime"] }
              ].map((sec) => (
                <div key={sec.title} className="space-y-6">
                  <span className={`text-[10px] font-black tracking-[0.3em] uppercase ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{sec.title}</span>
                  <ul className="space-y-3">
                    {sec.links.map(l => (
                      <li key={l}><a href="#" className={`text-sm font-bold uppercase italic transition-colors ${isDark ? 'text-white/50 hover:text-emerald-400' : 'text-slate-500 hover:text-emerald-500'}`}>{l}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className={`border-t pt-12 flex flex-col md:flex-row items-center justify-between gap-8 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
            <div className="flex flex-col gap-1.5 text-center md:text-left">
              <span className={`text-[9px] font-black tracking-[0.3em] uppercase ${isDark ? 'text-white/40' : 'text-slate-400'}`}>© 2024 SENTINEL ACADEMIC NETWORK.</span>
              <span className="text-[10px] font-black text-emerald-500 tracking-[0.2em] uppercase">Developers: A. Charles & A. Godbless</span>
            </div>
            <div className={`flex items-center gap-3 px-6 py-3 rounded-full hover:scale-105 transition-transform cursor-pointer ${
              isDark 
                ? 'bg-[#0D0D0F]/50 backdrop-blur-xl border border-white/10' 
                : 'bg-white/70 backdrop-blur-xl border border-slate-200/50'
            }`}>
              <motion.div 
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
              />
              <span className={`text-[10px] font-bold tracking-[0.3em] uppercase ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Neural Hub Online</span>
            </div>
          </div>
        </footer>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </main>
  );
}
