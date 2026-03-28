"use client";

interface HeatmapProps {
    data?: { topic: string; values: number[] }[];
    years?: number[];
}

export function TopicHeatmap({ data: propData, years: propYears }: HeatmapProps) {
    const years = propYears || [];
    const heatmapData = propData || [];

    const getIntensityClass = (val: number, max: number) => {
        if (max === 0 || val === 0) return "bg-[var(--foreground)]/5 border-[var(--border)]";
        const ratio = val / max;
        if (ratio > 0.8) return "bg-neon-crystal border-neon-crystal shadow-[0_0_10px_rgba(57,255,20,0.4)]";
        if (ratio > 0.5) return "bg-neon-crystal/50 border-neon-crystal/50";
        if (ratio > 0.2) return "bg-neon-crystal/20 border-neon-crystal/20";
        return "bg-neon-crystal/10 border-neon-crystal/10";
    };

    // Find the global maximum for normalization
    const maxVal = Math.max(...heatmapData.flatMap(row => row.values), 1);

    return (
        <div className="glass-card p-4 md:p-8 flex flex-col h-full overflow-x-auto min-h-[400px]">
            <div className="flex items-center gap-2 mb-8">
                <div className="w-3 h-3 rounded-full bg-neon-crystal-dark" />
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Topic Frequency Heatmap</h2>
            </div>

            <div className="w-full min-w-[260px] md:min-w-[500px]">
                {/* Header Row (Years) */}
                <div className="flex mb-2 ml-[80px] md:ml-32">
                    {years.map((year, i) => (
                        <div key={i} className="flex-1 text-center text-xs font-mono text-[var(--text-muted)]">
                            {year}
                        </div>
                    ))}
                    {years.length === 0 && <div className="text-xs text-[var(--text-muted)]">No years uploaded yet</div>}
                </div>

                {/* Matrix Rows */}
                <div className="flex flex-col gap-2">
                    {heatmapData.map((row, rIndex) => (
                        <div key={rIndex} className="flex items-center">
                            <div className="w-[80px] md:w-32 text-[10px] md:text-xs font-medium text-[var(--text-muted)] truncate pr-2 md:pr-4 text-right">
                                {row.topic}
                            </div>
                            <div className="flex flex-1 gap-2">
                                {row.values.map((val, cIndex) => (
                                    <div
                                        key={`${rIndex}-${cIndex}`}
                                        className={`flex-1 h-8 rounded border transition-colors ${getIntensityClass(val, maxVal)} hover:ring-2 hover:ring-white/50 cursor-pointer`}
                                        title={`${row.topic} in ${years[cIndex]}: ${val} instances`}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                    {heatmapData.length === 0 && (
                        <div className="text-center py-10 text-[var(--text-muted)] text-sm italic">
                            No historical topic data available. Upload papers from different years to see trends.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

