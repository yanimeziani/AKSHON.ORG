"use client";

import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, Zap, ChevronRight, BarChart3, Search, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import LeadCapture from "@/components/LeadCapture";

export default function SynthesisPage() {
    const [progress, setProgress] = useState(0);
    const [isCaptureOpen, setIsCaptureOpen] = useState(false);

    const triggerCapture = () => setIsCaptureOpen(true);

    // Audit log: Tracker initialized for Synthesis session
    useEffect(() => {
        console.log("[AUDIT] - Synthesis engine session initiated.");
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev: number) => (prev >= 100 ? 0 : prev + 1));
        }, 100); // Speed up for demo
        return () => clearInterval(interval);
    }, []);


    const breakthroughs = [
        {
            title: "Hamiltonian Convergence in Neural Latents",
            confidence: "98.4%",
            impact: "High",
            status: "Verified",
            description: "Evidence of energy-preserving dynamics in transformer hidden states identified across 4.2TB corpus."
        },
        {
            title: "Cross-Domain Knowledge Arbitrage",
            confidence: "94.1%",
            impact: "Extreme",
            status: "Synthesizing",
            description: "Identifying structural similarities between quantum error correction and social network stability."
        },
        {
            title: "Sovereign Intelligence Thresholds",
            confidence: "82.7%",
            impact: "Medium",
            status: "Simulating",
            description: "Quantifying the emergence of self-directed research goals in autonomous agent swarms."
        }
    ];

    return (
        <main className="min-h-screen bg-black pt-32 pb-24 overflow-hidden relative">
            <Navbar />

            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full animate-pulse delay-1000" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <header className="mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-primary font-mono text-[10px] uppercase tracking-[0.4em] mb-4 block"
                    >
                        Intelligence Processing Unit
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-6"
                    >
                        Research <span className="text-primary italic">Synthesis</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground font-light max-w-2xl italic"
                    >
                        AKSHON AI doesn't just read papers; it builds bridges between them.
                        Our Synthesis engine identifies "Alpha" opportunities where disparate fields converge.
                    </motion.p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Real-time Status */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-2 space-y-8"
                    >
                        <div className="glass p-8 rounded-[40px] border-white/5 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                                        <Activity className="text-primary w-6 h-6" />
                                        Active Matrix
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">Cross-correlating 12,402 research vectors</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-mono text-primary animate-pulse uppercase tracking-[0.2em]">Synchronizing...</span>
                                    <div className="text-3xl font-black text-white mt-1">99.98%</div>
                                </div>
                            </div>

                            {/* Processing Visualization */}
                            <div className="h-64 flex items-end gap-1 mb-8">
                                {[...Array(30)].map((_, i) => (
                                    <Bar key={i} index={i} />
                                ))}
                            </div>


                            <div className="flex gap-4">
                                <Button
                                    onClick={triggerCapture}
                                    className="bg-primary text-black font-black uppercase tracking-widest text-xs h-12 px-8 rounded-full"
                                >
                                    Open Terminal
                                </Button>
                                <Button
                                    onClick={triggerCapture}
                                    variant="outline"
                                    className="border-white/10 text-white font-black uppercase tracking-widest text-xs h-12 px-8 rounded-full glass"
                                >
                                    Download Logs
                                </Button>
                            </div>
                        </div>

                        {/* Synthesis List */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white uppercase tracking-[0.2em] px-2 italic">Synthesized Breakthroughs</h3>
                            {breakthroughs.map((b, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="glass p-6 rounded-3xl border-white/5 hover:border-primary/20 transition-all group cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                                                <Brain className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-black uppercase italic tracking-tight">{b.title}</h4>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{b.status}</span>
                                                    <span className="text-[10px] bg-white/5 text-muted-foreground px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Impact: {b.impact}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <p className="text-sm text-muted-foreground font-light italic leading-relaxed">
                                        {b.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Sidebar components */}
                    <div className="space-y-8">
                        {/* Capabilities Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass p-8 rounded-[40px] border-white/5"
                        >
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-6">Engine Stats</h3>
                            <div className="space-y-6">
                                {[
                                    { label: "Throughput", value: "3.2B tokens/s", icon: Zap },
                                    { label: "Coherence", value: "0.94 Alpha", icon: Sparkles },
                                    { label: "Deep Search", value: "Enabled", icon: Search },
                                    { label: "Latent Depth", value: "8,192 dims", icon: BarChart3 },
                                ].map((stat, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <stat.icon className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{stat.label}</span>
                                        </div>
                                        <span className="text-sm font-black text-white">{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Prompt Input */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass p-8 rounded-[40px] border-white/5"
                        >
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4">Direct Synthesis</h3>
                            <p className="text-xs text-muted-foreground mb-6 uppercase tracking-[0.1em] font-bold">
                                Command the engine to bridge specific research domains.
                            </p>
                            <div className="space-y-4">
                                <textarea
                                    placeholder="E.g., Bridge 'Topological Insulators' with 'Recurrent Flash Attention'..."
                                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20 resize-none italic"
                                />
                                <Button
                                    onClick={triggerCapture}
                                    className="w-full bg-primary text-black font-black uppercase tracking-widest text-xs h-12 rounded-full"
                                >
                                    Initiate Synthesis
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
            <LeadCapture isOpen={isCaptureOpen} onClose={() => setIsCaptureOpen(false)} tier="Synthesis Access" />
        </main>
    );
}

function Bar({ index }: { index: number }) {
    const [heights, setHeights] = useState(["20%", "20%"]);

    useEffect(() => {
        setHeights([
            `${20 + Math.random() * 80}%`,
            `${20 + Math.random() * 80}%`
        ]);
    }, []);

    return (
        <motion.div
            animate={{ height: heights }}
            transition={{ duration: 1.5 + (index * 0.1) % 1, repeat: Infinity, repeatType: "reverse" }}
            className="flex-1 bg-gradient-to-t from-primary/10 to-primary/60 rounded-t-sm"
        />
    );
}
