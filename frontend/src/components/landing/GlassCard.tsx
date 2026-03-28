import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    blur?: "sm" | "md" | "lg" | "xl";
    onClick?: () => void;
}

export const GlassCard = ({ children, className, blur = "md", onClick }: GlassCardProps) => {
    const blurs = {
        sm: "backdrop-blur-sm",
        md: "backdrop-blur-md",
        lg: "backdrop-blur-lg",
        xl: "backdrop-blur-xl",
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-[var(--card-bg)] border-[var(--border)] shadow-2xl overflow-hidden active:scale-[0.99] transition-all rounded-[var(--radius)]",
                blurs[blur],
                className
            )}
        >
            {children}
        </div>
    );
};
