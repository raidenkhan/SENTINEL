"use client";

import { useEffect, useState, use } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
    ChevronLeft, BookOpen, Calendar, Clock, FileText, Activity, GraduationCap,
    BrainCircuit, CheckCircle2, AlertCircle, ChevronRight, Play, Send, Loader2,
    ArrowLeft, ChevronDown, Image as ImageIcon, Binary, Sparkles, Zap, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { GlassCard } from "@/components/landing/GlassCard";
import { StudyPlanMarkdown } from "@/components/dashboard/StudyPlanMarkdown";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Question {
    id: string;
    question_number: string;
    raw_text: string;
    topic: string;
    sub_topic: string;
    blooms_level: string;
    is_calculation_heavy: boolean;
    diagram_url?: string;
}

interface PaperAnalytics {
    paper: any;
    stats: {
        total_questions: number;
        topic_distribution: Record<string, number>;
        blooms_distribution: Record<string, number>;
        calculation_heavy_percentage: number;
    };
    questions: Question[];
}

interface StudyPlan {
    high_yield_topics?: string[];
    complex_areas?: string[];
    steps?: { title: string; description: string }[];
    mock_strategy?: { frequency?: string; coverage?: string; types?: string; review?: string };
    raw_text?: string;
}

// One accent color per Bloom's level so the feed reads at a glance.
const BLOOM_STYLES: Record<string, { badge: string; chip: string; bar: string }> = {
    Remember:   { badge: "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400",  chip: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25",   bar: "bg-emerald-500" },
    Understand: { badge: "bg-sky-500/10 border-sky-500/25 text-sky-600 dark:text-sky-400",               chip: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/25",               bar: "bg-sky-500" },
    Apply:      { badge: "bg-indigo-500/10 border-indigo-500/25 text-indigo-600 dark:text-indigo-400",   chip: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/25",       bar: "bg-indigo-500" },
    Analyze:    { badge: "bg-violet-500/10 border-violet-500/25 text-violet-600 dark:text-violet-400",   chip: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/25",       bar: "bg-violet-500" },
    Evaluate:   { badge: "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400",       chip: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25",           bar: "bg-amber-500" },
    Create:     { badge: "bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400",           chip: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25",               bar: "bg-rose-500" },
};

export default function PaperDeepDivePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const { data: data = null, isLoading } = useSWR<PaperAnalytics>(
        id ? `${API_URL}/api/papers/${id}/analytics` : null,
        fetcher
    );

    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [userAnswer, setUserAnswer] = useState("");
    const [gradingResult, setGradingResult] = useState<any>(null);
    const [isGrading, setIsGrading] = useState(false);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
    const [planError, setPlanError] = useState<string | null>(null);

    const [aiAnswer, setAiAnswer] = useState<string | null>(null);
    const [isAnswering, setIsAnswering] = useState(false);
    const [answerError, setAnswerError] = useState<string | null>(null);

    const handleAiAnswer = async () => {
        if (!selectedQuestion) return;
        setIsAnswering(true);
        setAnswerError(null);
        setAiAnswer(null);
        try {
            const res = await fetch(`${API_URL}/api/chat/answer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question_id: selectedQuestion.id, paper_id: id })
            });
            const resData = await res.json().catch(() => null);
            if (!res.ok) {
                setAnswerError(resData && typeof resData.detail === "string"
                    ? resData.detail
                    : `AI explain failed (${res.status}). Try again.`);
                return;
            }
            if (!resData?.answer?.trim()) {
                setAnswerError("The AI returned an empty response. Try again.");
                return;
            }
            setAiAnswer(resData.answer);
        } catch (e) {
            console.error(e);
            setAnswerError("Could not reach the server. Check your connection and try again.");
        } finally {
            setIsAnswering(false);
        }
    };

    const handleGenerateStudyPlan = async () => {
        setIsGeneratingPlan(true);
        setPlanError(null);
        try {
            const res = await fetch(`${API_URL}/api/chat/study-plan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paper_id: id })
            });
            const resData = await res.json().catch(() => null);
            if (!res.ok) {
                // Surface the backend's informative message (e.g. "No questions analyzed yet")
                setPlanError(resData && typeof resData.detail === 'string'
                    ? resData.detail
                    : `Strategy generation failed (${res.status}). Try again.`);
                return;
            }
            if (resData?.plan) {
                setStudyPlan(resData.plan);
            }
        } catch (e) {
            console.error(e);
            setPlanError("Could not reach the server. Check your connection and try again.");
        } finally {
            setIsGeneratingPlan(false);
        }
    };

    const handleGrade = async () => {
        if (!selectedQuestion || !userAnswer.trim()) return;
        setIsGrading(true);
        setGradingResult(null);

        try {
            const res = await fetch(`${API_URL}/api/chat/grade`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    paper_id: id,
                    question_id: selectedQuestion.id,
                    answer: userAnswer
                })
            });
            if (res.ok) {
                const result = await res.json();
                setGradingResult(result.result);
            }
        } catch (err) {
            console.error("Grading failed", err);
        } finally {
            setIsGrading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Activity className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (!data) return <div className="p-10 text-[var(--text-primary)]">Neural data not found.</div>;

    const topicData = Object.entries(data.stats.topic_distribution).map(([name, value]) => ({ name, value }));
    const bloomsData = Object.entries(data.stats.blooms_distribution).map(([name, value]) => ({ name, value }));
    const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6'];

    return (
        <div className="flex flex-col h-screen -m-8 overflow-hidden bg-[var(--background)] transition-colors duration-500">
            {/* Study Plan Modal (Obsidian Sheet) */}
            <AnimatePresence>
                {studyPlan && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                        className="fixed inset-0 z-[250] flex items-start justify-center p-4 bg-black/60 dark:bg-obsidian-950/80 backdrop-blur-xl"
                    >
                        <GlassCard className="w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 md:p-12 my-auto relative bg-white/95 dark:bg-obsidian-900/90 rounded-2xl">
                            <button onClick={() => setStudyPlan(null)} className="absolute top-8 right-8 text-slate-400 hover:text-emerald-500 transition-colors p-2">
                                <ChevronDown className="w-8 h-8 rotate-180" />
                            </button>
                            <div className="flex items-center gap-5 mb-10">
                                <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center shadow-emerald">
                                    <BrainCircuit className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-[clamp(1.5rem,4vw,1.875rem)] font-black italic text-slate-900 dark:text-white uppercase tracking-tighter">PAPER_ADVISORY</h2>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-widest mt-1">Intelligence Core Active</p>
                                </div>
                            </div>
                            <StudyPlanMarkdown
                                doc={{
                                    title: `${data.paper.courses.code} — ${data.paper.courses.name}`,
                                    subtitle: "PAPER ADVISORY",
                                    totalQuestions: data.stats.total_questions,
                                    topics: topicData.map(t => ({ name: t.name, count: t.value })),
                                    blooms: bloomsData.map(b => ({ name: b.name, count: b.value })),
                                    highYield: studyPlan.high_yield_topics || [],
                                    complex: studyPlan.complex_areas || [],
                                    steps: studyPlan.steps || [],
                                    mockStrategy: studyPlan.mock_strategy || {},
                                    raw_text: studyPlan.raw_text,
                                }}
                                exportPrefix={`paper-advisory-${id}`}
                            />
                            <Button onClick={() => setStudyPlan(null)} className="w-full h-14 mt-10 rounded-xl font-black">CLOSE SESSION</Button>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Header/Navigation */}
            <nav className="flex items-center justify-between px-10 py-6 border-b border-black/5 dark:border-white/5 bg-[var(--nav-bg)] backdrop-blur-3xl z-40">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard/papers" className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-black/5 dark:hover:border-white/10 group">
                        <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-emerald-500" />
                    </Link>
                    <div className="h-10 w-px bg-black/5 dark:bg-white/10" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                            <span>{data.paper.courses.code}</span>
                            <ChevronRight className="w-2 h-2" />
                            <span className="text-emerald-500">{data.paper.year} SCAN</span>
                        </div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none mt-1">
                            {data.paper.courses.name}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-6 flex-wrap justify-end">
                    <Button 
                        onClick={handleGenerateStudyPlan}
                        disabled={isGeneratingPlan}
                        className="rounded-lg h-12 px-8 font-black text-[10px]"
                    >
                        {isGeneratingPlan ? "ANALYZING..." : "GENERATE STRATEGY"}
                    </Button>
                    {planError ? (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-[10px] font-black text-red-500 uppercase tracking-widest leading-none max-w-[220px]" title={planError}>
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{planError}</span>
                        </div>
                    ) : (
                        <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">
                            <Zap className="w-3.5 h-3.5" />
                            SYNCED
                        </div>
                    )}
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Scrollable Question Feed */}
                <main className="flex-1 overflow-y-auto p-10 custom-scrollbar scroll-smooth">
                    <div className="max-w-4xl mx-auto space-y-10">
                        <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                            <div>
                                <h2 className="text-2xl font-black italic text-slate-900 dark:text-white tracking-tighter uppercase leading-none">UNITS_HUB</h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Found {data.questions.length} logical entities</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 pb-20">
                            {data.questions.map((q, i) => {
                                const bloom = BLOOM_STYLES[q.blooms_level] ?? BLOOM_STYLES.Remember;
                                return (
                                    <motion.button
                                        key={q.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                        onClick={() => {
                                            setSelectedQuestion(q);
                                            setGradingResult(null);
                                            setUserAnswer("");
                                            setAiAnswer(null);
                                            setAnswerError(null);
                                        }}
                                        className="w-full text-left focus:outline-none group"
                                    >
                                        <GlassCard className={cn(
                                            "relative overflow-hidden p-5 md:p-6 flex items-start gap-5 border-black/5 dark:border-white/10 transition-all duration-300",
                                            "hover:-translate-y-0.5 hover:border-emerald-500/30",
                                            selectedQuestion?.id === q.id ? "bg-emerald-500/[0.06] border-emerald-500/40" : ""
                                        )}>
                                            {/* Bloom-colored accent bar */}
                                            <span className={cn("absolute left-0 top-0 bottom-0 w-1 opacity-70 group-hover:opacity-100 transition-opacity", bloom.bar)} />

                                            <div className={cn(
                                                "flex-shrink-0 w-12 h-12 rounded-xl border flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-105",
                                                bloom.badge
                                            )}>
                                                <span className="text-[8px] font-black opacity-70 leading-none mb-0.5 uppercase">Q</span>
                                                <span className="text-base font-display font-bold leading-none">{String(q.question_number).replace(/^Q/i, "")}</span>
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-2.5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border", bloom.chip)}>
                                                        {q.blooms_level}
                                                    </span>
                                                    {q.is_calculation_heavy && (
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20">
                                                            CALCULATION
                                                        </span>
                                                    )}
                                                    {q.diagram_url && (
                                                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-sky-500 bg-sky-500/10 px-2 py-1 rounded-full border border-sky-500/20">
                                                            <ImageIcon className="w-3 h-3" /> DIAGRAM
                                                        </span>
                                                    )}
                                                    <span className="ml-auto text-[9px] font-mono font-bold text-slate-400 dark:text-slate-600 uppercase truncate max-w-[45%]">{q.topic}</span>
                                                </div>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">
                                                    {q.raw_text}
                                                </p>
                                            </div>

                                            <ChevronRight className={cn(
                                                "flex-shrink-0 w-5 h-5 text-slate-400 mt-5 transition-all",
                                                selectedQuestion?.id === q.id ? "rotate-90 text-emerald-500 scale-110" : "group-hover:translate-x-1 group-hover:text-emerald-500"
                                            )} />
                                        </GlassCard>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </main>

                {/* Right Side: Quick Analytics Pane */}
                <aside className="hidden lg:flex flex-col w-[380px] border-l border-black/5 dark:border-white/5 bg-[var(--nav-bg)] p-10 space-y-12 overflow-y-auto custom-scrollbar">
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-indigo-500/5">
                                <GraduationCap className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Bloom's Matrix</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Cognitive Distribution</p>
                            </div>
                        </div>
                        <div className="h-56 relative bg-slate-50 dark:bg-white/2 rounded-xl border border-black/5 dark:border-white/5 p-4 flex items-center justify-center">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={bloomsData} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                                        {bloomsData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(2,2,3,0.95)', border: 'none', borderRadius: '16px', fontSize: '10px', backdropFilter: 'blur(10px)' }}
                                        itemStyle={{ color: '#fff', fontWeight: '900' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-emerald">
                                <BrainCircuit className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Knowledge Density</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Topic Saturation</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {topicData.slice(0, 5).map((topic, i) => (
                                <div key={topic.name} className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">
                                        <span className="truncate max-w-[180px]">{topic.name}</span>
                                        <span className="text-emerald-500">{topic.value} UNITs</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${(topic.value / data.stats.total_questions) * 100}%` }} className="h-full bg-emerald-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>

            {/* NEURAL LAB OVERLAY (The Side Panel) */}
            <AnimatePresence>
                {selectedQuestion && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                            onClick={() => setSelectedQuestion(null)} 
                            className="fixed inset-0 bg-black/60 dark:bg-obsidian-950/80 backdrop-blur-xl z-[60]" 
                        />
                        <motion.div 
                            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} 
                            transition={{ type: "spring", damping: 30, stiffness: 200 }} 
                            className="fixed top-0 right-0 w-full md:w-[680px] h-full bg-white dark:bg-obsidian-900 border-l border-black/5 dark:border-white/10 z-[70] flex flex-col shadow-24 overflow-hidden"
                        >
                            {/* Scanning Header */}
                            <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between relative bg-slate-50 dark:bg-white/2">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/20 overflow-hidden">
                                    <motion.div 
                                        animate={{ x: ["-100%", "100%"] }} 
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="h-full w-40 bg-emerald-500 shadow-emerald" 
                                    />
                                </div>
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center shadow-emerald group">
                                        <GraduationCap className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
                                    </div>
                                    <div>
                                        <h2 className="text-[clamp(1.5rem,4vw,1.875rem)] font-black italic text-slate-900 dark:text-white tracking-tighter uppercase leading-none">SENTINEL_LABS</h2>
                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mt-1">Peer Assessment Logic Active</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedQuestion(null)} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all">
                                    <ChevronRight className="w-8 h-8 text-slate-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Question Source</h3>
                                    </div>
                                    {selectedQuestion.diagram_url && (
                                        <GlassCard className="mb-6 rounded-xl overflow-hidden border-black/5 dark:border-white/10 bg-slate-50 dark:bg-black/40 p-4 group">
                                             <div className="relative">
                                                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
                                                <img 
                                                    src={selectedQuestion.diagram_url} 
                                                    alt={`Unit ${selectedQuestion.question_number}`}
                                                    className="w-full h-auto object-contain max-h-[350px] relative z-0 transition-all duration-700 group-hover:scale-[1.05]"
                                                />
                                             </div>
                                            <div className="text-[10px] text-slate-500 font-black mt-4 text-center uppercase tracking-widest opacity-60">
                                                SCAN_SOURCE: SECURE_ASSET_HUB
                                            </div>
                                        </GlassCard>
                                    )}
                                    <div className="bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 p-8 rounded-xl italic text-base text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm font-medium">
                                        "{selectedQuestion.raw_text}"
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">AI Model Answer</h3>
                                    </div>
                                    <Button
                                        onClick={handleAiAnswer}
                                        disabled={isAnswering}
                                        className="w-full h-14 rounded-xl font-black text-sm shadow-emerald"
                                    >
                                        {isAnswering ? (
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                DECRYPTING MODEL ANSWER...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Sparkles className="w-5 h-5" />
                                                EXPLAIN WITH AI
                                            </div>
                                        )}
                                    </Button>
                                    {answerError && (
                                        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-[10px] font-black text-red-500 uppercase tracking-widest leading-relaxed">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span>{answerError}</span>
                                        </div>
                                    )}
                                    {aiAnswer && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                                                    <Sparkles className="w-3 h-3" /> Syllabus-aware
                                                </span>
                                                <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                    {data.paper.courses.code} · related questions embedded
                                                </span>
                                            </div>
                                            <StudyPlanMarkdown
                                                doc={{
                                                    title: `${data.paper.courses.code} — ${data.paper.courses.name}`,
                                                    subtitle: "AI MODEL ANSWER",
                                                    totalQuestions: 0,
                                                    topics: [],
                                                    blooms: [],
                                                    highYield: [],
                                                    complex: [],
                                                    steps: [],
                                                    mockStrategy: {},
                                                    raw_text: aiAnswer,
                                                }}
                                                exportPrefix={`answer-${selectedQuestion.question_number.replace(/[^a-zA-Z0-9]/g, "-")}`}
                                            />
                                        </div>
                                    )}
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Your Neural Input</h3>
                                    </div>
                                    <textarea 
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        placeholder="Establish your answer pattern here..."
                                        className="w-full h-56 bg-slate-50 dark:bg-white/2 border border-black/5 dark:border-white/5 rounded-xl p-8 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none font-medium placeholder:text-slate-400"
                                    />
                                    <Button 
                                        onClick={handleGrade}
                                        disabled={isGrading || !userAnswer.trim()}
                                        className="w-full h-16 rounded-xl font-black text-base shadow-emerald"
                                    >
                                        {isGrading ? (
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                DECRYPTING PERFORMANCE...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Send className="w-6 h-6" />
                                                SUBMIT FOR ANALYSIS
                                            </div>
                                        )}
                                    </Button>
                                </section>

                                {gradingResult && (
                                    <motion.section 
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                                        className="bg-emerald-500/5 dark:bg-emerald-500/2 border border-emerald-500/20 p-10 rounded-2xl relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-10">
                                            <Cpu className="w-20 h-20 text-emerald-500" />
                                        </div>
                                        <div className="flex items-center gap-3 mb-8">
                                            <Sparkles className="w-5 h-5 text-emerald-500" />
                                            <h3 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">AI Performance Feedback</h3>
                                        </div>
                                        <div className="text-base text-slate-700 dark:text-slate-300 leading-loose whitespace-pre-wrap font-medium">
                                            {typeof gradingResult === 'string' ? gradingResult : JSON.stringify(gradingResult, null, 2)}
                                        </div>
                                    </motion.section>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

