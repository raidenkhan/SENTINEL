import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "navCta";
    size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        const variants = {
            primary: "bg-emerald-500 text-white border border-emerald-600 hover:bg-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.3)]",
            secondary: "bg-indigo-500 text-white hover:bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.3)]",
            outline: "bg-transparent border-2 border-current text-inherit hover:opacity-80",
            ghost: "bg-transparent hover:opacity-80",
            navCta: "bg-[#0D0D0F] text-white hover:bg-[#0D0D0F]/80 active:scale-[0.97] transition-all",
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
                    "inline-flex items-center justify-center font-bold tracking-widest transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none uppercase rounded-lg",
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
