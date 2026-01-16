"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import {
    Cpu,
    Database,
    CreditCard,
    BookOpen,
    Terminal,
    Users,
    Share2,
    Settings,
    Shield,
    Wallet,
    Plus,
    CheckCircle2,
    Layers,
    Key
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import dynamic from "next/dynamic";
import { auth } from "@/lib/firebase";

const CryptoPayment = dynamic(() => import("@/components/CryptoPayment"), {
    ssr: false,
});
import { onAuthStateChanged, User } from "firebase/auth";
import { useSearchParams } from "next/navigation";

function DashboardContent() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [hasOpenedPayment, setHasOpenedPayment] = useState(false);
    const [selectedTier, setSelectedTier] = useState({ name: "Pro", price: "$49" });
    const searchParams = useSearchParams();
    const isSuccess = searchParams.get('success');

    const [feed, setFeed] = useState<any[]>([]);
    const [insights, setInsights] = useState<any[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        // Fetch feed and insights
        fetch('/api/feed').then(res => res.json()).then(data => setFeed(data.feed)).catch(console.error);
        fetch('/api/synthesis').then(res => res.json()).then(data => setInsights(data.insights)).catch(console.error);

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (isSuccess) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center p-4">
                <Navbar />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-chroma p-12 rounded-[40px] border-primary/20 text-center max-w-2xl w-full relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-primary/10 blur-[100px]" />
                    <div className="relative z-10">
                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8 border border-primary/30 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
                            <CheckCircle2 className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
                            Signal <span className="text-primary">Acquired</span>
                        </h1>
                        <p className="text-muted-foreground font-light mb-8 italic text-lg leading-relaxed">
                            Your allocation has been secured. Our systems are currently provisioning your dedicated MCP node.
                            <br /><br />
                            <span className="text-white font-bold">Please check your email</span> for your access credentials and AKSHON.md configuration.
                        </p>
                        <Link href="/">
                            <Button className="h-14 px-8 bg-primary text-black font-black uppercase tracking-[0.2em] text-xs rounded-xl hover:scale-105 transition-transform">
                                Return to Base
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center p-4">
                <Navbar />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-chroma p-12 rounded-[40px] border-primary/20 text-center max-w-md w-full"
                >
                    <Shield className="w-16 h-16 text-primary mx-auto mb-8 animate-pulse" />
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Access Denied</h1>
                    <p className="text-muted-foreground font-light mb-8 italic">
                        Please authenticate to access your Sovereign Terminal.
                    </p>
                    <Link href="/login">
                        <Button className="w-full h-14 bg-primary text-black font-black uppercase tracking-[0.2em] text-xs rounded-xl hover:scale-105 transition-transform">
                            Log In
                        </Button>
                    </Link>
                </motion.div>
            </main>
        );
    }

    const openPayment = (tier: string, price: string) => {
        setSelectedTier({ name: tier, price });
        if (!hasOpenedPayment) setHasOpenedPayment(true);
        setIsPaymentOpen(true);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <main className="min-h-screen bg-black pt-32 pb-24 relative overflow-hidden">
            <Navbar />

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 mb-4"
                    >
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Sovereign Terminal</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4"
                    >
                        Welcome, <span className="text-primary italic">{user?.displayName?.split(' ')[0] || "Operator"}</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground font-light max-w-2xl italic"
                    >
                        Manage your intelligence matrix, settlements, and MCP fleet from a single interface.
                    </motion.p>
                </header>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    {/* Settlement & Billing */}
                    <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
                        <Card className="glass-chroma border-primary/20 bg-primary/5">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <Wallet className="w-8 h-8 text-primary" />
                                    <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-black text-primary uppercase tracking-widest">
                                        Active Tier
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-black text-white uppercase italic tracking-tighter">
                                    Strategic Settlement
                                </CardTitle>
                                <CardDescription className="text-muted-foreground italic">
                                    Manage your platform credits and crypto payments.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Current Balance</div>
                                    <div className="flex items-end gap-2">
                                        <div className="text-3xl font-black text-white italic">0.00 <span className="text-primary">α</span></div>
                                        <div className="text-[10px] text-muted-foreground uppercase mb-1.5 font-bold">AKSHON Credits</div>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => openPayment("Pro Fleet Access", "0.5 ETH")}
                                    className="w-full h-14 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(212,175,55,0.1)] hover:shadow-[0_0_50px_rgba(212,175,55,0.2)]"
                                >
                                    Refill with Crypto
                                </Button>
                                <div className="text-[10px] text-center text-white/20 font-black uppercase tracking-widest">
                                    Instant Settlement via Base, Arbitrum, or Mainnet
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass-chroma border-white/5">
                            <CardHeader>
                                <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-400" />
                                    Transparency log
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { date: "2024-01-10", action: "Access_Granted", status: "Success" },
                                    { date: "2024-01-08", action: "Node_Sync", status: "Verified" },
                                ].map((log, i) => (
                                    <div key={i} className="flex justify-between items-center text-[10px] font-mono">
                                        <span className="text-white/40 italic">{log.date}</span>
                                        <span className="text-white uppercase font-bold">{log.action}</span>
                                        <span className="text-emerald-500 font-bold">{log.status}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* MCP & Infrastructure */}
                    <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Synthesis Engine (Live) */}
                            <Card className="glass-chroma border-white/5 hover:border-primary/20 transition-all group overflow-hidden">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                                            <Cpu className="text-primary w-6 h-6" />
                                        </div>
                                        <span className="animate-pulse flex h-2 w-2 rounded-full bg-primary" />
                                    </div>
                                    <CardTitle className="text-2xl font-black text-white uppercase italic tracking-tighter">
                                        Synthesis <span className="text-primary">Engine</span>
                                    </CardTitle>
                                    <CardDescription className="italic">
                                        Live intelligence stream from the swarm.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {insights.length > 0 ? (
                                        <div className="space-y-3">
                                            {insights.slice(0, 2).map((insight, i) => (
                                                <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-primary/30 transition-all cursor-pointer">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="text-xs font-bold text-white uppercase tracking-tight line-clamp-1">{insight.title}</h4>
                                                        <span className="text-[9px] text-primary font-mono">{insight.confidence}</span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                                                        {insight.summary}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-32 text-center">
                                            <div className="w-6 h-6 border-2 border-white/20 border-t-primary rounded-full animate-spin mb-2" />
                                            <span className="text-[10px] text-white/40 uppercase tracking-widest">Synthesizing...</span>
                                        </div>
                                    )}
                                    <div className="pt-2">
                                        <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-primary font-bold uppercase tracking-widest text-xs h-10 rounded-xl">
                                            View Full Report
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* API Keys Card */}
                            <Card className="glass border-white/5 hover:border-primary/20 transition-all group overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Key className="w-24 h-24" />
                                </div>
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                                        <Key className="text-primary w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-2xl font-black text-white uppercase italic tracking-tighter">
                                        API Keys
                                    </CardTitle>
                                    <CardDescription className="italic">
                                        Connect any IDE, terminal, or AI agent.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Works with VS Code, Cursor, CLI
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Full REST API Access
                                    </div>
                                    <div className="pt-4">
                                        <Link href="/keys">
                                            <Button className="w-full bg-primary text-black font-bold uppercase tracking-widest text-xs h-12 rounded-xl hover:scale-[1.02] transition-transform">
                                                Manage API Keys
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Self-Hosted Node */}
                            <Card className="glass-chroma border-white/5 hover:border-blue-500/20 transition-all group overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Terminal className="w-24 h-24" />
                                </div>
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-blue-500/10 transition-colors">
                                        <Terminal className="text-blue-400 w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-2xl font-black text-white uppercase italic tracking-tighter">
                                        Self-Host Node
                                    </CardTitle>
                                    <CardDescription className="italic">
                                        Full sovereignty. Run AKSHON locally.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                                        Maintain absolute control over your intelligence matrix. Open-source and privacy-first.
                                    </p>
                                    <div className="pt-4">
                                        <Link href="/docs/node">
                                            <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white font-bold uppercase tracking-widest text-xs h-12 rounded-xl flex items-center gap-2 group">
                                                <BookOpen className="w-4 h-4 text-blue-400" />
                                                View Setup Guide
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Corpus Contribution */}
                        <Card className="glass-chroma border-white/5 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-black text-white uppercase italic tracking-tighter mb-1">
                                        Corpus <span className="text-primary italic">Expansion</span>
                                    </CardTitle>
                                    <CardDescription className="italic">
                                        Contribute findings or build your own private research library.
                                    </CardDescription>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                                    <Database className="w-7 h-7 text-primary opacity-50" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                    {[
                                        { title: "Personal Corpus", value: "0 Files", icon: Database },
                                        { title: "Contributions", value: "0 Pub", icon: Share2 },
                                        { title: "Foundation Rank", value: "Acolyte", icon: Users },
                                    ].map((stat, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                                            <stat.icon className="w-5 h-5 text-primary/60" />
                                            <div>
                                                <div className="text-[10px] text-white/40 uppercase font-black tracking-widest leading-none mb-1">{stat.title}</div>
                                                <div className="text-sm font-black text-white italic uppercase">{stat.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-widest text-xs h-14 rounded-2xl border border-white/10 flex items-center gap-2">
                                        <Plus className="w-4 h-4 text-primary" />
                                        Initialize Private Corpus
                                    </Button>
                                    <Button className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs h-14 rounded-2xl border border-white/10 flex items-center gap-2">
                                        <Share2 className="w-4 h-4 text-primary" />
                                        Contribute to Foundation
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dataset Aggregator */}
                        <Card className="glass-chroma border-white/5 hover:border-primary/20 transition-all group">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-black text-white uppercase italic tracking-tighter mb-1">
                                        Dataset <span className="text-primary italic">Aggregator</span>
                                    </CardTitle>
                                    <CardDescription className="italic">
                                        Access and stream curated training packs via MCP.
                                    </CardDescription>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <Layers className="w-7 h-7 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col md:flex-row gap-6 items-center">
                                    <div className="flex-1 w-full">
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3 font-bold">Featured Packs</div>
                                        <div className="flex flex-wrap gap-2">
                                            {["Finance Q1", "Code Instruct", "Bio-Synth"].map(tag => (
                                                <span key={tag} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/70 uppercase">
                                                    {tag}
                                                </span>
                                            ))}
                                            <span className="px-3 py-1.5 text-[10px] text-primary/60 font-medium italic">+12 More</span>
                                        </div>
                                    </div>
                                    <Link href="/datasets" className="w-full md:w-auto">
                                        <Button className="w-full md:w-auto h-12 px-8 bg-white/5 hover:bg-white/10 text-primary font-bold uppercase tracking-widest text-xs border border-primary/20 hover:border-primary/50 rounded-xl transition-all hover:scale-105">
                                            Browse Packs
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>

            {hasOpenedPayment && (
                <CryptoPayment
                    isOpen={isPaymentOpen}
                    onClose={() => setIsPaymentOpen(false)}
                    tier={selectedTier.name}
                    price={selectedTier.price}
                />
            )}
        </main>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <DashboardContent />
        </Suspense>
    );
}
