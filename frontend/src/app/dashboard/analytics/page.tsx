"use client";

import { useEffect, useState } from "react";
import {
    Activity,
    BarChart3,
    TrendingUp,
    Target,
    Zap,
    BookOpen,
    Clock,
    Award,
    ChevronUp,
    ChevronDown,
    BrainCircuit,
    Layers,
    Moon,
    Sun
} from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from "recharts";

const performanceData = [
    { subject: 'Memory Management', A: 85, fullMark: 100 },
    { subject: 'CPU Scheduling', A: 70, fullMark: 100 },
    { subject: 'Concurrency', A: 90, fullMark: 100 },
    { subject: 'File Systems', A: 65, fullMark: 100 },
    { subject: 'Virtualization', A: 80, fullMark: 100 },
];

const trendData = [
    { name: 'Mon', score: 45 },
    { name: 'Tue', score: 52 },
    { name: 'Wed', score: 48 },
    { name: 'Thu', score: 70 },
    { name: 'Fri', score: 65 },
    { name: 'Sat', score: 85 },
    { name: 'Sun', score: 92 },
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
                // Determine the most relevant course to display
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
                body: JSON.stringify({ course_id: "global" })
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
            <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
                <Activity className="w-10 h-10 text-neon-crystal animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 bg-[var(--background)] text-[var(--foreground)] min-h-screen relative">
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
                            className="bg-[var(--card-bg)] border border-[var(--border)] rounded-sm w-full max-w-3xl max-h-[80vh] overflow-y-auto p-10 relative custom-scrollbar shadow-2xl"
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
                                    <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">AI <span className="text-neon-crystal">STUDY STRATEGY</span></h2>
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

            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2 font-mono text-[10px] text-neon-crystal uppercase tracking-[0.3em]">
                        <div className="w-1.5 h-1.5 rounded-sm bg-neon-crystal" />
                        Intelligence core active
                    </div>
                    <h1 className="text-5xl font-black text-[var(--text-primary)] italic tracking-tighter uppercase leading-none">
                        ACADEMIC <span className="text-neon-crystal shadow-neon-glow">ANALYTICS</span>
                    </h1>
                    <p className="text-[var(--text-muted)] mt-3 max-w-lg text-sm leading-relaxed">
                        Cross-course performance tracking and AI-driven readiness assessment based on your vaulted exam papers.
                    </p>
                </div>

                <div className="flex gap-4 items-center">
                    <ThemeToggle />
                    <div className="bg-[var(--card-bg)] border border-[var(--border)] p-4 rounded-sm backdrop-blur-md flex items-center gap-4">
                        <Award className="w-8 h-8 text-neon-crystal opacity-80" />
                        <div>
                            <div className="text-[10px] text-[var(--text-muted)] uppercase font-black">Rank</div>
                            <div className="text-xl font-black text-[var(--text-primary)] italic">SENTINEL-TOP</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Stats Grid - Compact Horizontal Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatMetric label="Parsed" value={analytics?.total_questions_parsed?.toLocaleString() || "0"} trend="+12%" up icon={Layers} color="#39FF14" />
                <StatMetric label="Readiness" value="76%" trend="+4.5%" up icon={Target} color="#2563EB" />
                <StatMetric label="AI Sessions" value="24" trend="-2" icon={BrainCircuit} color="#F59E0B" />
                <StatMetric label="Study Hours" value="142" trend="+18.2%" up icon={Clock} color="#8B5CF6" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Readiness Trend Chart */}
                <section className="lg:col-span-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-sm p-8 space-y-8 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-neon-crystal/5 blur-[100px] -mr-32 -mt-32" />

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-neon-crystal" />
                            <h2 className="text-xl font-black italic text-[var(--text-primary)] tracking-tight uppercase">Performance <span className="text-neon-crystal">Velocity</span></h2>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-neon-crystal/10 border border-neon-crystal/20 text-[10px] font-bold text-neon-crystal rounded-sm">Weekly</button>
                            <button className="px-3 py-1 text-[10px] font-bold text-slate-500 hover:text-white transition-colors">Monthly</button>
                        </div>
                    </div>

                    <div className="h-52 w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics?.trends || trendData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#39FF14" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis dataKey={analytics?.trends ? "year" : "name"} stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                                />
                                <Area type="monotone" dataKey={analytics?.trends ? "count" : "score"} stroke="#39FF14" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Subject Mastery Radar */}
                <section className="bg-[var(--card-bg)] border border-[var(--border)] rounded-sm p-8 space-y-8 backdrop-blur-xl relative overflow-hidden group">
                    <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-black italic text-[var(--text-primary)] tracking-tight uppercase">Mastery <span className="text-blue-500">Radar</span></h2>
                    </div>

                    <div className="h-52 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                                <PolarGrid stroke="#1e293b" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 8, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Mastery" dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                        <MasteryItem label="High Yield" value={analytics?.topic_insights?.[0]?.topic || "Calculating..."} color="#39FF14" />
                        <MasteryItem label="Weak Areas" value="Concurrency" color="#EF4444" />
                    </div>
                </section>
            </div>

            {/* NEW: High-Yield Topic Analysis (Academic Rigor) */}
            <section className="bg-[var(--card-bg)] border border-[var(--border)] rounded-sm p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-neon-crystal" />
                        <h2 className="text-xl font-black italic text-[var(--text-primary)] tracking-tight uppercase">Topic <span className="text-neon-crystal">Importance Index</span></h2>
                    </div>
                    <div className="hidden sm:block text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest bg-[var(--foreground)]/5 px-3 py-1 rounded-full">
                        Weighted Decay Algorithm v1.0
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {analytics?.topic_insights?.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-sm hover:border-neon-crystal/30 transition-all group relative overflow-hidden">
                             {/* Confidence mini-bar */}
                            <div className="absolute bottom-0 left-0 h-1 bg-neon-crystal/40 group-hover:bg-neon-crystal transition-colors" style={{ width: `${item.confidence * 100}%` }} />
                            
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase italic leading-tight max-w-[70%] truncate">{item.topic}</h3>
                                <div className="text-right">
                                    <div className="text-[8px] text-[var(--text-muted)] font-black uppercase">Score</div>
                                    <div className="text-sm font-black text-neon-crystal leading-none">{item.importance}</div>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center gap-4 mt-1">
                                <div>
                                    <div className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-tighter mb-0.5">Confidence</div>
                                    <div className="text-xs font-bold text-[var(--text-primary)] leading-none">{(item.confidence * 100).toFixed(0)}%</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[7px] text-[var(--text-muted)] font-black uppercase tracking-tighter mb-0.5">Frequencies</div>
                                    <div className="text-xs font-bold text-[var(--text-primary)] leading-none">{item.total_frequency}</div>
                                </div>
                            </div>
                        </div>
                    )) || (
                        <div className="col-span-full py-20 text-center text-[var(--text-muted)] font-mono text-xs italic tracking-widest uppercase">
                            No analytical data available. Upload more papers to activate indices.
                        </div>
                    )}
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Topic Breakdown Bar Chart */}
                <section className="md:col-span-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-sm p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-yellow-500" />
                        <h2 className="text-xl font-black italic text-[var(--text-primary)] tracking-tight uppercase">Question <span className="text-yellow-500">Intensity</span></h2>
                    </div>

                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis dataKey="subject" stroke="#64748b" fontSize={8} axisLine={false} tickLine={false} hide />
                                <YAxis axisLine={false} tickLine={false} fontSize={10} stroke="#64748b" />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                                <Bar dataKey="A" fill="#D9FF00" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Quick Tips / AI Insights */}
                <section className="bg-neon-crystal/5 border border-neon-crystal/10 rounded-sm p-8 space-y-6 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                        <BrainCircuit className="w-6 h-6 text-neon-crystal" />
                        <h2 className="font-black text-neon-crystal italic uppercase tracking-tighter text-lg">AI ADVISORY</h2>
                    </div>

                    <div className="space-y-4">
                        <InsightItem text="Your performance in 'Concurrency' is outstanding. Focus more on 'File Systems' today." />
                        <InsightItem text="Historical trends suggest you score higher on morning AI practice sessions." />
                        <InsightItem text="High concentration of Bloom's Level 4 questions detected in your last 3 uploads." />
                    </div>

                    <button 
                        onClick={handleGeneratePlan}
                        disabled={isGenerating}
                        className="w-full py-4 mt-4 bg-neon-crystal text-black font-black text-xs uppercase italic tracking-widest rounded-sm shadow-neon-glow hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? "ANALYZING PERFORMANCE..." : "GENERATE FULL STUDY PLAN"}
                    </button>
                </section>
            </div>
        </div>
    );
}

