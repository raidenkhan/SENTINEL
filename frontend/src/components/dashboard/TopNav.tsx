"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, User, LogOut, ChevronDown, Activity, Sparkles, ExternalLink } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function TopNav() {
    const [user, setUser] = useState<any>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    const getTitle = () => {
        if (pathname === "/dashboard") return "Overview";
        if (pathname === "/dashboard/papers") return "Document Vault";
        if (pathname === "/dashboard/analytics") return "Global Insights";
        if (pathname.includes("/dashboard/papers/")) return "Neural Scan";
        return "Terminal";
    };

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUser(user);
            }
        });

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
          document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const name = user?.user_metadata?.full_name || "Guest User";
    const initial = name.charAt(0).toUpperCase();

    return (
        <header className="flex items-center justify-between w-full pb-8 mb-8 border-b border-black/5 dark:border-white/5 pt-4">
            <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Sentinel Core Active</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none">
                    {getTitle()}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Search Bar (Modern Mini) */}
                <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-xl border border-black/5 dark:border-white/5 bg-slate-50 dark:bg-white/5 w-72 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search engine papers..."
                        className="bg-transparent border-none outline-none w-full text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center gap-3 relative" ref={dropdownRef}>
                    <button className="hidden md:flex w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 items-center justify-center text-slate-400 hover:text-emerald-500 transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[var(--sidebar-bg)] shadow-emerald" />
                    </button>
                    
                    <button 
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-3 pl-1 pr-3 py-1 bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all duration-300"
                    >
                         <div className="w-9 h-9 rounded-xl bg-emerald-500 shadow-emerald flex items-center justify-center text-white font-black text-sm">
                            {user ? initial : <User className="w-4 h-4" />}
                        </div>
                        <div className="hidden md:flex flex-col items-start text-left">
                            <span className="text-[10px] font-black text-slate-900 dark:text-white leading-none uppercase italic truncate max-w-[100px]">{name}</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Verified User</span>
                        </div>
                        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-300", showDropdown && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {showDropdown && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-0 top-14 w-64 glass-card bg-white/90 dark:bg-charcoal-900/90 backdrop-blur-2xl p-2 z-[110] shadow-2xl rounded-2xl border-black/5 dark:border-white/10"
                            >
                                <div className="px-4 py-4 mb-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">Active Session</div>
                                    </div>
                                    <p className="text-xs font-black text-slate-900 dark:text-white italic uppercase tracking-tight">{name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate mt-0.5">{user?.email || "guest@sentinel.ai"}</p>
                                </div>

                                <div className="space-y-0.5">
                                    <DropdownItem icon={<User className="w-4 h-4" />} label="Neural Identity" onClick={() => router.push("/dashboard/settings")} />
                                    <DropdownItem icon={<ExternalLink className="w-4 h-4" />} label="Knowledge Portal" onClick={() => router.push("/")} />
                                    
                                    <div className="my-2 h-px bg-black/5 dark:bg-white/5 mx-2" />
                                    
                                    <button 
                                        onClick={handleSignOut}
                                        className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black tracking-widest text-red-500 hover:bg-red-500/5 transition-all flex items-center gap-3 uppercase italic"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Disconnect
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}

function DropdownItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/5 transition-all flex items-center gap-3 uppercase italic"
    >
      {icon}
      {label}
    </button>
  );
}
