"use client";

import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Cpu, Database, TrendingUp, Shield, Globe, Zap, Server } from "lucide-react";
import { useState, useEffect } from "react";

export default function FleetPage() {
    const [activeNodes, setActiveNodes] = useState(128);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveNodes(prev => prev + (Math.random() > 0.5 ? 1 : -1));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const stats = [
        { label: "Corpus Size", value: "4.2 TB", icon: Database, color: "text-blue-400", change: "+12% today" },
        { label: "Ingestion Velocity", value: "85 pcs/hr", icon: Activity, color: "text-primary", change: "Optimal" },
        { label: "Fleet Instances", value: `${activeNodes} Active`, icon: Cpu, color: "text-emerald-400", change: "Scaling" },
        { label: "Synthesis Alpha", value: "99.2%", icon: TrendingUp, color: "text-purple-400", change: "Peak" },
    ];

    const nodes = [
        { id: "ALPHA-01", location: "GCP-US-EAST", load: "74%", status: "OPTIMAL" },
        { id: "BETA-04", location: "GCP-EU-WEST", load: "22%", status: "STANDBY" },
        { id: "GAMMA-09", location: "GCP-ASIA-SOUTH", load: "98%", status: "HEAVY" },
        { id: "DELTA-12", location: "LOCAL-EDGE", load: "45%", status: "OPTIMAL" },
    ];

    return (
        <main className="min-h-screen bg-black pt-32 pb-24 overflow-hidden relative">
            <Navbar />

            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-4"
                        >
                            <Server className="text-primary w-5 h-5" />
                            <span className="text-primary font-mono text-[10px] uppercase tracking-[0.4em]">Global Infrastructure Fleet</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2"
                        >
                            Strategic <span className="text-primary italic">Command</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-muted-foreground font-light italic"
                        >
                            Orchestrating the AKSHON intelligence matrix across 4 continents.
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 md:mt-0 glass px-8 py-3 rounded-2xl border-primary/20 flex items-center gap-4 group cursor-help"
                    >
                        <div className="relative">
                            <div className="w-3 h-3 rounded-full bg-primary" />
                            <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary animate-ping" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Fleet Integrity</div>
                            <div className="text-primary font-mono text-xs font-bold uppercase">System_Optimal_99.9%</div>
                        </div>
                    </motion.div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 rounded-[32px] glass border-white/5 flex flex-col items-start group hover:border-primary/20 transition-all cursor-pointer overflow-hidden relative"
                        >
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/[0.02] rounded-full group-hover:bg-primary/5 transition-colors" />
                            <stat.icon className={`w-10 h-10 ${stat.color} mb-6`} />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">
                                {stat.label}
                            </span>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-black text-white italic">{stat.value}</span>
                                <span className="text-[9px] font-bold text-primary uppercase tracking-widest mb-2 whitespace-nowrap">{stat.change}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Monitor */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Node Monitor */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 p-10 rounded-[40px] glass border-white/5 relative overflow-hidden h-[500px]"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
                                <Globe className="text-primary w-6 h-6" />
                                Node Distribution
                            </h3>
                            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Live_Feed_v4.2</div>
                        </div>

                        <div className="space-y-4">
                            {nodes.map((node, i) => (
                                <div key={node.id} className="group flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 hover:bg-white/[0.05] transition-all cursor-crosshair">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-2.5 h-2.5 rounded-full ${node.status === 'OPTIMAL' ? 'bg-emerald-500' : node.status === 'STANDBY' ? 'bg-blue-500' : 'bg-orange-500'} animate-pulse`} />
                                        <div>
                                            <div className="text-sm font-black text-white italic tracking-widest uppercase">{node.id}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{node.location}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10">
                                        <div className="hidden md:block">
                                            <div className="text-[9px] text-white/40 uppercase tracking-widest font-black mb-1">Load Factor</div>
                                            <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: node.load }}
                                                    className={`h-full ${node.status === 'HEAVY' ? 'bg-orange-500' : 'bg-primary'}`}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-black text-white font-mono">{node.load}</div>
                                            <div className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">{node.status}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Operational Summary */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-10 rounded-[40px] glass border-white/5 h-[230px] flex flex-col justify-center overflow-hidden relative"
                        >
                            <Zap className="absolute top-8 right-8 w-12 h-12 text-primary opacity-5" />
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4">Ingestion Delta</h3>
                            <div className="text-4xl font-black text-primary italic mb-2">+12.4%</div>
                            <p className="text-xs text-muted-foreground italic leading-relaxed">
                                Intelligence flow is trending above Q1 projections. Data liquidity optimal.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-10 rounded-[40px] glass border-white/5 h-[230px] flex flex-col justify-center items-center text-center group transition-all hover:bg-primary/[0.02]"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="w-8 h-8 text-primary opacity-50" />
                            </div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Protocol L1</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                                All instances encrypted & verified.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}

