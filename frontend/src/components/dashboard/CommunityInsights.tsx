"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, Globe, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Trend {
    topic: string;
    count: number;
}

interface CommunityStats {
    total_papers: number;
    active_subjects: number;
}

export function CommunityInsights() {
    const [trends, setTrends] = useState<Trend[]>([]);
    const [stats, setStats] = useState<CommunityStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        async function fetchCommunityData() {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            try {
                const res = await fetch(`${API_URL}/api/community/trends`);
                if (res.ok) {
                    const data = await res.json();
                    setTrends(data.trending_topics);
                    setStats(data.stats);
                }
            } catch (err) {
                console.error("Failed to fetch community trends", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchCommunityData();
    }, [API_URL]);

    if (isLoading) {
        return (
            <div className="glass-card p-6 h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-slate-500">Syncing with Community Brain...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 md:p-8 flex flex-col h-full border-l-4 border-l-neon-crystal relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Globe className="w-24 h-24 text-neon-crystal" />
            </div>

            <div className="flex items-center justify-between mb-6 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-neon-crystal/10 border border-neon-crystal/30 flex items-center justify-center">
                        <Users className="w-5 h-5 text-neon-crystal" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-100 italic">Community Brain</h2>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Department Wide Insights</p>
                    </div>
                </div>
                {stats && (
                    <div className="text-right">
                        <div className="text-xl font-black text-neon-crystal">{stats.total_papers}</div>
                        <div className="text-[8px] text-slate-500 uppercase">Shared Papers</div>
                    </div>
                )}
            </div>

            <div className="space-y-4 mb-6 z-10">
                <h3 className="text-xs font-bold text-slate-400 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-neon-crystal" />
                    TRENDING TOPICS
                </h3>
                <div className="flex flex-wrap gap-2">
                    {trends.map((t, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="px-3 py-1.5 rounded-sm bg-slate-800/80 border border-slate-700 text-xs text-slate-300 hover:border-neon-crystal/50 transition-colors cursor-default"
                        >
                            {t.topic} <span className="text-neon-crystal ml-1 font-mono">{t.count}</span>
                        </motion.div>
                    ))}
                    {trends.length === 0 && (
                        <div className="text-xs text-slate-600 italic">Starting to aggregate global data...</div>
                    )}
                </div>
            </div>

            <div className="mt-auto border-t border-slate-700/50 pt-4 z-10">
                <div className="p-3 rounded-sm bg-neon-crystal/5 border border-neon-crystal/10">
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                        <span className="text-neon-crystal font-bold">PRO TIP:</span> Your Study Assistant now automatically searches these subjects if your current data is insufficient.
                    </p>
                </div>
                <button className="w-full mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-neon-crystal hover:text-white transition-colors group/btn">
                    EXPLORE GLOBAL DATABASE <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
