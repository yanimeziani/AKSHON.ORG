"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import {
    Terminal,
    Copy,
    Check,
    ChevronRight,
    Info,
    ShieldCheck,
    Download,
    Cpu,
    Network,
    Link as LinkIcon
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function NodeSetupDocs() {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const steps = [
        {
            title: "Environment Preparation",
            description: "Ensure you have Node.js 20+ and Docker installed on your host machine.",
            cmd: "node --version && docker --version"
        },
        {
            title: "Clone AKSHON Core",
            description: "Pull the open-source MCP host repository to your local directory.",
            cmd: "git clone https://github.com/akshon-org/mcp-host.git && cd mcp-host"
        },
        {
            title: "Initialize Secure Environment",
            description: "Configure your unique operator keys and network preferences.",
            cmd: "cp .env.example .env && openssl rand -base64 32 >> .env"
        },
        {
            title: "Launch Node",
            description: "Start the containerized intelligence node and link to the global matrix.",
            cmd: "docker-compose up -d"
        }
    ];

    return (
        <main className="min-h-screen bg-black pt-32 pb-24 relative overflow-hidden">
            <Navbar />

            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-500/20 blur-[150px] rounded-full" />
                <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-16">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-6"
                        >
                            <Terminal className="text-blue-400 w-6 h-6" />
                            <span className="text-blue-400 font-mono text-[10px] uppercase tracking-[0.5em]">System Documentation // v1.0.4</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-black text-white italic uppercase tracking-tighter mb-6"
                        >
                            Sovereign <span className="text-blue-400 italic">Node Setup</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-muted-foreground font-light text-xl italic leading-relaxed"
                        >
                            The AKSHON intelligence matrix is designed to be decentralized.
                            By hosting your own node, you maintain absolute data sovereignty
                            while contributing to the collective knowledge foundation.
                        </motion.p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {[
                            { title: "Privacy First", icon: ShieldCheck, text: "Zero telemetry leaves your hardware unless explicitly authorized.", color: "text-emerald-400" },
                            { title: "Low Latency", icon: Cpu, text: "Edge processing ensures sub-10ms response times for local queries.", color: "text-blue-400" },
                            { title: "Dynamic Sync", icon: Network, text: "Automatic bidirectional synchronization with the global corpus.", color: "text-primary" },
                        ].map((feat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                className="p-6 rounded-2xl glass border-white/5"
                            >
                                <feat.icon className={`w-8 h-8 ${feat.color} mb-4`} />
                                <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-2">{feat.title}</h3>
                                <p className="text-[11px] text-muted-foreground italic leading-relaxed">{feat.text}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="space-y-12 mb-16">
                        {steps.map((step, i) => (
                            <motion.section
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative pl-12 border-l border-white/10"
                            >
                                <div className="absolute left-[-13px] top-0 w-6 h-6 rounded-full bg-black border border-white/20 flex items-center justify-center font-mono text-[10px] text-white/40">
                                    {i + 1}
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-3">{step.title}</h3>
                                <p className="text-muted-foreground text-sm italic mb-6">{step.description}</p>

                                <div className="relative group">
                                    <div className="absolute inset-0 bg-blue-500/5 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative flex items-center justify-between p-6 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-sm group-hover:border-blue-500/30 transition-all">
                                        <div className="flex items-center gap-4 text-white/80 overflow-x-auto whitespace-nowrap scrollbar-hide">
                                            <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                                            {step.cmd}
                                        </div>
                                        <button
                                            onClick={() => handleCopy(step.cmd, i)}
                                            className="ml-4 p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all shrink-0"
                                        >
                                            {copiedIndex === i ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </motion.section>
                        ))}
                    </div>

                    <div className="p-8 rounded-3xl bg-blue-500/5 border border-blue-500/20 flex flex-col md:flex-row items-center gap-8 group">
                        <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Download className="w-10 h-10 text-blue-400" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Download Full Documentation Bundle</h3>
                            <p className="text-xs text-muted-foreground italic mb-0 uppercase tracking-widest font-bold">PDF • 4.2 MB • Includes Advanced Optimization API Guide</p>
                        </div>
                        <Button className="w-full md:w-auto h-14 px-8 bg-blue-500 hover:bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                            Retrieve Assets
                        </Button>
                    </div>

                    <footer className="mt-24 pt-12 border-t border-white/5 text-center">
                        <div className="flex justify-center gap-6 mb-8">
                            <a href="#" className="text-white/40 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest flex items-center gap-2">
                                <LinkIcon className="w-3 h-3 text-primary" /> GitHub Repository
                            </a>
                            <a href="#" className="text-white/40 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest flex items-center gap-2">
                                <LinkIcon className="w-3 h-3 text-primary" /> Technical specs
                            </a>
                        </div>
                        <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em]">
                            AKSHON Protocols are licensed under sovereign open source (SOS) v2.0
                        </p>
                    </footer>
                </div>
            </div>
        </main>
    );
}
