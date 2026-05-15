"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useMemo } from "react";

const COLORS = [
    "#10b981", // emerald-neon
    "#6366f1", // indigo-neon
    "#8b5cf6", // violet-500
    "#f43f5e", // rose-500
    "#f59e0b", // amber-500
    "#3b82f6", // blue-500
];

export function BloomsDistribution({ data }: { data?: Record<string, number> }) {
    const chartData = useMemo(() => {
        if (!data || Object.keys(data).length === 0) {
            return [];
        }

        return Object.entries(data).map(([key, value]) => ({
            name: key,
            value: value
        })).sort((a, b) => b.value - a.value); // Sort highest first for better visual
    }, [data]);

    return (
        <div className="glass-card p-4 md:p-8 flex flex-col h-full relative overflow-hidden" style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, var(--card-bg) 50%, rgba(99, 102, 241, 0.04) 100%)",
            borderColor: "rgba(99, 102, 241, 0.15)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06), inset 0 0 30px -10px rgba(99, 102, 241, 0.2), 0 20px 40px -10px var(--shadow-color)"
        }}>
            <div className="absolute inset-0 pointer-events-none z-0" style={{
                background: "radial-gradient(ellipse 100% 80% at 50% -20%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)"
            }} />
            <div className="absolute top-0 left-0 right-0 h-px z-10" style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.4) 50%, transparent 100%)"
            }} />
            <div className="flex items-center gap-2 mb-8 z-10">
                <div className="w-3 h-3 rounded-full bg-indigo-neon shadow-indigo-500/40" />
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Cognitive Complexity</h2>
            </div>

            <p className="text-xs text-[var(--text-muted)] mb-4 z-10">Bloom&apos;s Taxonomy Distribution</p>

            <div className="h-64 w-full z-10">
                {chartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center text-[var(--text-muted)] text-sm italic">
                        No cognitive data available yet.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                        <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="var(--border)"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ 
                                backgroundColor: 'var(--card-bg)', 
                                borderColor: 'var(--border)', 
                                borderRadius: '12px', 
                                backdropFilter: 'blur(10px)' 
                            }}
                            itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                            labelStyle={{ color: 'var(--text-primary)' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            wrapperStyle={{ fontSize: '12px', color: 'var(--text-muted)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

