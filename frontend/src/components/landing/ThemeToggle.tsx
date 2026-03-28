"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/Button";

export function ThemeToggle() {
    const [mounted, setMounted] = React.useState(false);
    const { theme, resolvedTheme, setTheme } = useTheme();

    // Prevent hydration mismatch by only rendering after mounting
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-10 h-10 rounded-full border border-[var(--foreground)]/10" />
        );
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
            className="p-2 border border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/5 transition-all w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden"
            aria-label="Toggle theme"
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-400" />
        </Button>
    );
}
