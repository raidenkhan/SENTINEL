"use client";

import { motion } from "framer-motion";
import { FileText, MoreHorizontal, UploadCloud } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type UploadedFile = {
    id: string;
    name: string;
    progress: number;
    status: 'pending' | 'processing' | 'extracting' | 'analyzing' | 'indexing' | 'completed' | 'failed';
}

export function FileProcessingView({ onUploadComplete }: { onUploadComplete?: () => void }) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        // Dummy metadata for the MVP since we haven't built a course selector yet
        const formData = new FormData();
        formData.append("file", file);
        formData.append("course_id", "123e4567-e89b-12d3-a456-426614174000"); // Fake UUID for now or get from context
        formData.append("course_code", "EE357");
        formData.append("course_name", "Microprocessors");
        formData.append("department", "Computer Engineering");
        formData.append("year", "2023");
        formData.append("semester", "2");

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        // Optimistic UI Update
        const tempId = Math.random().toString(36).substring(7);
        setFiles(prev => [...prev, { id: tempId, name: file.name, progress: 10, status: 'pending' }]);

        try {
            const res = await fetch(`${API_URL}/api/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                console.error("Upload failed", err);
                setFiles(prev => prev.map(f => f.id === tempId ? { ...f, status: 'failed', progress: 0 } : f));
                return;
            }

            const data = await res.json();

            // Replace temp ID with real upload_id
            setFiles(prev => prev.map(f => f.id === tempId ? { ...f, id: data.upload_id, status: 'processing', progress: 50 } : f));

            // Start polling
            pollStatus(data.upload_id);

        } catch (error) {
            console.error("Upload error", error);
            setFiles(prev => prev.map(f => f.id === tempId ? { ...f, status: 'failed', progress: 0 } : f));
        }
    };

    const pollStatus = async (upload_id: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/status/${upload_id}`);
                if (res.ok) {
                    const data = await res.json();

                    if (data.status === 'completed') {
                        setFiles(prev => prev.map(f => f.id === upload_id ? { ...f, status: 'completed', progress: 100 } : f));
                        clearInterval(interval);
                        if (onUploadComplete) onUploadComplete();
                    } else {
                        // Update intermediate status and progress
                        setFiles(prev => prev.map(f => f.id === upload_id ? { ...f, status: data.status, progress: getProgress(data.status) } : f));
                    }
                }
            } catch (err) {
                console.error("Polling error", err);
            }
        }, 3000); // Poll every 3 seconds
    };

    return (
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
                    files.map((file, idx) => (
                        <FileItem key={file.id} name={file.name} progress={file.progress} active={file.status === 'processing'} status={file.status} />
                    ))
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
            <div className="w-full md:w-2/3 h-64 md:h-auto rounded-sm border border-[var(--foreground)]/5 bg-[var(--card-bg)]/40 relative flex items-center justify-center overflow-hidden z-10 backdrop-blur-md shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
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
    );
}

function FileItem({ name, progress, active, status }: { name: string; progress: number; active: boolean; status: string }) {
    return (
        <div className={`p-4 rounded-sm border transition-all ${active ? 'border-neon-crystal/30 bg-neon-crystal/5' : 'border-[var(--border)] bg-[var(--card-bg)]'}`}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <FileText className={`w-4 h-4 ${active ? 'text-neon-crystal' : status === 'failed' ? 'text-red-500' : 'text-[var(--text-muted)]'}`} />
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[150px]">{name}</span>
                </div>
                <MoreHorizontal className="w-4 h-4 text-[var(--text-muted)]" />
            </div>

            <div className="w-full h-2 rounded-sm bg-[var(--foreground)]/5 overflow-hidden">
                <motion.div
                    className={`h-full ${status === 'failed' ? 'bg-red-500' : 'bg-neon-crystal'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>
            <div className="text-[10px] font-mono mt-2 text-right text-[var(--text-muted)] uppercase tracking-wider">
                {status === 'pending' && "Awaiting processing..."}
                {status === 'extracting' && "Extracting content..."}
                {status === 'analyzing' && "SENTINEL AI analyzing structure..."}
                {status === 'indexing' && "Indexing into Nano-Vault..."}
                {status === 'completed' && "Analysis complete"}
                {status === 'failed' && "Processing failed"}
                {status === 'processing' && "Processing..."}
                <span className="ml-2 text-neon-crystal">[{progress}%]</span>
            </div>
        </div>
    );
}
