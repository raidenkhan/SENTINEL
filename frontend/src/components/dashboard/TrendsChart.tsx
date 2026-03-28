"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { motion } from "framer-motion";

interface TrendsChartProps {
    data?: { year: number; count: number }[];
}

export function TrendsChart({ data: propData }: TrendsChartProps) {
    // Fallback to empty if no data
    const chartData = propData || [];

    return (
        <div className="glass-card p-4 md:p-8 flex flex-col h-full relative overflow-hidden">
            <div className="flex items-center gap-2 mb-8 z-10">
                <div className="w-3 h-3 rounded-full bg-neon-crystal" />
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Frequency Patterns</h2>
            </div>

            <div className="h-64 md:h-80 w-full z-10">
                <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                    <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#39FF14" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#39FF14" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="year"
                            stroke="var(--border)"
                            tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "monospace" }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderRadius: '8px' }}
                            itemStyle={{ color: '#39FF14' }}
                            labelStyle={{ color: 'var(--text-primary)' }}
                        />

                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#39FF14"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Floating labels for aesthetic flair */}
            {chartData.length > 0 && (
                <div className="absolute top-[40%] right-[10%] text-xl md:text-2xl font-black text-neon-crystal shadow-neon-glow opacity-30">
                    {chartData[chartData.length - 1].count} Qs
                </div>
            )}
        </div>
    );
}

