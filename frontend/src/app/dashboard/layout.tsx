import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopNav } from "@/components/dashboard/TopNav";

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

            {/* Main content area */}
            <main className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col">
                <div className="p-4 md:p-8">
                    <TopNav />
                    {children}
                </div>
            </main>
        </div>
    );
}
