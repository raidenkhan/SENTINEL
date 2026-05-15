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
        <div className="glass-card p-4 md:p-8 flex flex-col h-full relative overflow-hidden group" style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, var(--card-bg) 50%, rgba(16, 185, 129, 0.03) 100%)",
            borderColor: "rgba(16, 185, 129, 0.12)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06), inset 0 0 40px -15px rgba(16, 185, 129, 0.15), 0 20px 40px -10px var(--shadow-color)"
        }}>
            <div className="absolute inset-0 pointer-events-none z-0" style={{
                background: "radial-gradient(ellipse 100% 70% at 50% -20%, rgba(16, 185, 129, 0.06) 0%, transparent 60%)"
            }} />
            <div className="absolute top-0 left-0 right-0 h-px z-10" style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.35) 50%, transparent 100%)"
            }} />
            <div className="flex items-center gap-2 mb-8 z-10">
                <div className="w-3 h-3 rounded-full bg-emerald-neon shadow-emerald" />
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Frequency Patterns</h2>
            </div>

            <div className="h-64 md:h-80 w-full z-10">
                <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                    <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                            contentStyle={{ 
                                backgroundColor: 'var(--card-bg)', 
                                borderColor: 'var(--border)', 
                                borderRadius: '12px', 
                                backdropFilter: 'blur(10px)' 
                            }}
                            itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                            labelStyle={{ color: 'var(--text-primary)' }}
                        />

                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Floating labels for aesthetic flair */}
            {chartData.length > 0 && (
                <div className="absolute top-[40%] right-[10%] text-xl md:text-2xl font-black text-emerald-neon opacity-20 group-hover:opacity-40 transition-opacity">
                    {chartData[chartData.length - 1].count} Qs
                </div>
            )}
        </div>
    );
}

