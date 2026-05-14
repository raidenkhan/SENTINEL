"use client";

import dynamic from "next/dynamic";

const Sidebar = dynamic(() => import("@/components/dashboard/Sidebar"), { ssr: false });
const TopNav = dynamic(() => import("@/components/dashboard/TopNav"), { ssr: false });

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full bg-[var(--background)] text-[var(--foreground)] selection:bg-neon-crystal selection:text-black font-sans relative overflow-hidden">
            <div className="fixed inset-0 z-0 bg-grid opacity-20 pointer-events-none" />
            <Sidebar />
            <main className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col">
                <div className="p-4 md:p-8">
                    <TopNav />
                    {children}
                </div>
            </main>
        </div>
    );
}
