"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        // Basic validation mock
        const form = e.target as HTMLFormElement;
        const email = (form.elements.namedItem(isLogin ? "login-email" : "reg-email") as HTMLInputElement)?.value;
        const pass = (form.elements.namedItem(isLogin ? "login-password" : "reg-password") as HTMLInputElement)?.value;
        const major = (form.elements.namedItem("reg-course") as HTMLSelectElement)?.value;
        const level = (form.elements.namedItem("reg-year") as HTMLInputElement)?.value;
        
        if (!email || !pass || (!isLogin && (!major || !level))) {
            setError(isLogin ? "All fields are required." : "All fields including Major and Level are required.");
            return;
        }
        if (!email.includes("@")) {
            setError("Invalid email format.");
            return;
        }
        if (pass.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setIsLoading(true);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
        onClose();
        router.push("/dashboard");
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="relative w-full max-w-[450px] bg-[#0A0A0A] border-[0.5px] border-[var(--foreground)]/20 shadow-2xl z-10 overflow-hidden"
                    >
                        {/* Corner Decorative Accents */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-crystal/50 -translate-x-[2px] -translate-y-[2px]" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-crystal/50 translate-x-[2px] translate-y-[2px]" />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-500 hover:text-neon-crystal transition-colors z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8">
                            {/* Tabs */}
                            <div className="flex w-full mb-10 border border-[var(--foreground)]/10 rounded overflow-hidden">
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className={`flex-1 py-4 text-xs font-mono font-bold tracking-[0.2em] transition-colors ${isLogin
                                            ? "bg-[var(--foreground)]/5 text-slate-100"
                                            : "bg-transparent text-slate-500 hover:text-slate-300"
                                        }`}
                                >
                                    SIGN IN
                                </button>
                                <div className="w-[1px] bg-[var(--foreground)]/10" />
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className={`flex-1 py-4 text-xs font-mono font-bold tracking-[0.2em] transition-colors ${!isLogin
                                            ? "bg-[var(--foreground)]/5 text-slate-100"
                                            : "bg-transparent text-slate-500 hover:text-slate-300"
                                        }`}
                                >
                                    GET ACCESS
                                </button>
                            </div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mb-6 flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm text-xs font-mono tracking-widest uppercase italic font-bold"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Forms Wrapper */}
                            <div className="relative min-h-[300px]">
                                <AnimatePresence mode="wait">
                                    {isLogin ? (
                                        <motion.form
                                            key="login"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex flex-col gap-6"
                                            onSubmit={handleAuth}
                                        >
                                            <InputField
                                                id="login-email"
                                                label="01 // EMAIL"
                                                type="email"
                                                placeholder="student_id@university.edu"
                                            />
                                            <InputField
                                                id="login-password"
                                                label="02 // PASSWORD"
                                                type="password"
                                                placeholder="••••••••••••"
                                            />

                                            <div className="flex justify-between items-center mt-2">
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 appearance-none border border-slate-700 rounded bg-transparent checked:bg-neon-crystal checked:border-neon-crystal focus:outline-none transition-colors relative
                            before:content-[''] before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjIwIDYgOSAxNyA0IDEyIj48L3BvbHlsaW5lPjwvc3ZnPg==')] before:bg-center before:bg-no-repeat before:bg-[length:10px] before:opacity-0 checked:before:opacity-100"
                                                    />
                                                    <span className="text-xs font-mono font-bold tracking-wider text-slate-400 group-hover:text-slate-300">
                                                        PERSISTENT
                                                    </span>
                                                </label>
                                                <button className="text-xs font-mono font-bold tracking-wider text-neon-crystal hover:text-neon-crystal-dark transition-colors">
                                                    RECOVERY
                                                </button>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full h-12 mt-6 flex items-center justify-center gap-3 bg-neon-crystal text-black font-mono font-black text-sm tracking-[0.2em] hover:bg-neon-crystal-dark transition-all custom-focus disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : "INITIALIZE SESSION"}
                                            </button>
                                        </motion.form>
                                    ) : (
                                        <motion.form
                                            key="register"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex flex-col gap-5"
                                            onSubmit={handleAuth}
                                        >
                                            <InputField
                                                id="reg-name"
                                                label="01 // FULL NAME"
                                                type="text"
                                                placeholder="John Doe"
                                            />
                                            <InputField
                                                id="reg-email"
                                                label="02 // EMAIL"
                                                type="email"
                                                placeholder="student_id@university.edu"
                                            />
                                            <InputField
                                                id="reg-password"
                                                label="03 // PASSWORD"
                                                type="password"
                                                placeholder="••••••••••••"
                                            />
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-mono font-bold tracking-widest text-slate-300">
                                                    04 // FIELD OF STUDY
                                                </label>
                                                <select 
                                                    id="reg-course"
                                                    className="w-full bg-[#111111] border border-slate-800 text-slate-200 px-4 py-3 rounded-none focus:outline-none focus:border-neon-crystal/50 transition-colors font-mono text-xs"
                                                >
                                                    <option value="">SELECT MAJOR...</option>
                                                    <option value="Computer Engineering">Computer Engineering</option>
                                                    <option value="Electrical Engineering">Electrical Engineering</option>
                                                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                                                    <option value="Civil Engineering">Civil Engineering</option>
                                                    <option value="Telecommunications">Telecommunications</option>
                                                    <option value="Aerospace Engineering">Aerospace Engineering</option>
                                                    <option value="Biomedical Engineering">Biomedical Engineering</option>
                                                    <option value="Chemical Engineering">Chemical Engineering</option>
                                                    <option value="Geomatic Engineering">Geomatic Engineering</option>
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-mono font-bold tracking-widest text-slate-300">
                                                    05 // ACADEMIC LEVEL
                                                </label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {[100, 200, 300, 400].map((lvl) => (
                                                        <button
                                                            key={lvl}
                                                            type="button"
                                                            onClick={(e) => {
                                                                const parent = e.currentTarget.parentElement;
                                                                parent?.querySelectorAll('button').forEach(b => b.classList.remove('bg-neon-crystal', 'text-black'));
                                                                parent?.querySelectorAll('button').forEach(b => b.classList.add('bg-transparent', 'text-slate-500'));
                                                                e.currentTarget.classList.remove('bg-transparent', 'text-slate-500');
                                                                e.currentTarget.classList.add('bg-neon-crystal', 'text-black');
                                                                // Store in a hidden input for the form submit
                                                                const hidden = document.getElementById('reg-year-hidden') as HTMLInputElement;
                                                                if (hidden) hidden.value = lvl.toString();
                                                            }}
                                                            className="py-3 border border-slate-800 text-[10px] font-black font-mono tracking-tighter hover:border-neon-crystal/40 transition-all bg-transparent text-slate-500"
                                                        >
                                                            L{lvl}
                                                        </button>
                                                    ))}
                                                    <input type="hidden" id="reg-year-hidden" name="reg-year" value="" />
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full h-12 mt-4 flex items-center justify-center gap-3 bg-neon-crystal text-black font-mono font-black text-sm tracking-[0.2em] hover:bg-neon-crystal-dark transition-all custom-focus disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : "ESTABLISH PROFILE"}
                                            </button>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Faint dot grid overlay on modal background */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-[-1]" />
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
            <label htmlFor={id} className="text-xs font-mono font-bold tracking-widest text-slate-300">
                {label}
            </label>
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                className="w-full bg-[#111111] border border-slate-800 text-slate-200 placeholder:text-slate-600 px-4 py-3 rounded-none focus:outline-none focus:border-neon-crystal/50 transition-colors font-mono text-sm"
                {...props}
            />
        </div>
    );
}
