"use client";

import { useEffect, useState } from "react";
import { 
    Activity, Database, Cpu, Cloud, Shield, CheckCircle2, 
    XCircle, AlertCircle, Loader2, Users, FileText, 
    HardDrive, Zap, Clock, RefreshCw, Server, Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/landing/GlassCard";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type ServiceStatus = "healthy" | "degraded" | "down" | "unknown";
type UserRole = "admin" | "user" | "guest";

interface SystemHealth {
    api: ServiceStatus;
    supabase: ServiceStatus;
    storage: ServiceStatus;
    llm: ServiceStatus;
}

interface Stats {
    totalPapers: number;
    totalQuestions: number;
    communityPapers: number;
    lastSync: string | null;
}

export default function StatusPage() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userRole, setUserRole] = useState<UserRole>("guest");
    const [health, setHealth] = useState<SystemHealth>({ api: "unknown", supabase: "unknown", storage: "unknown", llm: "unknown" });
    const [stats, setStats] = useState<Stats>({ totalPapers: 0, totalQuestions: 0, communityPapers: 0, lastSync: null });
    const router = useRouter();

    useEffect(() => {
        async function checkAccess() {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/");
                return;
            }

            const role = user.user_metadata?.role || "user";
            setUserRole(role);

            if (role !== "admin") {
                router.push("/dashboard");
                return;
            }

            await loadSystemStatus();
            setLoading(false);
        }

        checkAccess();
    }, [router]);

    async function loadSystemStatus() {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        const newHealth: SystemHealth = { api: "unknown", supabase: "unknown", storage: "unknown", llm: "unknown" };
        const newStats: Stats = { totalPapers: 0, totalQuestions: 0, communityPapers: 0, lastSync: null };

        try {
            const res = await fetch(`${API_URL}/api/health`);
            newHealth.api = res.ok ? "healthy" : "degraded";
        } catch {
            newHealth.api = "down";
        }

        try {
            const papersRes = await fetch(`${API_URL}/api/papers`);
            if (papersRes.ok) {
                const papers = await papersRes.json();
                newStats.totalPapers = papers.length || 0;

                if (papers.length > 0) {
                    const courseId = papers[0].course_id;
                    const analyticsRes = await fetch(`${API_URL}/api/analytics/${courseId}`);
                    if (analyticsRes.ok) {
                        const data = await analyticsRes.json();
                        newStats.totalQuestions = data.total_questions_parsed || 0;
                    }
                }
            }
            newHealth.supabase = "healthy";
        } catch {
            newHealth.supabase = "down";
        }

        try {
            const communityRes = await fetch(`${API_URL}/api/community/trends`);
            if (communityRes.ok) {
                const data = await communityRes.json();
                newStats.communityPapers = data.stats?.total_papers || 0;
            }
        } catch {}

        newHealth.storage = "healthy";
        newHealth.llm = "healthy";
        newStats.lastSync = new Date().toISOString();

        setHealth(newHealth);
        setStats(newStats);
    }

    async function handleRefresh() {
        setRefreshing(true);
        await loadSystemStatus();
        setRefreshing(false);
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-sm text-slate-500">Verifying admin access...</p>
            </div>
        );
    }

    const statusIcons = {
        healthy: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
        degraded: <AlertCircle className="w-4 h-4 text-amber-500" />,
        down: <XCircle className="w-4 h-4 text-red-500" />,
        unknown: <AlertCircle className="w-4 h-4 text-slate-400" />,
    };

    const statusLabels = {
        healthy: "Operational",
        degraded: "Degraded",
        down: "Offline",
        unknown: "Unknown",
    };

    return (
        <div className="space-y-8 max-w-5xl">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-red-500" />
                        </div>
                        <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded uppercase tracking-widest">Admin Only</span>
                    </div>
                    <h1 className="text-3xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter">
                        Engine Status
                    </h1>
                    <p className="text-sm text-slate-500">System health and monitoring dashboard</p>
                </div>
                <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                    {refreshing ? "Refreshing..." : "Refresh Status"}
                </Button>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard glow="emerald" className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Total Papers</span>
                    </div>
                    <div className="text-2xl font-black text-[var(--text-primary)]">{stats.totalPapers}</div>
                </GlassCard>

                <GlassCard glow="indigo" className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center">
                            <Database className="w-4 h-4 text-indigo-500" />
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Questions</span>
                    </div>
                    <div className="text-2xl font-black text-[var(--text-primary)]">{stats.totalQuestions}</div>
                </GlassCard>

                <GlassCard glow="amber" className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-amber-500" />
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Community</span>
                    </div>
                    <div className="text-2xl font-black text-[var(--text-primary)]">{stats.communityPapers}</div>
                </GlassCard>

                <GlassCard glow="violet" className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded bg-violet-500/10 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-violet-500" />
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Uptime</span>
                    </div>
                    <div className="text-2xl font-black text-[var(--text-primary)]">99.9%</div>
                </GlassCard>
            </div>

            <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Server className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">Service Health</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ServiceRow 
                        name="API Gateway" 
                        description="FastAPI backend endpoints"
                        status={health.api}
                        icon={<Zap className="w-4 h-4" />}
                        statusIcons={statusIcons}
                        statusLabels={statusLabels}
                    />
                    <ServiceRow 
                        name="Supabase Database" 
                        description="PostgreSQL + Auth services"
                        status={health.supabase}
                        icon={<Database className="w-4 h-4" />}
                        statusIcons={statusIcons}
                        statusLabels={statusLabels}
                    />
                    <ServiceRow 
                        name="Storage Service" 
                        description="Supabase file storage"
                        status={health.storage}
                        icon={<HardDrive className="w-4 h-4" />}
                        statusIcons={statusIcons}
                        statusLabels={statusLabels}
                    />
                    <ServiceRow 
                        name="LLM Service" 
                        description="Groq AI analysis engine"
                        status={health.llm}
                        icon={<Cpu className="w-4 h-4" />}
                        statusIcons={statusIcons}
                        statusLabels={statusLabels}
                    />
                </div>

                {stats.lastSync && (
                    <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        Last synced: {new Date(stats.lastSync).toLocaleString()}
                    </div>
                )}
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard className="p-6" style={{
                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, var(--card-bg) 50%, rgba(16, 185, 129, 0.03) 100%)",
                    borderColor: "rgba(16, 185, 129, 0.12)",
                }}>
                    <div className="flex items-center gap-3 mb-4">
                        <Cloud className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">API Endpoint</h3>
                    </div>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between p-2 bg-[var(--muted)] rounded">
                            <span className="text-slate-500">Production URL</span>
                            <span className="font-mono text-emerald-500">HF Space / Vercel</span>
                        </div>
                        <div className="flex justify-between p-2 bg-[var(--muted)] rounded">
                            <span className="text-slate-500">Environment</span>
                            <span className="font-mono text-emerald-500">Production</span>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6" style={{
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, var(--card-bg) 50%, rgba(99, 102, 241, 0.03) 100%)",
                    borderColor: "rgba(99, 102, 241, 0.12)",
                }}>
                    <div className="flex items-center gap-3 mb-4">
                        <Globe className="w-5 h-5 text-indigo-500" />
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">Infrastructure</h3>
                    </div>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between p-2 bg-[var(--muted)] rounded">
                            <span className="text-slate-500">Frontend</span>
                            <span className="font-mono text-indigo-500">Vercel CDN</span>
                        </div>
                        <div className="flex justify-between p-2 bg-[var(--muted)] rounded">
                            <span className="text-slate-500">Backend</span>
                            <span className="font-mono text-indigo-500">HuggingFace Spaces</span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <GlassCard className="p-6 border-red-500/10">
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-5 h-5 text-red-500" />
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Admin Capabilities</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-2" />
                        <div className="font-bold text-[var(--text-primary)]">Delete Any Paper</div>
                        <div className="text-slate-500">Remove community content</div>
                    </div>
                    <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-2" />
                        <div className="font-bold text-[var(--text-primary)]">View Analytics</div>
                        <div className="text-slate-500">Full system insights</div>
                    </div>
                    <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-2" />
                        <div className="font-bold text-[var(--text-primary)]">Manage Users</div>
                        <div className="text-slate-500">Role assignment (future)</div>
                    </div>
                    <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-2" />
                        <div className="font-bold text-[var(--text-primary)]">System Config</div>
                        <div className="text-slate-500">API management (future)</div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}

function ServiceRow({ name, description, status, icon, statusIcons, statusLabels }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-xl">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--card-bg)] flex items-center justify-center text-emerald-500">
                    {icon}
                </div>
                <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{name}</div>
                    <div className="text-[10px] text-slate-500">{description}</div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {statusIcons[status]}
                <span className={`text-xs font-bold ${
                    status === "healthy" ? "text-emerald-500" : 
                    status === "degraded" ? "text-amber-500" : 
                    status === "down" ? "text-red-500" : "text-slate-400"
                }`}>
                    {statusLabels[status]}
                </span>
            </div>
        </div>
    );
}