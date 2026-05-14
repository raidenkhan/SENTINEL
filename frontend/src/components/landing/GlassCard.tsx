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
                "bg-[var(--card-bg)] border border-[var(--border)] rounded overflow-hidden",
                blurs[blur],
                className
            )}
        >
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};
