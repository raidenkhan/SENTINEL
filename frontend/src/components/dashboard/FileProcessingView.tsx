"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, FileText, MoreHorizontal, RefreshCw, UploadCloud, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type UploadedFile = {
    id: string;
    name: string;
    progress: number;
    status: 'pending' | 'processing' | 'extracting' | 'analyzing' | 'indexing' | 'completed' | 'failed';
    error?: string;
    failedStage?: 'upload' | 'processing';
    file?: File; // kept so failed uploads can be retried
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function FileProcessingView({ onUploadComplete }: { onUploadComplete?: () => void }) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [completedPaper, setCompletedPaper] = useState<{ id: string; name: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);
    const retryingRef = useRef<Set<string>>(new Set());

    // Clear any active status polls when the component unmounts
    useEffect(() => {
        return () => {
            intervalsRef.current.forEach(id => clearInterval(id));
            intervalsRef.current = [];
        };
    }, []);

    const getProgress = (status: UploadedFile['status']) => {
        switch (status) {
            case 'pending': return 10;
            case 'extracting': return 30;
            case 'analyzing': return 60;
            case 'indexing': return 85;
            case 'completed': return 100;
            case 'failed': return 0;
            default: return 50;
        }
    };

    const uploadFile = async (file: File) => {
        // Dummy metadata for the MVP since we haven't built a course selector yet
        const formData = new FormData();
        formData.append("file", file);
        formData.append("course_id", "123e4567-e89b-12d3-a456-426614174000"); // Fake UUID for now or get from context
        formData.append("course_code", "EE357");
        formData.append("course_name", "Microprocessors");
        formData.append("department", "Computer Engineering");
        formData.append("year", "2023");
        formData.append("semester", "2");

        // Optimistic UI Update
        const tempId = Math.random().toString(36).substring(7);
        setFiles(prev => [...prev, { id: tempId, name: file.name, progress: 10, status: 'pending', file }]);

        try {
            const res = await fetch(`${API_URL}/api/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                // Surface the backend's informative message (e.g. "This exact file has already been uploaded.")
                let message = `Upload failed (${res.status})`;
                const err = await res.json().catch(() => null);
                if (err && typeof err.detail === 'string') message = err.detail;
                console.error("Upload failed", { status: res.status, message });
                setFiles(prev => prev.map(f => f.id === tempId ? { ...f, status: 'failed', progress: 0, error: message, failedStage: 'upload' } : f));
                return;
            }

            const data = await res.json();

            // Replace temp ID with real upload_id and release the File reference
            setFiles(prev => prev.map(f => f.id === tempId ? { ...f, id: data.upload_id, status: 'processing', progress: 50, file: undefined } : f));

            // Start polling
            pollStatus(data.upload_id, file.name);

        } catch (error) {
            console.error("Upload error", error);
            setFiles(prev => prev.map(f => f.id === tempId ? { ...f, status: 'failed', progress: 0, error: "Could not reach the server. Check your connection and try again.", failedStage: 'upload' } : f));
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        e.target.value = ""; // Allow re-selecting the same file later
        uploadFile(file);
    };

    const pollStatus = async (upload_id: string, fileName: string) => {
        let attempts = 0;
        let consecutiveErrors = 0;
        let finished = false;

        // Terminal state handler — ignores any stale responses that arrive afterwards
        const finish = (status: UploadedFile['status'], progress: number, error?: string) => {
            if (finished) return;
            finished = true;
            clearInterval(interval);
            setFiles(prev => prev.map(f => f.id === upload_id ? { ...f, status, progress, error, failedStage: status === 'failed' ? 'processing' : undefined } : f));
        };

        const interval = setInterval(async () => {
            attempts += 1;

            // Safety net: give up after ~6 minutes of polling
            if (attempts > 120) {
                finish('failed', 0, "Processing timed out after 6 minutes. Please try again.");
                return;
            }

            try {
                const res = await fetch(`${API_URL}/api/status/${upload_id}`);

                if (!res.ok) {
                    console.error(`Status check failed with ${res.status} for upload ${upload_id}`);
                    consecutiveErrors += 1;
                } else {
                    const data = await res.json();
                    consecutiveErrors = 0;

                    if (data.status === 'completed') {
                        finish('completed', 100);
                        // Show the clean success modal
                        setCompletedPaper({ id: upload_id, name: fileName });
                        if (onUploadComplete) onUploadComplete();
                        return;
                    }
                    if (data.status === 'failed') {
                        finish('failed', 0, "Processing failed on the server. The PDF may be unreadable — try a cleaner scan.");
                        return;
                    }

                    // Update intermediate status and progress (only if still active)
                    if (!finished) {
                        setFiles(prev => prev.map(f => f.id === upload_id ? { ...f, status: data.status, progress: getProgress(data.status) } : f));
                    }
                }
            } catch (err) {
                console.error("Polling error", err);
                consecutiveErrors += 1;
            }

            // If the status endpoint is unreachable, fail visibly instead of hanging at 50%
            if (consecutiveErrors >= 5) {
                finish('failed', 0, "Lost connection to the backend. Make sure the API server is running.");
            }
        }, 3000); // Poll every 3 seconds

        intervalsRef.current.push(interval);
    };

    return (
        <>
            <div className="glass-card p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 w-full">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-neon-crystal/5 blur-[120px] rounded-sm z-0 pointer-events-none" />

                {/* Files List - Left side */}
                <div className="w-full md:w-1/3 flex flex-col gap-4 z-10 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {files.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-sm gap-2">
                            <UploadCloud className="w-8 h-8 opacity-50" />
                            <p>No papers analyzed yet.</p>
                        </div>
                    ) : (
                        files.map((file, idx) => {
                            const retryFile = file.status === 'failed' ? file.file : undefined;
                            return (
                                <FileItem
                                    key={file.id}
                                    name={file.name}
                                    progress={file.progress}
                                    active={file.status === 'processing'}
                                    status={file.status}
                                    error={file.error}
                                    failedStage={file.failedStage}
                                    viewHref={file.status === 'completed' ? `/dashboard/papers/${file.id}` : undefined}
                                    onRemove={() => setFiles(prev => prev.filter(f => f.id !== file.id))}
                                    onRetry={retryFile ? () => {
                                        // Guard against double-clicks starting two uploads
                                        if (retryingRef.current.has(file.id)) return;
                                        retryingRef.current.add(file.id);
                                        setFiles(prev => prev.filter(f => f.id !== file.id));
                                        uploadFile(retryFile).finally(() => retryingRef.current.delete(file.id));
                                    } : undefined}
                                />
                            );
                        })
                    )}

                    <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-auto px-6 py-3 rounded-sm bg-neon-crystal/10 text-neon-crystal border border-neon-crystal/30 font-bold text-sm hover:bg-neon-crystal/20 transition-all flex items-center justify-center gap-2 w-max shadow-neon-glow shrink-0"
                    >
                        <span>UPLOAD PIPELINE</span>
                    </button>
                </div>

                {/* Waveform / Scanning Animation - Right Side */}
                <div className="w-full md:w-2/3 h-64 md:h-auto rounded-sm border border-[var(--foreground)]/5 bg-[var(--card-bg)]/40 relative flex items-center justify-center overflow-hidden z-10 backdrop-blur-md shadow-[inset_0_0_50px_var(--shadow-color)]">
                    {/* ECG Line */}
                    <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(57,255,20,0)" />
                                <stop offset="80%" stopColor="rgba(57,255,20,1)" />
                                <stop offset="100%" stopColor="rgba(57,255,20,0)" />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="8" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        <path d="M 0,100 L 550,100" stroke="url(#neonGradient)" strokeWidth="4" fill="none" filter="url(#glow)" className="opacity-50" />

                        <motion.path
                            d="M 550,100 L 570,100 L 585,40 L 605,160 L 625,20 L 640,140 L 655,100 L 800,100"
                            stroke="url(#neonGradient)"
                            strokeWidth="4"
                            fill="none"
                            filter="url(#glow)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                    </svg>

                    {/* Scan Line overlay */}
                    <motion.div
                        className="absolute top-0 bottom-0 w-1 bg-neon-crystal shadow-[0_0_20px_4px_rgba(57,255,20,0.6)] z-20"
                        animate={{ left: ["0%", "100%", "0%"] }}
                        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
                    />

                    <span className="absolute top-8 right-8 text-xs font-mono text-neon-crystal/50">7Rx</span>
                    <span className="absolute bottom-8 right-16 text-xs font-mono text-neon-crystal/50">Err</span>
                    <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs font-mono text-neon-crystal/50">Em</span>
                </div>
            </div>

            {/* Success Modal — shown when a paper finishes processing */}
            <AnimatePresence>
                {completedPaper && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setCompletedPaper(null)}
                            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 8 }}
                            transition={{ type: "spring", damping: 26, stiffness: 300 }}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Analysis complete"
                            className="fixed z-[110] inset-0 m-auto w-[92vw] max-w-md max-h-[90vh] overflow-y-auto h-fit glass-card p-8 md:p-10 rounded-2xl border border-neon-crystal/30 shadow-neon-glow text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.15, type: "spring", damping: 12, stiffness: 220 }}
                                className="w-16 h-16 mx-auto rounded-full bg-neon-crystal/10 border border-neon-crystal/40 flex items-center justify-center shadow-neon-glow"
                            >
                                <CheckCircle2 className="w-8 h-8 text-neon-crystal" />
                            </motion.div>

                            <h2 className="mt-6 text-2xl font-black italic tracking-tighter uppercase text-[var(--text-primary)]">
                                Analysis Complete
                            </h2>
                            <p className="mt-2 text-sm text-[var(--text-muted)] font-mono break-words">
                                {completedPaper.name}
                            </p>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                Scanned, structured &amp; indexed into the vault.
                            </p>

                            <div className="mt-8 flex flex-col gap-3">
                                <Link
                                    href={`/dashboard/papers/${completedPaper.id}`}
                                    onClick={() => setCompletedPaper(null)}
                                    className="px-6 py-3 rounded-sm bg-neon-crystal text-black font-black text-sm hover:bg-neon-crystal/80 transition-all shadow-neon-glow flex items-center justify-center gap-2"
                                >
                                    VIEW PAPER ANALYSIS <span aria-hidden>→</span>
                                </Link>
                                <button
                                    onClick={() => setCompletedPaper(null)}
                                    className="px-6 py-3 rounded-sm border border-[var(--foreground)]/10 text-[var(--text-muted)] font-bold text-sm hover:text-[var(--text-primary)] hover:border-[var(--foreground)]/30 transition-all"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

function FileItem({ name, progress, active, status, error, failedStage, viewHref, onRemove, onRetry }: {
    name: string;
    progress: number;
    active: boolean;
    status: string;
    error?: string;
    failedStage?: 'upload' | 'processing';
    viewHref?: string;
    onRemove?: () => void;
    onRetry?: () => void;
}) {
    const failed = status === 'failed';

    return (
        <div className={`p-4 rounded-sm border transition-all ${active ? 'border-neon-crystal/30 bg-neon-crystal/5' : failed ? 'border-red-500/40 bg-red-500/5' : 'border-[var(--border)] bg-[var(--card-bg)]'}`}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <FileText className={`w-4 h-4 ${active ? 'text-neon-crystal' : failed ? 'text-red-500' : 'text-[var(--text-muted)]'}`} />
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[150px]">{name}</span>
                </div>
                {failed ? (
                    <button onClick={onRemove} title="Remove from list" aria-label="Remove file" className="text-red-400/70 hover:text-red-300 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                ) : (
                    <MoreHorizontal className="w-4 h-4 text-[var(--text-muted)]" />
                )}
            </div>

            <div className="w-full h-2 rounded-sm bg-[var(--foreground)]/5 overflow-hidden">
                <motion.div
                    className={`h-full ${failed ? 'bg-red-500' : 'bg-neon-crystal'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>

            <div className={`text-[10px] font-mono mt-2 text-right uppercase tracking-wider ${failed ? 'text-red-400' : 'text-[var(--text-muted)]'}`}>
                {status === 'pending' && "Awaiting processing..."}
                {status === 'extracting' && "Extracting content..."}
                {status === 'analyzing' && "SENTINEL AI analyzing structure..."}
                {status === 'indexing' && "Indexing into Nano-Vault..."}
                {status === 'completed' && "Analysis complete"}
                {status === 'failed' && (failedStage === 'upload' ? "Upload failed" : "Processing failed")}
                {status === 'processing' && "Processing..."}
                <span className={`ml-2 ${failed ? 'text-red-400' : 'text-neon-crystal'}`}>[{progress}%]</span>
            </div>

            {/* Backend's informative error, e.g. "This exact file has already been uploaded." */}
            {failed && error && (
                <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-2 flex items-start gap-2 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-sm px-2 py-1.5"
                >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-[1px]" />
                    <span>{error}</span>
                </motion.div>
            )}

            {failed && onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-2 text-[11px] font-bold text-neon-crystal hover:text-neon-crystal/70 transition-colors flex items-center gap-1.5"
                >
                    <RefreshCw className="w-3 h-3" /> RETRY UPLOAD
                </button>
            )}

            {!failed && viewHref && (
                <Link
                    href={viewHref}
                    className="mt-2 text-[11px] font-bold text-neon-crystal hover:text-neon-crystal/70 transition-colors flex items-center gap-1.5"
                >
                    <FileText className="w-3 h-3" /> VIEW ANALYSIS <span aria-hidden>→</span>
                </Link>
            )}
        </div>
    );
}
