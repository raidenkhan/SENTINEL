"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-10 h-10" />;
    }

    const isDark = resolvedTheme === "dark";

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-10 h-10 rounded-sm bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-center text-[var(--text-primary)] hover:border-neon-crystal/50 transition-colors relative overflow-hidden group shadow-sm"
            aria-label="Toggle theme"
        >
            <div className="absolute inset-0 bg-neon-crystal opacity-0 group-hover:opacity-5 transition-opacity" />
            
            {isDark ? (
                <Sun className="w-5 h-5 text-neon-crystal" />
            ) : (
                <Moon className="w-5 h-5 text-[var(--text-muted)] group-hover:text-neon-crystal transition-colors" />
            )}
        </motion.button>
    );
}