function StatMetric({ label, value, trend, up, icon: Icon, color }: any) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="glass-card p-4 flex items-center gap-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-sm min-h-[80px]"
        >
            <div className="w-10 h-10 rounded-sm flex items-center justify-center border border-white/5 bg-white/5 shrink-0">
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
            
            <div className="flex flex-col min-w-0">
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate">{label}</div>
                <div className="flex items-end gap-2">
                    <div className="text-xl font-black text-[var(--text-primary)] italic tracking-tighter leading-none">{value}</div>
                    <div className={`flex items-center text-[9px] font-bold ${up ? 'text-neon-crystal' : 'text-red-500'}`}>
                        {up ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                        {trend}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function MasteryItem({ label, value, color }: any) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: color }} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">{label}</span>
            </div>
            <span className="text-sm font-black text-white">{value}</span>
        </div>
    );
}

function InsightItem({ text }: { text: string }) {
    return (
        <div className="flex gap-4 p-4 rounded-sm bg-[var(--card-bg)] border border-[var(--border)] hover:border-neon-crystal/20 transition-all group">
            <div className="w-1 h-full bg-neon-crystal/20 group-hover:bg-neon-crystal transition-colors rounded-sm shrink-0" />
            <p className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-primary)] leading-relaxed font-medium">
                {text}
            </p>
        </div>
    );
}
