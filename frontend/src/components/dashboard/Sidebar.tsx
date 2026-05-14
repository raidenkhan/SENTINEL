"use client";

import { FileText, LayoutDashboard, Settings, UploadCloud, Activity, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-20 md:w-64 flex-shrink-0 bg-[var(--sidebar-bg)] border-r border-black/5 dark:border-white/5 flex flex-col justify-between h-screen sticky top-0 py-8 z-50 transition-all relative overflow-hidden">
            {/* NOISE OVERLAY */}
            <div className="absolute inset-0 pointer-events-none bg-noise opacity-[0.02] dark:opacity-[0.04] z-0" />
            
            <div className="flex flex-col items-center md:items-start px-4 md:px-8 gap-14 relative z-10">
                {/* Brand Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative">
<div className="w-10 h-10 rounded bg-emerald-500 flex items-center justify-center relative overflow-hidden shadow-emerald group-hover:scale-110 transition-transform duration-500">
                           <ShieldCheck className="w-6 h-6 text-white" />
                       </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-[var(--sidebar-bg)] shadow-indigo-500/50" />
                    </div>
                    <span className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter hidden md:block uppercase leading-none">
                        SENTINEL<span className="text-emerald-500">.</span>
                    </span>
                </Link>

                {/* Navigation Navigation */}
                <nav className="flex flex-col gap-2 w-full">
                    <p className="hidden md:block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">Main Menu</p>
                    <NavItem 
                        icon={LayoutDashboard} 
                        label="Overview" 
                        href="/dashboard" 
                        active={pathname === "/dashboard"} 
                    />
                    <NavItem 
                        icon={FileText} 
                        label="Document Vault" 
                        href="/dashboard/papers" 
                        active={pathname === "/dashboard/papers" || pathname.includes("/dashboard/papers/")} 
                    />
                    <NavItem 
                        icon={Activity} 
                        label="Global Insights" 
                        href="/dashboard/analytics" 
                        active={pathname === "/dashboard/analytics"} 
                    />
                    
                    <div className="my-6 border-t border-black/5 dark:border-white/5 w-full hidden md:block" />
                    
                    <p className="hidden md:block text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">Intelligence</p>
                    <NavItem 
                        icon={Zap} 
                        label="Engine Status" 
                        href="/dashboard/status" 
                        active={pathname === "/dashboard/status"} 
                    />
                    <NavItem 
                        icon={Settings} 
                        label="Neural Config" 
                        href="/dashboard/settings" 
                        active={pathname === "/dashboard/settings"} 
                    />
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="px-4 md:px-8 space-y-6">
                <div className="flex items-center justify-between gap-2 p-2 bg-slate-100 dark:bg-white/5 rounded hidden md:flex">
                    <ThemeToggle />
                    <div className="flex flex-col text-[8px] font-bold text-slate-500 mr-2 uppercase tracking-tight">
                        <span>Mode</span>
                        <span className="text-emerald-500">Active</span>
                    </div>
                </div>

                <div className="mt-6 p-4 rounded bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/10 hidden md:block">
                    <div className="flex flex-col gap-1.5 text-[8px] font-medium uppercase tracking-widest text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-500 font-bold mb-1">
                            <Activity className="w-3 h-3" />
                            NETWORK LIVE
                        </div>
                        <span className="opacity-60">Auth: SECURE_LINK</span>
                        <span className="opacity-60">Dist: NODE_KNUST_01</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function NavItem({ icon: Icon, label, active, href }: { icon: any; label: string; active?: boolean; href: string }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded transition-all duration-300 group relative",
                active
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            )}
        >
            <Icon className={cn(
                "w-5 h-5 mx-auto md:mx-0 transition-all duration-500",
                active ? "text-emerald-600 dark:text-emerald-500 scale-110" : "text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 group-hover:scale-110"
            )} />
            <span className="text-xs font-medium hidden md:block">{label}</span>
            
            {active && (
                <motion.div
                    layoutId="activeSidePill"
                    className="absolute left-0 w-1.5 h-6 bg-emerald-500 rounded-r-full shadow-emerald"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
        </Link>
    );
}
