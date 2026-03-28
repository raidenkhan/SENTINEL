"use client";

import { FileText, LayoutDashboard, Settings, UploadCloud, Activity } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-20 md:w-56 flex-shrink-0 border-r border-[var(--border)] bg-[var(--background)] flex flex-col justify-between h-screen sticky top-0 py-6 z-50">
            <div className="flex flex-col items-center md:items-start px-4 md:px-6 gap-10">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-sm bg-neon-crystal/10 border border-neon-crystal/30 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-neon-crystal opacity-20 group-hover:opacity-40 transition-opacity" />
                        <span className="text-neon-crystal font-black text-xl italic tracking-tighter shadow-neon-glow">S</span>
                    </div>
                    <span className="text-2xl font-black text-[var(--text-primary)] italic tracking-tighter hidden md:block uppercase">
                        SENTINEL
                    </span>
                </Link>

                {/* Navigation */}
                <nav className="flex flex-col gap-4 w-full">
                    <NavItem 
                        icon={LayoutDashboard} 
                        label="Dashboard" 
                        href="/dashboard" 
                        active={pathname === "/dashboard"} 
                    />
                    <NavItem 
                        icon={FileText} 
                        label="Past Papers" 
                        href="/dashboard/papers" 
                        active={pathname === "/dashboard/papers"} 
                    />
                    <NavItem 
                        icon={Activity} 
                        label="Analytics" 
                        href="/dashboard/analytics" 
                        active={pathname === "/dashboard/analytics"} 
                    />
                </nav>
            </div>

            {/* Settings / Bottom */}
            <div className="px-4 md:px-6 flex items-center justify-between gap-2">
                <NavItem 
                    icon={Settings} 
                    label="Settings" 
                    href="/dashboard/settings" 
                    active={pathname === "/dashboard/settings"} 
                />
                <div className="hidden md:block">
                    <ThemeToggle />
                </div>
            </div>

            {/* Developer Credits - Bottom Edge */}
            <div className="mt-6 px-4 py-4 border-t border-[var(--border)] bg-[var(--foreground)]/5 hidden md:block">
                <div className="flex flex-col gap-1 text-[9px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                    <span className="font-bold text-[var(--text-primary)]">Developers:</span>
                    <span>Acheampong C. Botateng</span>
                    <span>Azilagbetor Godbless</span>
                </div>
            </div>
        </aside>
    );
}

function NavItem({ icon: Icon, label, active, href }: { icon: any; label: string; active?: boolean; href: string }) {


    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 group ${active
                ? "bg-neon-crystal/10 text-neon-crystal border border-neon-crystal/20 shadow-[0_0_15px_rgba(57,255,20,0.1)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--foreground)]/5 border border-transparent"
                }`}
        >
            <Icon className={`w-5 h-5 mx-auto md:mx-0 transition-transform duration-300 group-hover:scale-110 ${active ? "text-neon-crystal" : "text-[var(--text-muted)]"}`} />
            <span className="text-sm font-medium hidden md:block">{label}</span>
            {active && (
                <motion.div
                    layoutId="activeSide"
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 md:h-4 rounded-l-full bg-neon-crystal"
                />
            )}
        </Link>
    );
}
