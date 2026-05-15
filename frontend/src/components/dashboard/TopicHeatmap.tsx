"use client";

import { useState } from "react";

interface HeatmapProps {
    data?: { topic: string; values: number[] }[];
    years?: number[];
}

export function TopicHeatmap({ data: propData, years: propYears }: HeatmapProps) {
    const years = propYears || [];
    const heatmapData = propData || [];
    const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

    // Calculate totals for each topic
    const topicTotals = heatmapData.map(row => ({
        topic: row.topic,
        total: row.values.reduce((a, b) => a + b, 0),
        values: row.values
    })).sort((a, b) => b.total - a.total).slice(0, 8); // Top 8 topics

    const maxTotal = Math.max(...topicTotals.map(t => t.total), 1);

    return (
        <div className="glass-card p-4 md:p-6 flex flex-col h-full min-h-[300px]" style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, var(--card-bg) 50%, rgba(16, 185, 129, 0.04) 100%)",
            borderColor: "rgba(16, 185, 129, 0.15)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06), inset 0 0 30px -10px rgba(16, 185, 129, 0.2), 0 20px 40px -10px var(--shadow-color)"
        }}>
            <div className="absolute inset-0 pointer-events-none z-0" style={{
                background: "radial-gradient(ellipse 100% 80% at 50% -20%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)"
            }} />
            <div className="absolute top-0 left-0 right-0 h-px z-10" style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.4) 50%, transparent 100%)"
            }} />
            <div className="flex items-center gap-2 mb-6 z-20">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Topic Frequency</h2>
            </div>

            <div className="flex-1 overflow-y-auto z-20 relative">
                {topicTotals.length === 0 ? (
                    <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                        Upload exam papers to see topic analysis
                    </div>
                ) : (
                    <div className="space-y-3">
                        {topicTotals.map((item, idx) => (
                            <div key={idx} className="group">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-[var(--text-muted)] truncate max-w-[120px] md:max-w-[180px]">
                                        {item.topic}
                                    </span>
                                    <span className="text-xs font-mono text-[var(--text-muted)]">
                                        {item.total}
                                    </span>
                                </div>
                                <div className="relative h-6 bg-[var(--muted)] rounded overflow-hidden">
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-emerald-500/80 rounded transition-all duration-300"
                                        style={{ width: `${(item.total / maxTotal) * 100}%` }}
                                    />
                                    {/* Year indicators */}
                                    <div className="absolute inset-0 flex">
                                        {item.values.map((val, vIdx) => (
                                            <div 
                                                key={vIdx}
                                                className="flex-1 border-l border-r border-white/10"
                                                style={{ opacity: val > 0 ? 0.6 : 0 }}
                                                title={`${years[vIdx]}: ${val}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Legend */}
            {topicTotals.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[var(--border)] flex gap-4 text-[10px] text-[var(--text-muted)]">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded bg-emerald-500/80" />
                        <span>Frequency</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded border border-white/10" />
                        <span>By Year</span>
                    </div>
                </div>
            )}
        </div>
    );
}

