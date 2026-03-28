"use client";

import { Send, Bot, Sparkles, User, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type Message = {
    role: 'user' | 'assistant';
    content: string;
}

export function StudyAssistantChat() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I've analyzed the recent exam papers. What would you like to know about the exam patterns?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Placeholder course ID - in production this would come from a context or URL
    const courseId = "123e4567-e89b-12d3-a456-426614174000";
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg,
                    course_id: courseId
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the brain right now." }]);
            }
        } catch (error) {
            console.error("Chat error", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Is the backend running?" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-card p-6 md:p-8 flex flex-col h-[500px] border-t-4 border-t-neon-blue relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-neon-blue/10 blur-[50px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-3 mb-6 z-10">
                <div className="w-10 h-10 rounded-sm bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-neon-blue" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                        Sentinel AI <Sparkles className="w-3 h-3 text-neon-crystal" />
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">RAG Study Assistant</p>
                </div>
            </div>

            {/* Chat Area */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto flex flex-col gap-4 mb-4 z-10 pr-2 custom-scrollbar"
            >
                {messages.map((msg, i) => (
                    <div 
                        key={i}
                        className={`p-4 text-sm max-w-[85%] rounded-sm ${
                            msg.role === 'assistant' 
                            ? 'bg-[var(--foreground)]/5 border border-[var(--border)] text-[var(--text-primary)] self-start rounded-tl-sm' 
                            : 'bg-neon-blue/10 border border-neon-blue/20 text-[var(--text-primary)] self-end rounded-tr-sm shadow-[0_0_15px_rgba(37,99,235,0.05)]'
                        }`}
                    >
                        {msg.content}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Thinking...
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="relative z-10">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask a question..."
                    className="w-full bg-white dark:bg-slate-900 border border-[var(--border)] rounded-sm py-3 pl-4 pr-12 text-sm text-[var(--text-primary)] focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all placeholder:text-[var(--text-muted)] shadow-sm"
                />
                <button 
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue hover:bg-neon-blue hover:text-white transition-colors disabled:opacity-50"
                >
                    <Send className="w-4 h-4 ml-0.5" />
                </button>
            </div>
        </div>
    );
}
