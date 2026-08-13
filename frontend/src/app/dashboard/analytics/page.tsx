"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Activity, TrendingUp, BrainCircuit, Sparkles, AlertCircle,
    Upload, Loader2, Users, FileText,
    BookOpen, X, TrendingUp as TrendUp, Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { GlassCard } from "@/components/landing/GlassCard";
import { Button } from "@/components/ui/Button";
import { StudyPlanMarkdown } from "@/components/dashboard/StudyPlanMarkdown";
import Link from "next/link";
import { useRouter } from "next/navigation";

type DataState = "loading" | "empty" | "processing" | "insufficient" | "ready";

const MIN_QUESTIONS_FOR_INSIGHTS = 5;
const MAX_RADAR_TOPICS = 6;
const MIN_RADAR_TOPICS = 3;

type ParsedPlan = {
    topics: { name: string; count: number; priority: 'high' | 'medium' | 'low' }[];
    blooms: { name: string; count: number; level: number }[];
    highYield: string[];
    complex: string[];
    steps: { title: string; description: string; icon: string }[];
    mockStrategy: { frequency: string; coverage: string; types: string; review: string };
};

function parseStudyPlan(rawPlan: string, analytics: any): ParsedPlan {
    const topicEntries = Object.entries(analytics?.topic_frequencies || {} as Record<string, number>);
    const topics = topicEntries.map(([name, count]) => ({
        name,
        count: Number(count),
        priority: (Number(count) >= 10 ? 'high' : Number(count) >= 5 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    })).sort((a, b) => Number(b.count) - Number(a.count));

    const bloomsEntries = Object.entries(analytics?.blooms_distribution || {} as Record<string, number>);
    const blooms = bloomsEntries.map(([name, count], idx) => ({
        name,
        count: Number(count),
        level: idx + 1
    })).sort((a, b) => Number(b.level) - Number(a.level));

    const highYield = topics.slice(0, 3).map(t => t.name);
    const complex = blooms.filter(b => b.level >= 4).map(b => b.name);

    return {
        topics,
        blooms,
        highYield,
        complex,
        steps: [
            { title: "Focus on High-Yield Topics", description: "Prioritize your study time on the most frequently appearing topics.", icon: "target" },
            { title: "Practice Complex Problems", description: "Work on Bloom's Level 4+ questions to develop higher-order thinking.", icon: "brain" },
            { title: "Mock Sessions", description: "Take regular timed practice exams to build exam stamina.", icon: "timer" },
        ],
        mockStrategy: {
            frequency: "Every 2-3 days",
            coverage: "Mix of high-yield + complex topics",
            types: "MCQ, Short answer, Essay",
            review: "After each session"
        }
    };
}

export default function GlobalAnalyticsPage() {
    const router = useRouter();
    const [dataState, setDataState] = useState<DataState>("loading");
    const [isGenerating, setIsGenerating] = useState(false);
    const [studyPlan, setStudyPlan] = useState<ParsedPlan | null>(null);
    const [rawPlan, setRawPlan] = useState<string | null>(null);
    const [planError, setPlanError] = useState<string | null>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
    const [activeCourseLabel, setActiveCourseLabel] = useState<string | null>(null);
    const [communityFallback, setCommunityFallback] = useState(false);
    const [userPaperCount, setUserPaperCount] = useState(0);
    const [communityPaperCount, setCommunityPaperCount] = useState(0);

    useEffect(() => {
        async function fetchAnalytics() {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            
            try {
                const papersRes = await fetch(`${API_URL}/api/papers`);
                if (!papersRes.ok) throw new Error("Failed to fetch papers");
                
                const papers = await papersRes.json();
                setUserPaperCount(papers.length || 0);

                if (!papers || papers.length === 0) {
                    setDataState("empty");
                    return;
                }

                const courseId = papers[0].course_id;
                setActiveCourseId(courseId);

                // Surface the real course for the radar header (falls back to code/name/id)
                const course = papers[0]?.courses;
                setActiveCourseLabel(
                    (course?.code ? `${course.code} · ` : "") + (course?.name || courseId)
                );

                const res = await fetch(`${API_URL}/api/analytics/${courseId}`);
                const data = await res.json();
                setAnalytics(data);

                const totalQuestions = data?.total_questions_parsed || 0;

                if (totalQuestions === 0) {
                    setDataState("processing");
                    return;
                }

                if (totalQuestions < MIN_QUESTIONS_FOR_INSIGHTS) {
                    setDataState("insufficient");
                    return;
                }

                setDataState("ready");
            } catch (e) {
                console.error("Analytics fetch failed", e);
                setDataState("empty");
            }
        }
        
        fetchAnalytics();
    }, []);

    const handleGeneratePlan = async () => {
        setIsGenerating(true);
        setPlanError(null);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${API_URL}/api/chat/study-plan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ course_id: activeCourseId || "global" })
            });
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                // Surface the backend's informative message (e.g. "No questions analyzed yet")
                setPlanError(data && typeof data.detail === 'string'
                    ? data.detail
                    : `Plan generation failed (${res.status}). Try again.`);
                return;
            }

            if (data.fallback) {
                setRawPlan(data.plan.raw_text);
                setStudyPlan(parseStudyPlan(data.plan.raw_text, analytics));
            } else if (data.plan) {
                const plan = data.plan;
                const topicEntries = Object.entries(analytics?.topic_frequencies || {} as Record<string, number>);
                const bloomsEntries = Object.entries(analytics?.blooms_distribution || {} as Record<string, number>);
                
                setStudyPlan({
                    topics: topicEntries.map(([name, count]) => ({
                        name,
                        count: Number(count),
                        priority: (Number(count) >= 10 ? 'high' : Number(count) >= 5 ? 'medium' : 'low') as 'high' | 'medium' | 'low'
                    })).sort((a, b) => Number(b.count) - Number(a.count)),
                    blooms: bloomsEntries.map(([name, count], idx) => ({
                        name,
                        count: Number(count),
                        level: idx + 1
                    })).sort((a, b) => Number(b.level) - Number(a.level)),
                    highYield: plan.high_yield_topics || [],
                    complex: plan.complex_areas || [],
                    steps: plan.steps || [],
                    mockStrategy: plan.mock_strategy || {
                        frequency: "Every 2-3 days",
                        coverage: "High-yield + complex topics",
                        types: "MCQ, Short answer, Essay",
                        review: "After each session"
                    }
                });
            }
        } catch (e) {
            console.error(e);
            setPlanError("Could not reach the server. Check your connection and try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const parsedPlan = useMemo(() => {
        if (!studyPlan && rawPlan && analytics) {
            return parseStudyPlan(rawPlan, analytics);
        }
        return studyPlan;
    }, [studyPlan, rawPlan, analytics]);

    // Mastery radar reflects the ACTUAL course: top topics by question frequency,
    // normalized to 0-100 so the polygon shape shows topic balance.
    // Long LLM-extracted topic names are truncated for the 8px axis labels;
    // scaling is relative to the top topic so a course's spread is readable.
    const radarData = useMemo(() => {
        const freqs = (analytics?.topic_frequencies || {}) as Record<string, number>;
        const entries = Object.entries(freqs)
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .slice(0, MAX_RADAR_TOPICS);
        const maxCount = Math.max(1, ...entries.map(([, c]) => Number(c)));
        return entries.map(([topic, count]) => ({
            subject: topic.length > 16 ? topic.slice(0, 15).trim() + "…" : topic,
            A: Math.round((Number(count) / maxCount) * 100),
            fullMark: 100,
        }));
    }, [analytics]);

    if (dataState === "loading") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-sm text-slate-500">Loading analytics...</p>
            </div>
        );
    }

    if (dataState === "empty") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">No Papers Analyzed Yet</h2>
                    <p className="text-slate-500 max-w-md">
                        Upload your first exam papers to begin AI-powered analysis and unlock personalized study insights.
                    </p>
                </div>
                <Link href="/dashboard">
                    <Button className="px-8">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Papers
                    </Button>
                </Link>
            </div>
        );
    }

    if (dataState === "processing") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center relative">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">Processing Exam Papers</h2>
                    <p className="text-slate-500 max-w-md">
                        Our AI is extracting questions and analyzing patterns. This typically takes a few moments per paper.
                    </p>
                </div>
                <div className="text-xs text-slate-400">
                    Analyzing {userPaperCount} paper{userPaperCount !== 1 ? "s" : ""}...
                </div>
            </div>
        );
    }

    const totalQuestions = analytics?.total_questions_parsed || 0;
    const isInsufficient = totalQuestions < MIN_QUESTIONS_FOR_INSIGHTS;

    return (
        <div className="space-y-10 md:space-y-12 relative pb-20">
            <AnimatePresence>
                {parsedPlan && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[250] flex items-start justify-center p-4 bg-black/60 dark:bg-charcoal-950/80 backdrop-blur-xl overflow-y-auto py-8"
                    >
                        <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
                            className="w-full max-w-5xl my-auto"
                        >
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-emerald">
                                            <BrainCircuit className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-[var(--text-primary)]">Your Personal Study Plan</h2>
                                            <p className="text-xs text-slate-500">
                                                Based on {totalQuestions} questions analyzed
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => { setStudyPlan(null); setRawPlan(null); }}
                                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>

                                <StudyPlanMarkdown
                                    doc={{
                                        title: "Personal Study Plan",
                                        subtitle: "SENTINEL Intelligence Core",
                                        totalQuestions,
                                        topics: parsedPlan.topics.map(t => ({ name: t.name, count: t.count })),
                                        blooms: parsedPlan.blooms.map(b => ({ name: b.name, count: b.count })),
                                        highYield: parsedPlan.highYield,
                                        complex: parsedPlan.complex,
                                        steps: parsedPlan.steps.map(s => ({ title: s.title, description: s.description })),
                                        mockStrategy: parsedPlan.mockStrategy,
                                        raw_text: rawPlan ?? undefined,
                                    }}
                                    exportPrefix={`study-plan-${activeCourseId || "global"}`}
                                />

                                <div className="flex flex-wrap items-center justify-center gap-3">
                                    <Button 
                                        onClick={() => { setStudyPlan(null); setRawPlan(null); }}
                                        className="h-12 px-8"
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        Start Studying
                                    </Button>
                                    <Button 
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push('/dashboard/papers')}
                                        className="h-12 px-6 text-xs"
                                    >
                                        <BookOpen className="w-3 h-3 mr-1" />
                                        View My Papers
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 pb-4">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Analytics</span>
                    </div>
                    <h1 className="text-[clamp(1.5rem,4vw,1.875rem)] font-semibold text-[var(--text-primary)]">
                        Academic <span className="text-emerald-500">Analytics</span>
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm max-w-xl">
                        Cross-course performance data and historical exam patterns.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {communityFallback && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs">
                            <Users className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-indigo-500">Community Data Active</span>
                        </div>
                    )}
                    <GlassCard className="p-4 flex items-center gap-4 bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20">
                        <div className="w-10 h-10 rounded bg-emerald-500 flex items-center justify-center shrink-0">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase font-medium">Questions Analyzed</div>
                            <div className="text-lg font-medium text-[var(--text-primary)]">{totalQuestions}</div>
                        </div>
                    </GlassCard>
                </div>
            </header>

            {planError && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-5 bg-red-500/10 border border-red-500/25 rounded-xl"
                >
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-red-500">Strategy generation failed</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{planError}</p>
                    </div>
                    <button 
                        onClick={() => setPlanError(null)}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
                        aria-label="Dismiss error"
                    >
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                </motion.div>
            )}

            {isInsufficient && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap items-center gap-4 p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl"
                >
                    <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                    <div>
                        <h3 className="text-sm font-bold text-amber-500">Not Enough Data for Full Insights</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Upload {MIN_QUESTIONS_FOR_INSIGHTS - totalQuestions} more questions to unlock comprehensive analytics and study plan generation.
                        </p>
                    </div>
                    <Link href="/dashboard" className="ml-auto">
                        <Button size="sm" className="px-4">
                            <Upload className="w-3 h-3 mr-1" />
                            Upload More
                        </Button>
                    </Link>
                </motion.div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <StatMetric label="Questions" value={totalQuestions} icon={Activity} color="#10b981" />
                <StatMetric label="Topics Found" value={Object.keys(analytics?.topic_frequencies || {}).length} icon={TrendingUp} color="#6366f1" />
                <StatMetric label="Your Papers" value={userPaperCount} icon={FileText} color="#f59e0b" />
                <StatMetric label="Community" value={communityPaperCount} icon={Users} color="#8b5cf6" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <GlassCard className="md:col-span-8 p-6 space-y-6" style={{
                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, var(--card-bg) 50%, rgba(16, 185, 129, 0.03) 100%)",
                    borderColor: "rgba(16, 185, 129, 0.12)",
                }}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center border border-[var(--border)]">
                            <TrendUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Question Frequency Trends</h2>
                            <p className="text-[10px] text-[var(--text-muted)]">Topics across years</p>
                        </div>
                    </div>

                    <div className="h-64 w-full relative z-20">
                        {isInsufficient ? (
                            <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                                Upload more papers to see trends
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics?.trends || []}>
                                    <defs>
                                        <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                    <Tooltip
                                        cursor={{ stroke: '#10b981', strokeWidth: 1 }}
                                        contentStyle={{ 
                                            backgroundColor: 'var(--card-bg)', 
                                            borderColor: 'var(--border)', 
                                            borderRadius: '16px', 
                                        }}
                                        itemStyle={{ color: '#10b981', fontSize: '10px', fontWeight: 'bold' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="count" 
                                        stroke="#10b981" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorEmerald)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </GlassCard>

                <GlassCard className="md:col-span-4 p-6" style={{
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, var(--card-bg) 50%, rgba(99, 102, 241, 0.03) 100%)",
                    borderColor: "rgba(99, 102, 241, 0.12)",
                }}>
                    <div className="space-y-4 mb-6">
                        <h2 className="text-xl font-black italic text-slate-900 dark:text-white uppercase tracking-tight">Mastery Radar</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {activeCourseLabel ? `${activeCourseLabel} · ` : ""}Topic Balance
                        </p>
                    </div>

                    <div className="h-48 w-full flex items-center justify-center">
                        {isInsufficient ? (
                            <div className="text-slate-500 text-xs text-center">
                                Need {MIN_QUESTIONS_FOR_INSIGHTS}+ questions for radar analysis
                            </div>
                        ) : radarData.length < MIN_RADAR_TOPICS ? (
                            <div className="text-slate-500 text-xs text-center max-w-[220px]">
                                More topic variety needed — upload papers from different units to map your topic balance.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                                    <PolarGrid stroke="rgba(148, 163, 184, 0.1)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 8, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Mastery" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                                </RadarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </GlassCard>
            </div>

            <GlassCard className="p-6 md:p-8 border-black/5 dark:border-white/10 bg-gradient-to-br from-emerald-500/10 to-transparent flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="flex-1 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-emerald">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">
                            Generate Study Strategy
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {isInsufficient 
                                ? `Upload ${MIN_QUESTIONS_FOR_INSIGHTS - totalQuestions} more questions to unlock AI study planning.`
                                : "Let AI analyze your papers to build a personalized preparation path."
                            }
                        </p>
                    </div>
                </div>
                <Button 
                    onClick={handleGeneratePlan}
                    disabled={isGenerating || isInsufficient}
                    className="px-8 py-4 text-sm font-black rounded-xl w-full md:w-auto"
                >
                    {isGenerating ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing...</>
                    ) : (
                        <><BrainCircuit className="w-4 h-4 mr-2" /> Generate Plan</>
                    )}
                </Button>
            </GlassCard>
        </div>
    );
}

function StatMetric({ label, value, icon: Icon, color }: any) {
    const colorKey = color === "#10b981" ? "emerald" : color === "#6366f1" ? "indigo" : color === "#f59e0b" ? "amber" : "violet";
    
    return (
        <GlassCard glow={colorKey} className="p-3.5 sm:p-4 min-w-0">
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded flex items-center justify-center border border-[var(--border)]" style={{ backgroundColor: `${color}15` }}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
                </div>
            </div>
            
            <div className="space-y-1 min-w-0">
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider truncate">{label}</div>
                <div className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] leading-none truncate" title={String(value?.toLocaleString() ?? 0)}>{value?.toLocaleString() || 0}</div>
            </div>
        </GlassCard>
    );
}