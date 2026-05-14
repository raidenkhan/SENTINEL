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
    const [studyPlan, setStudyPlan] = useState<string | null>(null);

    const handleGenerateStudyPlan = async () => {
        setIsGeneratingPlan(true);
        try {
            const res = await fetch(`${API_URL}/api/chat/study-plan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paper_id: id })
            });
            const resData = await res.json();
            setStudyPlan(resData.plan);
        } catch (e) {
            console.error(e);
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
                        className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 dark:bg-obsidian-950/80 backdrop-blur-xl"
                    >
                        <GlassCard className="w-full max-w-3xl max-h-[85vh] overflow-y-auto p-12 relative bg-white/95 dark:bg-obsidian-900/90 rounded-[2.5rem]">
                            <button onClick={() => setStudyPlan(null)} className="absolute top-8 right-8 text-slate-400 hover:text-emerald-500 transition-colors p-2">
                                <ChevronDown className="w-8 h-8 rotate-180" />
                            </button>
                            <div className="flex items-center gap-5 mb-10">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-emerald">
                                    <BrainCircuit className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter">PAPER_ADVISORY</h2>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-widest mt-1">Intelligence Core Active</p>
                                </div>
                            </div>
                            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                {studyPlan.split('\n').map((line, i) => <p key={i} className="mb-4">{line}</p>)}
                            </div>
                            <Button onClick={() => setStudyPlan(null)} className="w-full h-14 mt-10 rounded-2xl font-black">CLOSE SESSION</Button>
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

                <div className="flex items-center gap-6">
                    <Button 
                        onClick={handleGenerateStudyPlan}
                        disabled={isGeneratingPlan}
                        className="rounded-xl h-12 px-8 font-black text-[10px]"
                    >
                        {isGeneratingPlan ? "ANALYZING..." : "GENERATE STRATEGY"}
                    </Button>
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">
                        <Zap className="w-3.5 h-3.5" />
                        SYNCED
                    </div>
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

                        <div className="grid grid-cols-1 gap-6 pb-20">
                            {data.questions.map((q, i) => (
                                <motion.button
                                    key={q.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => {
                                        setSelectedQuestion(q);
                                        setGradingResult(null);
                                        setUserAnswer("");
                                    }}
                                    className="w-full text-left focus:outline-none"
                                >
                                    <GlassCard className={cn(
                                        "p-6 flex items-start gap-6 border-black/5 dark:border-white/10 group hover:border-emerald-500/30 transition-all duration-300",
                                        selectedQuestion?.id === q.id ? "bg-emerald-500/10 border-emerald-500/40" : ""
                                    )}>
                                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col items-center justify-center transition-all group-hover:scale-105 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20">
                                            <span className="text-[9px] font-black text-slate-400 group-hover:text-emerald-500 leading-none mb-1">UNIT</span>
                                            <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{q.question_number}</span>
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                                                    {q.blooms_level}
                                                </span>
                                                {q.is_calculation_heavy && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20">
                                                        CALCULATION
                                                    </span>
                                                )}
                                                <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-600 uppercase ml-auto">{q.topic}</span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic line-clamp-3 leading-relaxed">
                                                "{q.raw_text}"
                                            </p>
                                        </div>
                                        <ChevronRight className={cn(
                                            "flex-shrink-0 w-5 h-5 text-slate-400 mt-6 transition-all",
                                            selectedQuestion?.id === q.id ? "rotate-90 text-emerald-500 scale-110" : "group-hover:translate-x-1 group-hover:text-emerald-500"
                                        )} />
                                    </GlassCard>
                                </motion.button>
                            ))}
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
                        <div className="h-56 relative bg-slate-50 dark:bg-white/2 rounded-[2rem] border border-black/5 dark:border-white/5 p-4 flex items-center justify-center">
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
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-emerald group">
                                        <GraduationCap className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black italic text-slate-900 dark:text-white tracking-tighter uppercase leading-none">SENTINEL_LABS</h2>
                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mt-1">Peer Assessment Logic Active</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedQuestion(null)} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl transition-all">
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
                                        <GlassCard className="mb-6 rounded-3xl overflow-hidden border-black/5 dark:border-white/10 bg-slate-50 dark:bg-black/40 p-4 group">
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
                                    <div className="bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 p-8 rounded-[2rem] italic text-base text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm font-medium">
                                        "{selectedQuestion.raw_text}"
                                    </div>
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
                                        className="w-full h-56 bg-slate-50 dark:bg-white/2 border border-black/5 dark:border-white/5 rounded-[2rem] p-8 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none font-medium placeholder:text-slate-400"
                                    />
                                    <Button 
                                        onClick={handleGrade}
                                        disabled={isGrading || !userAnswer.trim()}
                                        className="w-full h-16 rounded-[1.5rem] font-black text-base shadow-emerald"
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
                                        className="bg-emerald-500/5 dark:bg-emerald-500/2 border border-emerald-500/20 p-10 rounded-[2.5rem] relative overflow-hidden"
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
