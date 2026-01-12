"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Zap, Trees, Sun, Tv } from "lucide-react";
import Link from "next/link";

const DEMOS = [
    {
        title: "Sungrid OS",
        desc: "Parallel Control Interface for Kyber Stream ingestion. Hand-tracking depth control + Voice reactivity.",
        icon: Zap,
        href: "/demos/sungrid/index.html",
        color: "from-amber-500 to-orange-600"
    },
    {
        title: "Amazonia Node",
        desc: "Bio-system monitoring with Tech-Tree architecture. Voice-controlled atmospheric density.",
        icon: Trees,
        href: "/demos/amazon/index.html",
        color: "from-emerald-500 to-teal-600"
    },
    {
        title: "Sahara Matrix",
        desc: "Energy yield optimization. Heat-haze visualization reactive to vocal frequency and hand gestures.",
        icon: Sun,
        href: "/demos/sahara/index.html",
        color: "from-orange-400 to-red-600"
    }
];

export default function DemosPage() {
    return (
        <main className="min-h-screen bg-black overflow-hidden">
            <Navbar />

            <section className="py-32 relative">
                <div className="container mx-auto px-4">
                    <header className="mb-20 text-center">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-primary font-mono text-[10px] uppercase tracking-[0.4em] mb-4 block"
                        >
                            Interactive Artifacts
                        </motion.span>
                        <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter">
                            The <span className="text-primary italic">Live</span> Interfaces
                        </h2>
                        <p className="text-muted-foreground font-light max-w-2xl mx-auto italic mt-4">
                            Experimental multimodal demos demonstrating the AKSHON protocol in diverse environmental contexts.
                            Requires Webcam & Microphone for full interaction.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {DEMOS.map((demo, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${demo.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity rounded-[40px]`} />

                                <Link href={demo.href} target="_blank">
                                    <div className="glass p-10 rounded-[40px] border-white/5 hover:border-primary/20 transition-all cursor-pointer h-full flex flex-col">
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                                            <demo.icon className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tight mb-4">{demo.title}</h3>
                                        <p className="text-muted-foreground font-light mb-8 italic leading-relaxed flex-grow">
                                            {demo.desc}
                                        </p>
                                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] group-hover:gap-4 transition-all">
                                            Initialize Uplink <Tv className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technical Specs Footer */}
            <section className="py-20 border-t border-white/5">
                <div className="container mx-auto px-4 text-center">
                    <div className="bg-white/5 inline-flex items-center gap-6 px-8 py-4 rounded-full border border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-mono text-white/40 uppercase">Low-Latency Mediapipe (WASM)</span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-mono text-white/40 uppercase">Web Audio API Vectorized</span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            <span className="text-[10px] font-mono text-white/40 uppercase">Multi-modal Smooth Lerp</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
