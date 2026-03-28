import { Bell, Search, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function TopNav() {
    return (
        <header className="flex items-center justify-between w-full pb-8 mb-8 border-b border-[var(--foreground)]/5">
            <div className="flex items-center gap-4 text-slate-400">
                <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                    Overview
                </h1>
            </div>

            <div className="flex items-center gap-6">
                {/* Search */}
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-sm border border-[var(--border)] text-sm w-64 bg-white dark:bg-slate-800/50 shadow-sm focus-within:border-neon-crystal/50 transition-all">
                    <Search className="w-4 h-4 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search past papers..."
                        className="bg-transparent border-none outline-none w-full text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center px-1.5 py-1.5 rounded-sm bg-[var(--card-bg)] border border-[var(--border)] shadow-sm">
                        <ThemeToggle />
                    </div>
                    
                    <button className="w-10 h-10 rounded-sm bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-neon-crystal transition-colors relative shadow-sm">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-neon-crystal rounded-full border-2 border-[var(--card-bg)]" />
                    </button>
                    
                    <div className="w-10 h-10 rounded-sm bg-neon-crystal/10 border border-neon-crystal/30 flex items-center justify-center text-neon-crystal font-bold shadow-sm">
                        <User className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </header>
    );
}
