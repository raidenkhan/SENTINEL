import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        const variants = {
            primary: "bg-slate-950 text-neon-crystal border border-neon-crystal/50 hover:bg-slate-900 shadow-[0_0_20px_rgba(57,255,20,0.15)]",
            secondary: "bg-neon-blue text-white hover:bg-neon-blue/90 shadow-[0_0_15px_rgba(37,99,235,0.3)]",
            outline: "bg-transparent border-2 border-white/20 text-white hover:bg-white/5",
            ghost: "bg-transparent text-white hover:bg-white/10",
        };

        const sizes = {
            sm: "px-4 py-2 text-xs",
            md: "px-6 py-3 text-sm",
            lg: "px-8 py-4 text-base",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center font-bold tracking-widest transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none uppercase rounded-[var(--radius)]",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";
