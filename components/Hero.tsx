"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight, Database, Zap, Shield, Globe } from "lucide-react";
import Image from "next/image";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/hero.png"
                    alt="Knowledge Flow"
                    fill
                    className="object-cover opacity-60 scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black z-10" />
            </div>

            <div className="container relative z-20 px-4 mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest text-primary uppercase border border-primary/30 rounded-full glass glow-gold">
                        The Sovereign Arbitrageur
                    </span>
                    <h1 className="mb-8 text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white">
                        AK<span className="text-primary">SHON</span>
                        <span className="block text-2xl md:text-3xl font-light tracking-[0.3em] mt-4 opacity-80">
                            KINETIC INSIGHT
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto mb-10 text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
                        The world&apos;s most advanced hosted research paper aggregator.
                        Real-time synthesis. Sovereign intelligence.
                        Information as a liquid asset.
                    </p>


                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/corpus">
                            <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-full group bg-primary hover:bg-primary/90 text-black">
                                Access the Vault
                                <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                        <Link href="/fleet">
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-full glass hover:bg-white/5">
                                Live Aggregator
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Floating Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-24">
                    {[
                        { icon: Database, label: "Core Corpus", sub: "GCP Hosted" },
                        { icon: Zap, label: "Kinetic Synthesis", sub: "AI Insights" },
                        { icon: Shield, label: "Sovereign Proof", sub: "Encrypted" },
                        { icon: Globe, label: "Global Reach", sub: "Unified Feed" },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                            className="p-6 rounded-2xl glass border-white/5 hover:border-primary/30 transition-colors group text-left"
                        >
                            <item.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-bold text-white mb-1">{item.label}</h3>
                            <p className="text-sm text-muted-foreground">{item.sub}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Background Pulse */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm animate-pulse" />
        </section>
    );
}
