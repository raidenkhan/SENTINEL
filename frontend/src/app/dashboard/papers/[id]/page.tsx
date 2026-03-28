"use client";

import { useEffect, useState, use } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
    ChevronLeft,
    BookOpen,
    Calendar,
    Clock,
    FileText,
    Activity,
    GraduationCap,
    BrainCircuit,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Play,
    Send,
    Loader2,
    ArrowLeft,
    ChevronDown,
    Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

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
            const data = await res.json();
            setStudyPlan(data.plan);
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
            <div className="flex items-center justify-center min-h-screen bg-[#020617]">
                <Loader2 className="w-10 h-10 text-neon-crystal animate-spin" />
            </div>
        );
    }

    if (!data) return <div className="p-10 text-white">Paper not found or connection error.</div>;

    const topicData = Object.entries(data.stats.topic_distribution).map(([name, value]) => ({ name, value }));
    const bloomsData = Object.entries(data.stats.blooms_distribution).map(([name, value]) => ({ name, value }));
    const COLORS = ['#39FF14', '#2563EB', '#D9FF00', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden relative">
            <AnimatePresence>
                {studyPlan && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-slate-900 border border-slate-800 rounded-sm w-full max-w-3xl max-h-[80vh] overflow-y-auto p-10 relative custom-scrollbar shadow-2xl"
                        >
                            <button 
                                onClick={() => setStudyPlan(null)}
                                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
                            >
                                <ChevronDown className="w-6 h-6 rotate-180" />
                            </button>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-sm bg-neon-crystal/10 border border-neon-crystal/20 flex items-center justify-center">
                                    <BrainCircuit className="w-6 h-6 text-neon-crystal" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">PAPER <span className="text-neon-crystal">STRATEGY</span></h2>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">SENTINEL Intelligence Core v4.0</p>
                                </div>
                            </div>
                            <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed space-y-4">
                                {studyPlan.split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                            <button 
                                onClick={() => setStudyPlan(null)}
                                className="w-full py-4 mt-8 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase italic tracking-widest rounded-sm transition-colors"
                            >
                                CLOSE ADVISORY
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Horizontal Breadcrumb Header */}
            <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md z-30">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/papers" className="p-2 hover:bg-slate-800 rounded-sm transition-colors group">
                        <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-neon-crystal" />
                    </Link>
                    <div className="h-6 w-px bg-slate-800" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                            <span>{data.paper.courses.code}</span>
                            <ChevronRight className="w-2 h-2" />
                            <span>{data.paper.year}</span>
                            <ChevronRight className="w-2 h-2" />
                            <span className="text-neon-crystal">{data.paper.semester}</span>
                        </div>
                        <h1 className="text-lg font-black text-white italic tracking-tight uppercase leading-none mt-0.5">
                            {data.paper.courses.name}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button 
                        onClick={handleGenerateStudyPlan}
                        disabled={isGeneratingPlan}
                        className="px-6 py-2.5 bg-neon-crystal text-black font-black text-[10px] uppercase italic tracking-widest rounded-sm shadow-neon-glow hover:scale-[1.05] transition-transform disabled:opacity-50"
                    >
                        {isGeneratingPlan ? "GENERATING ANALYSIS..." : "GENERATE STUDY PLAN"}
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-neon-crystal/10 border border-neon-crystal/20 text-[10px] font-bold text-neon-crystal uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        {data.paper.processing_status}
                    </div>
                </div>
            </nav>

            {/* Split Content Area */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Left Side: Question List (Wider) */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar scroll-smooth">
                    <div className="max-w-4xl mx-auto space-y-4">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-xl font-black italic text-white tracking-tighter">UNITS <span className="text-neon-crystal">HUB</span></h2>
                            <div className="flex gap-2">
                                <div className="px-2 py-1 bg-slate-800/40 rounded-sm border border-slate-700/50 text-[10px] text-slate-500 uppercase font-mono">
                                    Sort: Difficulty
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {data.questions.map((q, i) => (
                                <motion.button
                                    key={q.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    onClick={() => {
                                        setSelectedQuestion(q);
                                        setGradingResult(null);
                                        setUserAnswer("");
                                    }}
                                    className={`group relative text-left p-4 rounded-sm border transition-all duration-300 flex items-start gap-5 ${selectedQuestion?.id === q.id 
                                        ? "bg-neon-crystal/10 border-neon-crystal/40 shadow-neon-glow-sm" 
                                        : "bg-slate-900/40 border-slate-800/60 hover:border-slate-700"
                                    }`}
                                >
                                    <div className="flex-shrink-0 w-12 h-12 rounded-sm bg-slate-800/50 border border-slate-700/50 flex flex-col items-center justify-center group-hover:bg-neon-crystal/10 group-hover:border-neon-crystal/20 transition-colors">
                                        <span className="text-[10px] font-bold text-slate-500 leading-none mb-1">UNIT</span>
                                        <span className="text-sm font-black text-white leading-none">{q.question_number}</span>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-neon-crystal bg-neon-crystal/10 px-1.5 py-0.5 rounded-sm">
                                                {q.blooms_level}
                                            </span>
                                            {q.is_calculation_heavy && (
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-sm">
                                                    CALCULATION
                                                </span>
                                            )}
                                            {q.diagram_url && (
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                                                    <ImageIcon className="w-2 h-2" />
                                                    DIAGRAM
                                                </span>
                                            )}
                                            <span className="text-[9px] font-mono text-slate-600 uppercase ml-auto">{q.topic}</span>
                                        </div>
                                        <p className="text-sm text-slate-300 italic line-clamp-2 leading-relaxed">
                                            "{q.raw_text}"
                                        </p>
                                    </div>
                                    <ChevronRight className={`flex-shrink-0 w-4 h-4 text-slate-700 mt-4 transition-transform ${selectedQuestion?.id === q.id ? "rotate-90 text-neon-crystal" : "group-hover:translate-x-1"}`} />
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Right Side: Quick Analytics Pane (Fixed/Persistent on Large Screens) */}
                <aside className="hidden lg:flex flex-col w-96 border-l border-slate-800/60 bg-slate-900/20 p-8 space-y-8 overflow-y-auto custom-scrollbar">
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-sm bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <GraduationCap className="w-4 h-4 text-blue-400" />
                            </div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-tighter">Bloom's Matrix</h3>
                        </div>
                        <div className="h-48 relative">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={bloomsData} innerRadius={50} outerRadius={65} paddingAngle={4} dataKey="value">
                                        {bloomsData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-sm bg-neon-crystal/10 flex items-center justify-center border border-neon-crystal/20">
                                <BrainCircuit className="w-4 h-4 text-neon-crystal" />
                            </div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-tighter">Core Concepts</h3>
                        </div>
                        <div className="space-y-4">
                            {topicData.slice(0, 4).map((topic, i) => (
                                <div key={topic.name} className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        <span className="truncate max-w-[140px]">{topic.name}</span>
                                        <span className="text-neon-crystal">{topic.value}</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-800 rounded-sm overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${(topic.value / data.stats.total_questions) * 100}%` }} className="h-full bg-neon-crystal" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>

            {/* AI Practice Overlay - remains full screen lab but triggered by selection */}
            <AnimatePresence>
                {selectedQuestion && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedQuestion(null)} className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-[60]" />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 200 }} className="fixed top-0 right-0 w-full md:w-[600px] h-full bg-[#0f172a] border-l border-white/5 z-[70] flex flex-col shadow-2xl">
                            <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-sm bg-neon-crystal/10 flex items-center justify-center border border-neon-crystal/30">
                                        <GraduationCap className="w-6 h-6 text-neon-crystal" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black italic text-white tracking-tighter">SENTINEL <span className="text-neon-crystal underline decoration-neon-crystal decoration-2 underline-offset-8">LABS</span></h2>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">AI Peer Assessment Active</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedQuestion(null)} className="p-3 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white">
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-2 py-0.5 border-l-2 border-neon-crystal">Question Target</div>
                                        <span className="text-[10px] font-mono text-neon-crystal/50">ID: {selectedQuestion.question_number}</span>
                                    </div>
                                    {selectedQuestion.diagram_url && (
                                        <div className="mb-6 rounded-sm overflow-hidden border border-slate-700 bg-black/40 p-2">
                                            <img 
                                                src={selectedQuestion.diagram_url} 
                                                alt={`Diagram for ${selectedQuestion.question_number}`}
                                                className="w-full h-auto object-contain max-h-[300px] hover:scale-[1.5] transition-transform duration-500 cursor-zoom-in"
                                            />
                                            <div className="text-[9px] text-slate-500 mt-2 text-center uppercase font-bold tracking-widest">
                                                Diagram Source: Sentinel Asset Hub
                                            </div>
                                        </div>
                                    )}
                                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-sm italic text-sm text-slate-300 leading-relaxed shadow-inner">
                                        "{selectedQuestion.raw_text}"
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Attempt</div>
                                    <textarea 
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        placeholder="Formulate your answer here using course keywords..."
                                        className="w-full h-48 bg-slate-900 border border-white/5 rounded-sm p-8 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neon-crystal transition-all resize-none shadow-2xl placeholder:text-slate-700"
                                    />
                                    <button 
                                        onClick={handleGrade}
                                        disabled={isGrading || !userAnswer.trim()}
                                        className="w-full py-5 bg-neon-crystal/10 hover:bg-neon-crystal text-neon-crystal hover:text-black border border-neon-crystal/20 rounded-sm font-black italic text-sm tracking-widest uppercase transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        {isGrading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                DECRYPTING PERFORMANCE...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                SUBMIT ASSESSMENT
                                            </>
                                        )}
                                    </button>
                                </section>

                                {gradingResult && (
                                    <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 bg-transparent border border-neon-crystal/20 p-8 rounded-sm relative overflow-hidden ring-1 ring-white/5">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <div className="w-14 h-14 bg-neon-crystal text-black rounded-sm flex items-center justify-center font-black text-xl shadow-neon-glow">AI</div>
                                        </div>
                                        <div className="text-[10px] font-bold text-neon-crystal uppercase tracking-widest mb-6">Evaluation Feedback</div>
                                        <div className="text-sm text-slate-300 leading-loose whitespace-pre-wrap font-medium">
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

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
    return (
        <div className="bg-slate-800/40 rounded-sm p-4 border border-slate-700/50 flex items-center gap-4 min-w-[120px]">
            <div className="w-10 h-10 rounded-sm bg-neon-crystal/10 flex items-center justify-center border border-neon-crystal/20">
                <Icon className="w-5 h-5 text-neon-crystal" />
            </div>
            <div>
                <div className="text-xl font-black text-white leading-none">{value}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{label}</div>
            </div>
        </div>
    );
}
