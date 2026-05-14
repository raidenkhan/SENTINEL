"use client";

import { useEffect, useState } from "react";
import {
    Activity, BarChart3, TrendingUp, Target, Zap, BookOpen, Clock, Award,
    ChevronUp, ChevronDown, BrainCircuit, Layers, Moon, Sun, Binary, Cpu, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { GlassCard } from "@/components/landing/GlassCard";
import { Button } from "@/components/ui/Button";

const performanceData = [
    { subject: 'Memory', A: 85, fullMark: 100 },
    { subject: 'CPU', A: 70, fullMark: 100 },
    { subject: 'Concurrency', A: 90, fullMark: 100 },
    { subject: 'Files', A: 65, fullMark: 100 },
    { subject: 'Virtualization', A: 80, fullMark: 100 },
];

const trendData = [
    { name: 'Mon', score: 45 }, { name: 'Tue', score: 52 }, { name: 'Wed', score: 48 },
    { name: 'Thu', score: 70 }, { name: 'Fri', score: 65 }, { name: 'Sat', score: 85 }, { name: 'Sun', score: 92 },
];

export default function GlobalAnalyticsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [studyPlan, setStudyPlan] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [analytics, setAnalytics] = useState<any>(null);
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            try {
                const papersRes = await fetch(`${API_URL}/api/papers`);
                if (papersRes.ok) {
                    const papers = await papersRes.json();
                    if (papers && papers.length > 0) {
                        const courseId = papers[0].course_id;
                        setActiveCourseId(courseId);
                        const res = await fetch(`${API_URL}/api/analytics/${courseId}`);
                        const data = await res.json();
                        setAnalytics(data);
                    }
                }
            } catch (e) {
                console.error("Analytics fetch failed", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleGeneratePlan = async () => {
        setIsGenerating(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${API_URL}/api/chat/study-plan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ course_id: activeCourseId || "global" })
            });
            const data = await res.json();
            setStudyPlan(data.plan);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Activity className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-12 relative pb-20">
            <AnimatePresence>
                {studyPlan && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 dark:bg-charcoal-950/80 backdrop-blur-xl"
                    >
                        <GlassCard className="w-full max-w-3xl max-h-[85vh] overflow-y-auto p-12 relative shadow-24 border-emerald-500/20 bg-white/95 dark:bg-charcoal-900/90 rounded-[2.5rem]">
                            <button 
                                onClick={() => setStudyPlan(null)}
                                className="absolute top-8 right-8 text-slate-400 hover:text-emerald-500 transition-colors p-2"
                            >
                                <ChevronDown className="w-8 h-8 rotate-180" />
                            </button>
                            <div className="flex items-center gap-5 mb-10">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-emerald">
                                    <BrainCircuit className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter">AI <span className="text-emerald-500">STUDY_ADVISORY</span></h2>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-widest mt-1">Intelligence Core v4.2 Enabled</p>
                                </div>
                            </div>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                {studyPlan.split('\n').map((line, i) => (
                                    <p key={i} className="mb-4">{line}</p>
                                ))}
                            </div>
                            <Button 
                                onClick={() => setStudyPlan(null)}
                                className="w-full h-14 mt-10 rounded-2xl font-black"
                            >
                                DISMISS INTERFACE
                            </Button>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Analytics</span>
                    </div>
                    <h1 className="text-3xl font-semibold text-[var(--text-primary)]">
                        Academic <span className="text-emerald-500">Analytics</span>
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm max-w-xl">
                        Cross-course performance data and historical exam patterns.
                    </p>
                </div>

                <GlassCard className="p-4 flex items-center gap-4 bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20">
                    <div className="w-10 h-10 rounded bg-emerald-500 flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase font-medium">Global Rank</div>
                        <div className="text-lg font-medium text-[var(--text-primary)]">Elite Tier</div>
                    </div>
                </GlassCard>
            </header>

            {/* Main Stats Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatMetric label="Data Points" value={analytics?.total_questions_parsed?.toLocaleString() || "42.8K"} trend="+12%" icon={Layers} color="#10b981" />
                <StatMetric label="Readiness" value="78.4%" trend="+5.2%" icon={Target} color="#6366f1" />
                <StatMetric label="Sync Sessions" value="28" trend="+4" icon={BrainCircuit} color="#f59e0b" />
                <StatMetric label="Total Hours" value="156" trend="+12.4%" icon={Clock} color="#8b5cf6" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Performance Velocity */}
                <GlassCard className="lg:col-span-8 p-6 space-y-6 border-[var(--border)]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-[var(--border)]">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Performance Trends</h2>
                                <p className="text-[10px] text-[var(--text-muted)]">Readiness over time</p>
                            </div>
                        </div>
                        <div className="flex bg-[var(--muted)] p-1 rounded">
                            <button className="px-3 py-1.5 bg-[var(--card-bg)] rounded text-[10px] font-medium text-[var(--text-primary)]">Active</button>
                            <button className="px-3 py-1.5 text-[10px] font-medium text-[var(--text-muted)]">History</button>
                        </div>
                    </div>

                    <div className="h-64 w-full relative z-20">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics?.trends || trendData}>
                                <defs>
                                    <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ stroke: '#10b981', strokeWidth: 1 }}
                                    contentStyle={{ 
                                        backgroundColor: 'var(--card-bg)', 
                                        borderColor: 'var(--border)', 
                                        borderRadius: '16px', 
                                        backdropFilter: 'blur(10px)' 
                                    }}
                                    itemStyle={{ color: 'var(--text-primary)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorEmerald)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Radar Chart */}
                <GlassCard className="lg:col-span-4 p-10 flex flex-col justify-between border-black/5 dark:border-white/10">
                    <div className="space-y-2 mb-8">
                        <h2 className="text-xl font-black italic text-slate-900 dark:text-white uppercase tracking-tight">Mastery Radar</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neural Proficiency Balance</p>
                    </div>

                    <div className="h-64 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                                <PolarGrid stroke="rgba(148, 163, 184, 0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9, fontWeight: '900' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Mastery" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-emerald-500 uppercase">Strongest</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">Concurrency</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-indigo-500 uppercase">Focus</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">File Systems</span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* AI Advisor CTA Bento */}
            <GlassCard className="p-10 border-black/5 dark:border-white/10 bg-gradient-to-br from-emerald-500/10 to-transparent flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-emerald">
                         <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">Generate Unified<br />Study Strategy</h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mt-2">Let high-dimensional AI analyze your vaulted papers to build the perfect prep path.</p>
                    </div>
                </div>
                <div className="w-full md:w-auto shrink-0">
                    <Button 
                        onClick={handleGeneratePlan}
                        disabled={isGenerating}
                        className="px-12 py-8 text-lg font-black rounded-2xl shadow-emerald w-full md:w-auto"
                    >
                        {isGenerating ? "Synthesizing..." : "ACTIVATE ADVISOR"}
                    </Button>
                </div>
            </GlassCard>
        </div>
    );
}

function StatMetric({ label, value, trend, icon: Icon, color }: any) {
    return (
        <GlassCard className="p-4 border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded flex items-center justify-center bg-[var(--muted)] border border-[var(--border)]">
                    <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                   <ChevronUp className="w-3 h-3" />
                   {trend}
                </div>
            </div>
            
            <div className="space-y-1">
                <div className="text-[10px] text-[var(--text-muted)]">{label}</div>
                <div className="text-2xl font-semibold text-[var(--text-primary)]">{value}</div>
            </div>
        </GlassCard>
    );
}
