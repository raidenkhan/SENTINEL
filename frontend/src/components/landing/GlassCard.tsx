import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties } from "react";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    blur?: "sm" | "md" | "lg" | "xl";
    glow?: "emerald" | "indigo" | "amber" | "rose" | "cyan" | "violet";
    onClick?: () => void;
    style?: CSSProperties;
}

const glowClasses = {
    emerald: {
        bg: "rgba(16, 185, 129, 0.15)",
        border: "rgba(16, 185, 129, 0.25)",
        top: "rgba(16, 185, 129, 0.5)",
        inner: "16 185 129",
    },
    indigo: {
        bg: "rgba(99, 102, 241, 0.15)",
        border: "rgba(99, 102, 241, 0.25)",
        top: "rgba(99, 102, 241, 0.5)",
        inner: "99 102 241",
    },
    amber: {
        bg: "rgba(245, 158, 11, 0.15)",
        border: "rgba(245, 158, 11, 0.25)",
        top: "rgba(245, 158, 11, 0.5)",
        inner: "245 158 11",
    },
    rose: {
        bg: "rgba(244, 63, 94, 0.15)",
        border: "rgba(244, 63, 94, 0.25)",
        top: "rgba(244, 63, 94, 0.5)",
        inner: "244 63 94",
    },
    cyan: {
        bg: "rgba(6, 182, 212, 0.15)",
        border: "rgba(6, 182, 212, 0.25)",
        top: "rgba(6, 182, 212, 0.5)",
        inner: "6 182 212",
    },
    violet: {
        bg: "rgba(139, 92, 246, 0.15)",
        border: "rgba(139, 92, 246, 0.25)",
        top: "rgba(139, 92, 246, 0.5)",
        inner: "139 92 246",
    },
};

export const GlassCard = ({ children, className, blur = "md", glow, onClick, style }: GlassCardProps) => {
    const blurs = {
        sm: "backdrop-blur-sm",
        md: "backdrop-blur-md",
        lg: "backdrop-blur-lg",
        xl: "backdrop-blur-xl",
    };

    const glowStyle = glow ? glowClasses[glow] : null;

    const combinedStyle = glowStyle ? {
        ...style,
        background: `linear-gradient(135deg, ${glowStyle.bg} 0%, var(--card-bg) 50%, ${glowStyle.bg.replace('0.15', '0.08')} 100%)`,
        borderColor: glowStyle.border,
        boxShadow: `inset 0 1px 1px rgba(255,255,255,0.06), inset 0 0 40px -10px rgba(${glowStyle.inner}, 0.25), 0 20px 40px -10px var(--shadow-color)`,
    } : style;

    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-[var(--card-bg)] border rounded overflow-hidden relative",
                blurs[blur],
                className
            )}
            style={combinedStyle}
        >
            {glowStyle && (
                <>
                    <div 
                        className="absolute inset-0 pointer-events-none z-0"
                        style={{
                            background: `radial-gradient(ellipse 100% 80% at 50% -20%, ${glowStyle.bg} 0%, transparent 60%)`,
                        }}
                    />
                    <div 
                        className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
                        style={{
                            background: `linear-gradient(90deg, transparent 0%, ${glowStyle.top} 50%, transparent 100%)`,
                        }}
                    />
                </>
            )}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};
