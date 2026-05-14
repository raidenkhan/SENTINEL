"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle, Sparkles, Cpu } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
    const [selectedMajor, setSelectedMajor] = useState("");
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        const form = e.target as HTMLFormElement;
        const email = (form.elements.namedItem(isLogin ? "login-email" : "reg-email") as HTMLInputElement)?.value;
        const pass = (form.elements.namedItem(isLogin ? "login-password" : "reg-password") as HTMLInputElement)?.value;
        
        if (!email || !pass || (!isLogin && (!selectedMajor || !selectedLevel))) {
            setError(isLogin ? "All fields are required." : "All fields including Major and Level are required.");
            return;
        }

        setIsLoading(true);
        
        try {
            if (isLogin) {
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password: pass,
                });
                
                if (authError) {
                    setError(authError.message);
                    setIsLoading(false);
                    return;
                }
            } else {
                const name = (form.elements.namedItem("reg-name") as HTMLInputElement)?.value || "";
                
                const { error: authError } = await supabase.auth.signUp({
                    email,
                    password: pass,
                    options: {
                        data: {
                            full_name: name,
                            major: selectedMajor,
                            level: selectedLevel?.toString() || "",
                        }
                    }
                });
                
                if (authError) {
                    setError(authError.message);
                    setIsLoading(false);
                    return;
                }
            }

            setIsLoading(false);
            onClose();
            router.push("/dashboard");
        } catch (err) {
            setError("An unexpected error occurred.");
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 dark:bg-charcoal-950/80 backdrop-blur-xl"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="relative w-full max-w-[480px] glass-card bg-white/90 dark:bg-charcoal-900/60 shadow-2xl z-10 overflow-hidden rounded-[2rem] border-white/20 dark:border-white/10"
                    >
                        {/* THE AI SCANNER VISUAL (Mini version for branding) */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none" />
                        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/30 opacity-50 z-20" />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-slate-400 hover:text-emerald-500 transition-colors z-30 p-2"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-10">
                            {/* Header Branding */}
                            <div className="flex items-center gap-3 mb-12">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-emerald">
                                    <Cpu className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter">SENTINEL_AUTH</h2>
                                    <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Secure Neural Link</p>
                                </div>
                            </div>

                            {/* Tabs (Modern Pill) */}
                            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl mb-8">
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className={cn(
                                        "flex-1 py-3 text-xs font-bold tracking-[0.1em] transition-all rounded-[14px]",
                                        isLogin ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    )}
                                >
                                    LOGIN
                                </button>
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className={cn(
                                        "flex-1 py-3 text-xs font-bold tracking-[0.1em] transition-all rounded-[14px]",
                                        !isLogin ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    )}
                                >
                                    REGISTER
                                </button>
                            </div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                        className="mb-8 flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold tracking-tight"
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Forms Wrapper */}
                            <AnimatePresence mode="wait">
                                <motion.form
                                    key={isLogin ? "login" : "register"}
                                    initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col gap-5"
                                    onSubmit={handleAuth}
                                >
                                    {!isLogin && (
                                        <InputField id="reg-name" label="Full Name" type="text" placeholder="A. Godbless" />
                                    )}
                                    
                                    <InputField
                                        id={isLogin ? "login-email" : "reg-email"}
                                        label="University Email"
                                        type="email"
                                        placeholder="id@st.knust.edu.gh"
                                    />
                                    <InputField
                                        id={isLogin ? "login-password" : "reg-password"}
                                        label="Security Token (Pass)"
                                        type="password"
                                        placeholder="••••••••••••"
                                    />

                                    {!isLogin && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Major</label>
                                                <select 
                                                    value={selectedMajor}
                                                    onChange={(e) => setSelectedMajor(e.target.value)}
                                                    className="w-full min-h-[44px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-xs font-semibold appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select...</option>
                                                    <option value="CompEng">Computer Eng.</option>
                                                    <option value="ElecEng">Electrical Eng.</option>
                                                    <option value="MechEng">Mechanical Eng.</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Level</label>
                                                <div className="grid grid-cols-4 h-[42px] bg-slate-100 dark:bg-white/5 p-1 rounded-lg">
                                                    {[100, 200, 300, 400].map((lvl) => (
                                                        <button
                                                            key={lvl} type="button" onClick={() => setSelectedLevel(lvl)}
                                                            className={cn(
                                                                "h-full rounded-lg text-[10px] font-black transition-all",
                                                                selectedLevel === lvl ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"
                                                            )}
                                                        >
                                                            L{lvl}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-14 mt-4 flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-emerald active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                {isLogin ? "Establish Session" : "Deploy Profile"}
                                                <Sparkles className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </motion.form>
                            </AnimatePresence>
                        </div>

                        {/* Footer Link */}
                        <div className="p-8 border-t border-slate-100 dark:border-white/5 text-center">
                            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                {isLogin ? "Need a neural uplink?" : "Already indexed?"}
                                <button 
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="ml-1.5 text-emerald-500 font-bold hover:underline"
                                >
                                    {isLogin ? "Request Access" : "Connect Now"}
                                </button>
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function InputField({
    id,
    label,
    type,
    placeholder,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                {label}
            </label>
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 px-5 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-semibold text-sm"
                {...props}
            />
        </div>
    );
}
