"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useMemo } from "react";

const COLORS = [
    "#39FF14", // neon-crystal
    "#2563EB", // neon-blue
    "#7c3aed", // violet-600
    "#db2777", // pink-600
    "#EAB308", // yellow-500
    "#EF4444", // red-500
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
        <div className="glass-card p-4 md:p-8 flex flex-col h-full relative overflow-hidden">
            <div className="flex items-center gap-2 mb-8 z-10">
                <div className="w-3 h-3 rounded-full bg-neon-blue" />
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
                            contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: '8px' }}
                            itemStyle={{ color: 'var(--text-primary)' }}
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

