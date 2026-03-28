"use client";

import { useState } from "react";
import { TopNav } from "@/components/dashboard/TopNav";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import { FileProcessingView } from "@/components/dashboard/FileProcessingView";
import { TrendsChart } from "@/components/dashboard/TrendsChart";
import { HighYieldTopics } from "@/components/dashboard/HighYieldTopics";
import { TopicHeatmap } from "@/components/dashboard/TopicHeatmap";
import { BloomsDistribution } from "@/components/dashboard/BloomsDistribution";
import { StudyAssistantChat } from "@/components/dashboard/StudyAssistantChat";
import { CommunityInsights } from "@/components/dashboard/CommunityInsights";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const [activeMobileTab, setActiveMobileTab] = useState('overview');

    // 1. Fetch papers to determine active course
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    // Mock user context - In production this comes from Supabase session
    const [userPrefs, setUserPrefs] = useState({ 
        major: "Computer Engineering", 
        level: 300 
    });

    // Fetch papers with user-specific fallback filters
    const { data: papers, error: papersError } = useSWR(
        `${API_URL}/api/papers?course_name=${userPrefs.major}&year=${userPrefs.level}`, 
        fetcher
    );
    const activeCourseId = papers && papers.length > 0 ? papers[0].course_id : null;

    // 2. Fetch analytics conditionally
    const { data: analyticsData } = useSWR(
        activeCourseId ? `${API_URL}/api/analytics/${activeCourseId}` : null,
        fetcher
    );

    return (
        <div className="flex flex-col w-full min-h-full p-4 md:p-8">
            <TopNav />

            <motion.div
                className="flex flex-col gap-6 w-full max-w-[1800px] mx-auto pb-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Mobile Tabs */}
                <div className="flex md:hidden overflow-x-auto gap-2 -mt-2 mb-2 pb-2 scrollbar-none border-b border-[var(--foreground)]/10">
                    {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'topics', label: 'Topics & Insights' },
                        { id: 'community', label: 'Community' },
                        { id: 'assistant', label: 'AI Assistant' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveMobileTab(tab.id)}
                            className={`px-4 py-2 text-sm font-bold whitespace-nowrap transition-all ${
                                activeMobileTab === tab.id 
                                    ? 'border-b-2 border-neon-crystal text-neon-crystal' 
                                    : 'border-b-2 border-transparent text-slate-500 hover:text-[var(--foreground)]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <section className={`w-full ${activeMobileTab === 'overview' ? 'block' : 'hidden'} md:block`}>
                    <FileProcessingView onUploadComplete={async () => {
                        await mutate(`${API_URL}/api/papers`);
                        if (activeCourseId) {
                            mutate(`${API_URL}/api/analytics/${activeCourseId}`);
                        }
                    }} />
                </section>

                {/* Middle Section - Chart & Sidebar Panel */}
                <section className="flex flex-col lg:flex-row gap-6 w-full">
                    <div className={`w-full lg:w-2/3 ${activeMobileTab === 'overview' ? 'block' : 'hidden'} md:block`}>
                        <TrendsChart data={analyticsData?.trends} />
                    </div>
                    <div className={`w-full lg:w-1/3 ${activeMobileTab === 'overview' ? 'block' : 'hidden'} md:block`}>
                        <HighYieldTopics insights={analyticsData?.topic_insights} />
                    </div>
                </section>

                {/* Bottom Section - Heatmap, Blooms, and Chat (FR7/FR8/FR10 features) */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    <div className={`lg:col-span-1 ${activeMobileTab === 'topics' ? 'block' : 'hidden'} md:block`}>
                        <TopicHeatmap data={analyticsData?.heatmap} years={analyticsData?.years} />
                    </div>
                    <div className={`lg:col-span-1 ${activeMobileTab === 'topics' ? 'block' : 'hidden'} md:block`}>
                        <BloomsDistribution data={analyticsData?.blooms_distribution} />
                    </div>
                    <div className={`lg:col-span-1 ${activeMobileTab === 'community' ? 'block' : 'hidden'} md:block`}>
                        <CommunityInsights />
                    </div>
                    <div className={`lg:col-span-1 ${activeMobileTab === 'assistant' ? 'block' : 'hidden'} md:block`}>
                        <StudyAssistantChat />
                    </div>
                </section>
            </motion.div>
        </div>
    );
}

