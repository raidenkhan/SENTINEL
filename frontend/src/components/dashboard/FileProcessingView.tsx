"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, BookOpen, CheckCircle2, FileText, MoreHorizontal, Plus, RefreshCw, UploadCloud, X } from "lucide-react";
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

type Course = {
    id: string;
    code: string;
    name: string;
    department?: string | null;
    level?: number | null;
    syllabus?: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2004 }, (_, i) => CURRENT_YEAR - i);
const SEMESTERS = ["1", "2", "3"];
const SELECT_CLASS = "w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-sm px-2 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-neon-crystal/40 transition-colors";
const INPUT_CLASS = "w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-sm px-2 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-neon-crystal/40 transition-colors";

export function FileProcessingView({ onUploadComplete }: { onUploadComplete?: () => void }) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const prefersReducedMotion = useReducedMotion();
    // True while any upload is actually in flight (animations only show then)
    const isBusy = files.some(f => ['pending', 'processing', 'extracting', 'analyzing', 'indexing'].includes(f.status));
    const busyFile = files.find(f => ['pending', 'processing', 'extracting', 'analyzing', 'indexing'].includes(f.status));
    // Users who prefer reduced motion get the calm standby even while busy
    const showScan = isBusy && !prefersReducedMotion;
    const [completedPaper, setCompletedPaper] = useState<{ id: string; name: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);
    const retryingRef = useRef<Set<string>>(new Set());

    // --- Course selector state ---
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [year, setYear] = useState<number>(CURRENT_YEAR);
    const [semester, setSemester] = useState("1");
    const [coursesError, setCoursesError] = useState("");
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [newCourse, setNewCourse] = useState({ code: "", name: "", department: "", level: "", syllabus: "" });
    const [addingCourse, setAddingCourse] = useState(false);
    const [addCourseError, setAddCourseError] = useState("");

    // Load available courses for the selector (reused: mount, after add,
    // after upload, and after a duplicate-code error so the list stays fresh)
    const loadCourses = async (opts?: { selectCourseId?: string }) => {
        try {
            const res = await fetch(`${API_URL}/api/courses`);
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const data: Course[] = await res.json();
            setCourses(data);
            setCoursesError("");
            if (opts?.selectCourseId && data.some(c => c.id === opts.selectCourseId)) {
                setSelectedCourseId(opts.selectCourseId);
            } else if (data.length === 1) {
                // Preselect automatically when only one course exists
                setSelectedCourseId(data[0].id);
            }
            return data;
        } catch (err) {
            setCoursesError("Could not load courses. Is the backend running?");
            return null;
        }
    };

    useEffect(() => {
        loadCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddCourse = async () => {
        const code = newCourse.code.trim();
        const name = newCourse.name.trim();
        if (!code || !name) {
            setAddCourseError("Course code and name are required.");
            return;
        }
        setAddingCourse(true);
        setAddCourseError("");
        try {
            const res = await fetch(`${API_URL}/api/courses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code,
                    name,
                    department: newCourse.department.trim() || undefined,
                    level: newCourse.level ? Number(newCourse.level) : undefined,
                    syllabus: newCourse.syllabus.trim() || undefined,
                }),
            });
            const body = await res.json().catch(() => null);
            if (!res.ok) {
                if (res.status === 409) {
                    // Duplicate code: the course ALREADY exists (it just didn't
                    // show in the list — e.g. auto-created by a previous upload).
                    // Refetch and auto-select it instead of leaving the user stuck.
                    const data = await loadCourses({ selectCourseId: undefined });
                    const existing = data?.find(c => c.code.toLowerCase() === code.toLowerCase());
                    if (existing) {
                        setSelectedCourseId(existing.id);
                        setAddCourseError(`${existing.code} already exists — selected it for you.`);
                    } else {
                        setAddCourseError(body && typeof body.detail === "string" ? body.detail : `Failed to add course (${res.status})`);
                    }
                } else {
                    setAddCourseError(body && typeof body.detail === "string" ? body.detail : `Failed to add course (${res.status})`);
                }
                return;
            }
            const created = body as Course | null;
            if (!created || !created.id) {
                setAddCourseError("Course was added but the server returned an unexpected response.");
                return;
            }
            // Refetch the authoritative list (catches normalized codes, ordering)
            await loadCourses({ selectCourseId: created.id });
            setShowAddCourse(false);
            setNewCourse({ code: "", name: "", department: "", level: "", syllabus: "" });
        } catch (err) {
            setAddCourseError("Could not reach the server. Check your connection.");
        } finally {
            setAddingCourse(false);
        }
    };

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
        // Real course metadata from the selector (no more hardcoded dummy)
        const selectedCourse = courses.find(c => c.id === selectedCourseId);
        if (!selectedCourse) return; // button is disabled without a course; belt-and-suspenders
        const formData = new FormData();
        formData.append("file", file);
        formData.append("course_id", selectedCourse.id);
        formData.append("course_code", selectedCourse.code);
        formData.append("course_name", selectedCourse.name);
        formData.append("department", selectedCourse.department || "Engineering");
        formData.append("year", String(year));
        formData.append("semester", semester);

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

            // Safety net: give up after ~12 minutes. Chunked analysis can
            // legitimately take several minutes per paper.
            if (attempts > 240) {
                finish('failed', 0, "Processing timed out after 12 minutes. Please try again.");
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
                        // The pipeline may have auto-created/matched a course while
                        // processing — refresh the selector so it stays in sync.
                        loadCourses();
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
                <div className="w-full md:w-1/3 flex flex-col gap-4 z-10">
                    {/* Course selector */}
                    <div className="p-4 rounded-sm border border-neon-crystal/20 bg-neon-crystal/5 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-neon-crystal/70 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" /> Course
                            </label>
                            <button
                                onClick={() => setShowAddCourse(v => !v)}
                                className="text-[10px] font-bold text-neon-crystal/80 hover:text-neon-crystal transition-colors flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> {showAddCourse ? "Cancel" : "Add course"}
                            </button>
                        </div>

                        {coursesError ? (
                            <p className="text-[11px] text-red-400">{coursesError}</p>
                        ) : courses.length === 0 ? (
                            <p className="text-[11px] text-[var(--text-muted)]">No courses yet — add one below to upload.</p>
                        ) : (
                            <select
                                value={selectedCourseId}
                                onChange={e => setSelectedCourseId(e.target.value)}
                                className={SELECT_CLASS}
                            >
                                <option value="" disabled>Select a course…</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.code} — {c.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Year</label>
                                <select value={year} onChange={e => setYear(Number(e.target.value))} className={SELECT_CLASS}>
                                    {YEARS.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Semester</label>
                                <select value={semester} onChange={e => setSemester(e.target.value)} className={SELECT_CLASS}>
                                    {SEMESTERS.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {showAddCourse && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-2 pt-1 overflow-hidden"
                            >
                                <input
                                    placeholder="Code (e.g. EE357)"
                                    value={newCourse.code}
                                    onChange={e => setNewCourse(p => ({ ...p, code: e.target.value }))}
                                    className={INPUT_CLASS}
                                />
                                <input
                                    placeholder="Name (e.g. Computer Architecture)"
                                    value={newCourse.name}
                                    onChange={e => setNewCourse(p => ({ ...p, name: e.target.value }))}
                                    className={INPUT_CLASS}
                                />
                                <input
                                    placeholder="Department (optional)"
                                    value={newCourse.department}
                                    onChange={e => setNewCourse(p => ({ ...p, department: e.target.value }))}
                                    className={INPUT_CLASS}
                                />
                                <input
                                    placeholder="Level (optional, e.g. 300)"
                                    value={newCourse.level}
                                    onChange={e => setNewCourse(p => ({ ...p, level: e.target.value }))}
                                    className={INPUT_CLASS}
                                />
                                <textarea
                                    placeholder="Syllabus / topics (optional, comma-separated) — helps AI analysis"
                                    value={newCourse.syllabus}
                                    onChange={e => setNewCourse(p => ({ ...p, syllabus: e.target.value }))}
                                    rows={2}
                                    className={`${INPUT_CLASS} resize-none`}
                                />
                                {addCourseError && <p className="text-[11px] text-red-400">{addCourseError}</p>}
                                <button
                                    onClick={handleAddCourse}
                                    disabled={addingCourse}
                                    className="px-3 py-1.5 rounded-sm bg-neon-crystal/10 text-neon-crystal border border-neon-crystal/30 font-bold text-[11px] hover:bg-neon-crystal/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    {addingCourse ? "ADDING…" : "ADD COURSE"}
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* File queue (scrollable) */}
                    <div className="flex flex-col gap-4 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
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
                    </div>

                    <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!selectedCourseId}
                        title={!selectedCourseId ? "Select a course to upload" : "Upload"}
                        className="mt-auto px-6 py-3 rounded-sm bg-neon-crystal/10 text-neon-crystal border border-neon-crystal/30 font-bold text-sm hover:bg-neon-crystal/20 transition-all flex items-center justify-center gap-2 w-max shadow-neon-glow shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neon-crystal/10"
                    >
                        <span>UPLOAD PIPELINE</span>
                    </button>
                </div>

                {/* Radar Scan / Standby Panel - Right Side */}
                <div className="w-full md:w-2/3 h-64 md:h-auto min-h-64 rounded-sm border border-[var(--foreground)]/5 bg-[var(--card-bg)]/40 relative flex items-center justify-center overflow-hidden z-10 backdrop-blur-md shadow-[inset_0_0_50px_var(--shadow-color)]">
                    {showScan ? (
                        /* ---- ACTIVE SCAN: animated radar sweep ---- */
                        <div className="relative w-56 h-56 md:w-72 md:h-72">
                            {/* Range rings */}
                            {[100, 72, 44, 20].map((size, i) => (
                                <div
                                    key={i}
                                    className="absolute rounded-full border border-emerald-500/20"
                                    style={{ inset: `${(100 - size) / 2}%` }}
                                />
                            ))}
                            {/* Sweep wedge (rotating) — full conic wedge, no mask */}
                            <motion.div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: "conic-gradient(from 0deg, rgba(16,185,129,0.4) 0deg, rgba(16,185,129,0.1) 40deg, transparent 55deg)",
                                }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2.4, ease: "linear", repeat: Infinity }}
                            />
                            {/* Center dot */}
                            <motion.div
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_16px_4px_rgba(16,185,129,0.55)]"
                                animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                            />
                            {/* Blip appearing along the sweep (decoy target) */}
                            <motion.div
                                className="absolute w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-emerald-300"
                                animate={{ left: ["50%", "86%", "28%"], top: ["50%", "22%", "68%"] }}
                                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                                style={{ filter: "drop-shadow(0 0 6px rgba(16,185,129,0.9))" }}
                            />
                            {/* Status text overlay */}
                            <div className="absolute inset-x-0 -bottom-2 flex flex-col items-center gap-1">
                                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-500 animate-pulse">
                                    {busyFile?.status === 'extracting' ? 'EXTRACTING' :
                                     busyFile?.status === 'analyzing' ? 'ANALYZING' :
                                     busyFile?.status === 'indexing' ? 'INDEXING' : 'SCANNING'}
                                </span>
                                <span className="text-[9px] font-mono text-[var(--text-muted)] max-w-[80%] truncate">
                                    {busyFile?.name}
                                </span>
                            </div>
                        </div>
                    ) : (
                        /* ---- STANDBY: calm, static — no animation ---- */
                        <div className="relative flex flex-col items-center gap-5">
                            <div className="relative w-44 h-44">
                                {/* Faint static rings — no motion */}
                                {[100, 70, 40].map((size, i) => (
                                    <div
                                        key={i}
                                        className="absolute rounded-full border border-emerald-500/10"
                                        style={{ inset: `${(100 - size) / 2}%` }}
                                    />
                                ))}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-500/60" />
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-emerald-500/15" />
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-[var(--text-muted)]">
                                    {isBusy ? 'Processing' : 'Standby'}
                                </span>
                                <span className="text-xs text-[var(--text-muted)]">
                                    {isBusy ? 'Analysis running — see progress in the queue' : 'Upload a paper to begin analysis'}
                                </span>
                            </div>
                        </div>
                    )}
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
