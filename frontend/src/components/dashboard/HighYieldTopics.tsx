"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";

type TopicInsight = {
    topic: string;
    importance: number;
    confidence: number;
    total_frequency: number;
};

type HighYieldProps = {
    insights?: TopicInsight[];
};

export function HighYieldTopics({ insights }: HighYieldProps) {

    // Process top 4 insights using real backend confidence metrics
    const processedTopics = useMemo(() => {
        if (!insights || insights.length === 0) {
            return [];
        }

        return insights
            .sort((a, b) => b.importance - a.importance)
            .slice(0, 4)
            .map((insight, idx) => ({
                name: insight.topic,
                selected: idx === 0,
                confidence: Math.round(insight.confidence * 100),
                count: insight.total_frequency
            }));
    }, [insights]);

    const topConfidence = processedTopics.length > 0 ? processedTopics[0].confidence : 0;

    return (
        <div className="glass-card p-4 md:p-8 flex flex-col h-full">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">High Yield Topics</h2>

            <div className="flex flex-col gap-4 flex-1">
                {processedTopics.length === 0 ? (
                    <div className="text-center py-10 text-[var(--text-muted)] text-sm italic">
                        No topic data available yet.
                    </div>
                ) : (
                    processedTopics.map((topic, i) => (
                        <div key={i} className="flex justify-between items-center group cursor-pointer">
                            <div className="flex items-center gap-3">
                            {topic.selected ? (
                                <CheckCircle2 className="w-5 h-5 text-neon-crystal flex-shrink-0" />
                            ) : (
                                <Circle className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors flex-shrink-0" />
                            )}
                            <span className={`text-sm ${topic.selected ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]'} truncate`}>
                                {topic.name}
                            </span>
                        </div>
                        {((topic as any).count !== undefined) && (
                            <span className="text-xs text-[var(--text-muted)] font-mono">{(topic as any).count}x</span>
                        )}
                    </div>
                )))}
            </div>

            <div className="mt-8 pt-8 border-t border-[var(--foreground)]/10">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 font-mono">Top Confidence Metric</p>
                <div className="flex items-end gap-2 mb-4">
                    <span className="text-3xl font-black text-neon-crystal">{topConfidence.toFixed(1)}%</span>
                </div>

                {/* Progress bar representing confidence aggregate */}
                <div className="w-full h-1 bg-[var(--foreground)]/5 rounded-full mb-6 max-w-[80%] relative">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-neon-crystal rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${topConfidence}%` }}
                        transition={{ duration: 1 }}
                    />
                    {/* Arrow end */}
                    <motion.div
                        className="absolute top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 border-t border-r border-neon-crystal rotate-45"
                        initial={{ left: "0%" }}
                        animate={{ left: `${topConfidence}%` }}
                        transition={{ duration: 1 }}
                    />
                </div>

                <button className="flex items-center gap-3 px-4 py-2 rounded-sm hover:bg-[var(--foreground)]/5 transition-colors group">
                    <div className="w-8 h-8 rounded-sm bg-neon-crystal/10 border border-neon-crystal/30 flex items-center justify-center text-neon-crystal">
                        <span className="text-xs font-bold font-mono">7</span>
                    </div>
                    <span className="text-sm font-medium text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
                        Generate Briefs
                    </span>
                </button>
            </div>
        </div>
    );
}

