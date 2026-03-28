"use client";

import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import {
    FileText,
    Search,
    Trash2,
    ExternalLink,
    Calendar,
    BookOpen,
    Clock,
    CheckCircle2,
    Loader2,
    AlertCircle,
    ChevronRight,
    Filter,
    BarChart3
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";

// Removed date-fns to avoid dependency issues, using native Intl
const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(dateString));
};

interface Paper {
    id: string;
    course_id: string;
    year: number;
    semester: string;
    file_url: string;
    processing_status: string;
    upload_date: string;
    courses: {
        name: string;
        code: string;
        department: string;
    };
}

export default function PapersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterYear, setFilterYear] = useState<string>("All Years");

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const { data: papers = [], isLoading } = useSWR<Paper[]>(`${API_URL}/api/papers`, fetcher);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this paper and all its analyzed data?")) return;

        try {
            const res = await fetch(`${API_URL}/api/papers/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                mutate(`${API_URL}/api/papers`);
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const filteredPapers = papers.filter((p) => {
        const matchesSearch =
            p.courses.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.courses.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesYear = filterYear === "All Years" || p.year.toString() === filterYear;
        return matchesSearch && matchesYear;
    });

    const years = ["All Years", ...Array.from(new Set(papers.map(p => p.year.toString()))).sort().reverse()];

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-neon-crystal animate-pulse" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Document Vault</span>
                    </div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)] italic tracking-tighter">
                        PAST <span className="text-neon-crystal shadow-neon-glow">PAPERS</span>
                    </h1>
                    <p className="text-[var(--text-muted)] mt-2 max-w-md">
                        Manage your analyzed exam papers, verify processing status, and deep-dive into source documents.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-sm p-4 flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-2xl font-black text-[var(--text-primary)] leading-none">{papers.length}</div>
                            <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Total Vaulted</div>
                        </div>
                        <div className="w-10 h-10 rounded-sm bg-neon-crystal/10 flex items-center justify-center border border-neon-crystal/20">
                            <BookOpen className="w-5 h-5 text-neon-crystal" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Controls Bar */}
            <section className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900/40 p-4 rounded-sm border border-slate-800/60 backdrop-blur-md sticky top-6 z-20">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-neon-crystal transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by course code or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800/50 border border-[var(--border)] rounded-sm py-3 pl-12 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-neon-crystal focus:border-neon-crystal transition-all placeholder:text-[var(--text-muted)] shadow-sm"
                    />
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative group w-full md:w-48">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800/50 border border-[var(--border)] rounded-sm py-3 pl-12 pr-8 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-neon-crystal transition-all cursor-pointer text-[var(--text-primary)] shadow-sm"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
            </section>

            {/* Papers Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-64 rounded-sm bg-slate-800/20 border border-slate-700/30 animate-pulse" />
                        ))
                    ) : filteredPapers.length > 0 ? (
                        filteredPapers.map((paper, index) => (
                            <PaperCard
                                key={paper.id}
                                paper={paper}
                                index={index}
                                onDelete={() => handleDelete(paper.id)}
                            />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 bg-slate-800/10 rounded-sm border border-dashed border-slate-700/50"
                        >
                            <FileText className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No papers found in the vault</p>
                            <p className="text-sm">Try adjusting your search or upload a new exam paper.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
}

function PaperCard({ paper, index, onDelete }: { paper: Paper; index: number; onDelete: () => void }) {
    const isCompleted = paper.processing_status === "completed";
    const isProcessing = paper.processing_status === "processing" || paper.processing_status === "pending";
    const isFailed = paper.processing_status === "failed";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
            className="group relative flex flex-row items-stretch bg-slate-900/60 border border-slate-800/60 rounded-sm p-4 hover:border-neon-crystal/30 transition-all duration-500 overflow-hidden gap-3 md:gap-4 h-[180px] md:h-[200px]"
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-crystal/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-neon-crystal/10 transition-colors pointer-events-none" />

            {/* Left Column - Details */}
            <div className="flex flex-col flex-1 min-w-0 justify-between">
                {/* Header: Status and Date */}
                <div className="flex flex-wrap items-center justify-between xl:justify-start gap-2 mb-2">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-sm border text-[8px] md:text-[9px] font-bold uppercase tracking-wider ${isCompleted ? "bg-neon-crystal/10 border-neon-crystal/20 text-neon-crystal shadow-neon-glow" :
                        isProcessing ? "bg-blue-500/10 border-blue-500/20 text-blue-400 animate-pulse" :
                            "bg-red-500/10 border-red-500/20 text-red-500"
                        }`}>
                        {isCompleted && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {isProcessing && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                        {isFailed && <AlertCircle className="w-2.5 h-2.5" />}
                        {paper.processing_status}
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 bg-slate-800/50 px-1.5 py-1 rounded whitespace-nowrap">
                        {Math.round((new Date().getTime() - new Date(paper.upload_date).getTime()) / (1000 * 3600 * 24))}d ago
                    </div>
                </div>

                {/* Content: Title and Course */}
                <div className="space-y-1 flex-1 min-h-0 flex flex-col justify-center">
                    <h3 className="line-clamp-2 text-xs md:text-sm lg:text-base font-bold text-slate-100 group-hover:text-neon-crystal transition-colors uppercase italic tracking-tight" title={paper.courses?.name || "Unnamed Course"}>
                        {paper.courses?.name || "Unnamed Course"}
                    </h3>
                    <p className="text-[9px] md:text-[10px] font-mono text-slate-400 flex items-center gap-1.5 truncate mt-1">
                        <span className="text-neon-crystal font-black">{paper.courses?.code}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700 hidden sm:inline-block shrink-0" />
                        <span className="truncate">{paper.courses?.department}</span>
                    </p>
                </div>

                {/* Meta: Year & Sem */}
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[var(--border)] shrink-0">
                    <div className="bg-[var(--foreground)]/5 rounded-sm p-1.5 border border-transparent flex flex-col md:flex-row md:items-center gap-1">
                        <Calendar className="w-3 h-3 text-[var(--neon-crystal)]" />
                        <div>
                            <div className="text-[8px] text-[var(--text-muted)] uppercase leading-none hidden md:block mb-0.5">Year</div>
                            <div className="text-[10px] md:text-xs font-bold text-[var(--text-primary)]">{paper.year}</div>
                        </div>
                    </div>
                    <div className="bg-[var(--foreground)]/5 rounded-sm p-1.5 border border-transparent flex flex-col md:flex-row md:items-center gap-1">
                        <Clock className="w-3 h-3 text-[var(--neon-crystal)]" />
                        <div>
                            <div className="text-[8px] text-[var(--text-muted)] uppercase leading-none hidden md:block mb-0.5">Sem</div>
                            <div className="text-[10px] md:text-xs font-bold text-[var(--text-primary)]">{paper.semester}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Actions */}
            <div className="flex flex-col justify-between items-end border-l border-slate-800/60 pl-3 md:pl-4 w-[65px] md:w-[90px] shrink-0 relative z-10">
                <button
                    onClick={() => window.open(paper.file_url, '_blank')}
                    className="w-full flex-1 flex flex-col items-center justify-center gap-1 bg-neon-crystal/10 hover:bg-neon-crystal hover:text-black border border-neon-crystal/20 text-neon-crystal rounded-sm p-1 md:p-2 transition-all"
                    title="View PDF"
                >
                    <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider mt-0.5">View</span>
                </button>
                
                <Link href={`/dashboard/papers/${paper.id}`} className="w-full flex-1 mt-2">
                    <button 
                        className="w-full h-full flex flex-col items-center justify-center gap-1 bg-slate-800/40 hover:bg-slate-700 hover:text-neon-crystal border border-[var(--border)] text-slate-400 rounded-sm p-1 md:p-2 transition-all"
                        title="Deep Dive Analytics"
                    >
                        <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider mt-0.5">Dive</span>
                    </button>
                </Link>

                <button
                    onClick={onDelete}
                    className="w-full flex items-center justify-center p-1 md:p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-transparent hover:border-red-400 rounded-sm transition-all group/trash mt-2 h-[30px] md:h-[40px] shrink-0"
                    title="Delete Paper"
                >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4 group-hover/trash:rotate-12 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
}
