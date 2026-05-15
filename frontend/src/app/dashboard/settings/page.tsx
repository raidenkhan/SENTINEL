"use client";

import { useState, useEffect } from "react";
import { 
    User, Mail, BookOpen, Clock, Shield, Bell, Download, Trash2, 
    Save, AlertTriangle, Check, Loader2, Key, Monitor, Moon, Sun
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { GlassCard } from "@/components/landing/GlassCard";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");

    const [profile, setProfile] = useState({
        fullName: "",
        email: "",
        major: "",
        level: "",
    });

    useEffect(() => {
        async function loadUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setProfile({
                    fullName: user.user_metadata?.full_name || "",
                    email: user.email || "",
                    major: user.user_metadata?.major || "",
                    level: user.user_metadata?.level || "",
                });
            }
            setLoading(false);
        }
        loadUser();
    }, []);

    const handleSaveProfile = async () => {
        setSaving(true);
        setError("");
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    full_name: profile.fullName,
                    major: profile.major,
                    level: profile.level,
                }
            });

            if (updateError) throw updateError;
            
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err: any) {
            setError(err.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <header className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    Neural Identity Configuration
                </div>
                <h1 className="text-3xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter">
                    Account Settings
                </h1>
                <p className="text-sm text-slate-500">Manage your profile and preferences</p>
            </header>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm"
                >
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard className="p-6" style={{
                        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, var(--card-bg) 50%, rgba(16, 185, 129, 0.03) 100%)",
                        borderColor: "rgba(16, 185, 129, 0.12)",
                    }}>
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--border)]">
                            <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">Profile Information</h2>
                                <p className="text-xs text-slate-500">Update your identity details</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={profile.fullName}
                                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                                            placeholder="A. Godbless"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            className="w-full pl-11 pr-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Major</label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            value={profile.major}
                                            onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Major...</option>
                                            <option value="CompEng">Computer Engineering</option>
                                            <option value="ElecEng">Electrical Engineering</option>
                                            <option value="MechEng">Mechanical Engineering</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Level</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            value={profile.level}
                                            onChange={(e) => setProfile({ ...profile, level: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Level...</option>
                                            <option value="100">Level 100</option>
                                            <option value="200">Level 200</option>
                                            <option value="300">Level 300</option>
                                            <option value="400">Level 400</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="px-6"
                                >
                                    {saving ? (
                                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                                    ) : saved ? (
                                        <><Check className="w-4 h-4 mr-2" /> Saved!</>
                                    ) : (
                                        <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6" style={{
                        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, var(--card-bg) 50%, rgba(99, 102, 241, 0.03) 100%)",
                        borderColor: "rgba(99, 102, 241, 0.12)",
                    }}>
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--border)]">
                            <div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center">
                                <Monitor className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">Appearance</h2>
                                <p className="text-xs text-slate-500">Customize your visual experience</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Theme Mode</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: "light", icon: Sun, label: "Light" },
                                    { id: "dark", icon: Moon, label: "Dark" },
                                    { id: "system", icon: Monitor, label: "System" },
                                ].map(({ id, icon: Icon, label }) => (
                                    <button
                                        key={id}
                                        onClick={() => setTheme(id as any)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                                            theme === id
                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                                : "bg-[var(--muted)] border-[var(--border)] text-slate-500 hover:text-[var(--text-primary)]"
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-xs font-bold">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <div className="space-y-6">
                    <GlassCard className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded bg-emerald-500 shadow-emerald flex items-center justify-center text-white font-black text-sm">
                                {profile.fullName?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[var(--text-primary)]">{profile.fullName || "User"}</h3>
                                <p className="text-xs text-slate-500 truncate max-w-[140px]">{profile.email}</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-2 border-b border-[var(--border)]">
                                <span className="text-slate-500">Major</span>
                                <span className="font-bold text-[var(--text-primary)]">{profile.major || "—"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-[var(--border)]">
                                <span className="text-slate-500">Level</span>
                                <span className="font-bold text-[var(--text-primary)]">{profile.level ? `L${profile.level}` : "—"}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-slate-500">Auth</span>
                                <span className="font-bold text-emerald-500">SECURE_LINK</span>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Bell className="w-5 h-5 text-slate-400" />
                            <h3 className="text-sm font-bold text-[var(--text-primary)]">Notifications</h3>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: "Analysis Complete", default: true },
                                { label: "Weekly Digest", default: true },
                                { label: "Community Updates", default: false },
                            ].map(({ label, default: checked }) => (
                                <label key={label} className="flex items-center justify-between cursor-pointer group">
                                    <span className="text-xs text-slate-500 group-hover:text-[var(--text-primary)] transition-colors">{label}</span>
                                    <div className="relative">
                                        <input type="checkbox" defaultChecked={checked} className="sr-only peer" />
                                        <div className="w-9 h-5 bg-slate-300 dark:bg-white/10 rounded-full peer-checked:bg-emerald-500 transition-colors" />
                                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-all shadow" />
                                    </div>
                                </label>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 border-red-500/10">
                        <div className="flex items-center gap-3 mb-6">
                            <Key className="w-5 h-5 text-red-500" />
                            <h3 className="text-sm font-bold text-[var(--text-primary)]">Security</h3>
                        </div>

                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-3 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors group">
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-[var(--text-primary)]">Change Password</span>
                                <span className="text-emerald-500 text-xs font-bold">Update</span>
                            </button>
                            
                            <button className="w-full flex items-center justify-between p-3 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors group">
                                <div className="flex items-center gap-2">
                                    <Download className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-[var(--text-primary)]">Export Data</span>
                                </div>
                            </button>

                            <button className="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-500/5 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors group border border-red-500/10">
                                <div className="flex items-center gap-2">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                    <span className="text-xs font-bold text-red-500">Delete Account</span>
                                </div>
                            </button>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}