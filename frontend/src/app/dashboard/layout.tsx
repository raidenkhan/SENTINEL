import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full bg-[var(--background)] text-[var(--foreground)] selection:bg-neon-crystal selection:text-black font-sans relative overflow-hidden">
            {/* Background Subtle Grid - similar to landing page but much darker */}
            <div className="fixed inset-0 z-0 bg-grid opacity-20 pointer-events-none" />

            {/* Sidebar is permanent in the layout */}
            <Sidebar />

            {/* Main content area gets the scrollbar */}
            <main className="flex-1 relative z-10 overflow-y-auto custom-scrollbar">
                {children}
            </main>
        </div>
    );
}
