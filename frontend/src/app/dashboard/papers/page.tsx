"use client";

import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import {
    FileText, Search, Trash2, ExternalLink, Calendar, BookOpen, Clock, CheckCircle2,
    Loader2, AlertCircle, ChevronRight, Filter, BarChart3, Binary, Sparkles
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/landing/GlassCard";
import { Button } from "@/components/ui/Button";

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
            const res = await fetch(`${API_URL}/api/papers/${id}`, { method: "DELETE" });
            if (res.ok) mutate(`${API_URL}/api/papers`);
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const filteredPapers = papers.filter((p) => {
        const matchesSearch =
            p.courses?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.courses?.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesYear = filterYear === "All Years" || p.year.toString() === filterYear;
        return matchesSearch && matchesYear;
    });

    const years = ["All Years", ...Array.from(new Set(papers.map(p => p.year.toString()))).sort().reverse()];

    return (
        <div className="space-y-12">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <Binary className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-600 dark:text-emerald-400 uppercase">Archive Management</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none">
                        Document <span className="text-emerald-500 shadow-emerald">Vault</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg">
                        Manage your analyzed exam neural-maps. High-fidelity OCR extraction active for all vaulted documents.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <GlassCard className="p-5 flex items-center gap-5 border-black/5 dark:border-white/5">
                        <div className="text-right">
                            <div className="text-3xl font-black text-slate-900 dark:text-white leading-none">{papers.length}</div>
                            <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mt-1">Files Indexed</div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-emerald">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                    </GlassCard>
                </div>
            </header>

            {/* Controls Bar (charcoal Glass) */}
            <section className="flex flex-col md:flex-row gap-4 items-center bg-white/40 dark:bg-charcoal-900/40 p-4 rounded-2xl border border-black/5 dark:border-white/5 backdrop-blur-xl sticky top-6 z-30 shadow-sm">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by course code or identifier..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400"
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative group w-full md:w-48">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl py-3.5 pl-12 pr-8 text-sm font-bold text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all cursor-pointer"
                        >
                            {years.map(y => <option key={y} value={y} className="bg-white dark:bg-charcoal-900">{y}</option>)}
                        </select>
                    </div>
                </div>
            </section>

            {/* Papers Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-64 rounded-3xl bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/5 animate-pulse" />
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
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="col-span-full py-24 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/2 rounded-3xl border-2 border-dashed border-black/5 dark:border-white/5"
                        >
                            <FileText className="w-16 h-16 mb-6 opacity-30" />
                            <p className="text-xl font-black uppercase italic tracking-tighter">Vault Empty</p>
                            <p className="text-sm font-medium mt-1">Upload an exam paper to begin neural processing.</p>
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ delay: index * 0.03 }}
            className="group relative h-[180px]"
        >
            <div className="h-full flex flex-col p-4 border border-[var(--border)] bg-[var(--card-bg)] hover:border-emerald-500/30 transition-colors">
                <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                        <div className={cn(
                            "flex items-center gap-2 px-2 py-1 rounded text-[10px] font-medium",
                            isCompleted ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" :
                            isProcessing ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-500" :
                            "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-500"
                        )}>
                            {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                            {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                            {isFailed && <AlertCircle className="w-3 h-3" />}
                            <span className="hidden sm:inline">{paper.processing_status}</span>
                        </div>
                        <div className="text-[9px] font-mono text-[var(--text-muted)]">
                           {paper.id.split('-')[0].toUpperCase()}
                        </div>
                    </div>

                    <div className="space-y-1 mt-3">
                        <h3 className="line-clamp-1 text-sm font-semibold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">
                            {paper.courses?.name || "Unknown Course"}
                        </h3>
                        <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-2">
                            <span className="font-medium text-emerald-600 dark:text-emerald-500">{paper.courses?.code || "UNKN"}</span>
                            <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                            <span className="truncate">{paper.courses?.department || "General"}</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[var(--border)]">
                        <div className="flex items-center gap-2">
                             <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                             <span className="text-[11px] font-medium text-[var(--text-primary)]">{paper.year}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <Clock className="w-3.5 h-3.5 text-indigo-500" />
                             <span className="text-[11px] font-medium text-[var(--text-primary)]">Sem {paper.semester}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="absolute right-0 top-0 bottom-0 w-12 flex flex-col justify-center items-center py-3 border-l border-[var(--border)] bg-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => window.open(paper.file_url, '_blank')}
                        className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-emerald-500 transition-colors"
                        title="View PDF"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>
                    
                    <Link href={`/dashboard/papers/${paper.id}`} className="mt-2">
                        <button className="w-8 h-8 flex items-center justify-center bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors">
                            <BarChart3 className="w-4 h-4" />
                        </button>
                    </Link>

                    <button
                        onClick={onDelete}
                        className="w-8 h-8 mt-2 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
