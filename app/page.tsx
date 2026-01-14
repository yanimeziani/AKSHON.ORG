"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LiquidMetalDemo from "@/components/LiquidMetalDemo";
import { motion } from "framer-motion";
import { Database, Cpu, ArrowRight, Zap, Shield, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const GetEdgeJourney = dynamic(() => import("@/components/GetEdgeJourney"), { ssr: false });

import WealthErosion from "@/components/WealthErosion";
import { useState } from "react";

export default function Home() {
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [selectedTier, setSelectedTier] = useState("Alpha");

  const triggerCapture = (tier = "Alpha") => {
    setSelectedTier(tier);
    setIsCaptureOpen(true);
    setHasOpened(true);
  };

  return (
    <main id="main-content" className="min-h-screen bg-background overflow-hidden text-foreground">
      <Navbar />
      <Hero />

      {/* Design System Demo Section - Inserted as requested identity demo */}
      <section className="py-20 relative">
        <LiquidMetalDemo />
      </section>

      {/* Core Pillars Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <header className="mb-20 text-center">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-primary font-mono text-[10px] uppercase tracking-[0.4em] mb-4 block"
            >
              The Intelligence Stack
            </motion.span>
            <h2 className="text-4xl md:text-6xl font-black text-foreground italic uppercase tracking-tighter">
              A Triple-Threat <span className="text-muted-foreground italic">Paradigm</span>
            </h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Verified Corpus",
                icon: Database,
                href: "/corpus",
                desc: "High-integrity research vault hosted on GCP with cryptographic verification.",
                color: "text-primary"
              }
            ].map((pillar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group glass-chroma p-10 rounded-[40px] border border-white/20 hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden shadow-soft-depth hover:shadow-lg"
              >
                <div className={`w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center ${pillar.color} mb-8 group-hover:scale-110 transition-transform`}>
                  <pillar.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tight mb-4">{pillar.title}</h3>
                <p className="text-muted-foreground font-light mb-8 italic leading-relaxed">
                  {pillar.desc}
                </p>
                <Link href={pillar.href} className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] group-hover:gap-4 transition-all">
                  Control Interface <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Sovereign Protocol - Philosophy Section */}
      <section className="py-32 relative overflow-hidden bg-white/50">
        <div className="absolute inset-0 bg-liquid-metal opacity-30 pointer-events-none" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="glass-chroma p-12 md:p-24 rounded-[60px] border border-white/40 relative shadow-soft-depth"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-8 py-2 rounded-full font-black uppercase tracking-[0.3em] text-[10px] shadow-lg">
                The Reality
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-foreground italic uppercase tracking-tighter mb-12 text-center">
                The System is <span className="text-red-500">Rigged</span>. <br />Opt <span className="text-primary italic">Out</span>.
              </h2>

              <div className="mb-16">
                 <WealthErosion />
              </div>

              <div className="space-y-12">
                {[
                  {
                    text: "Banks create money from nothing. Governments borrow forever. You pay the price.",
                    sub: "The 'Rigged Triangle' ensures your savings are stolen via inflation before you can spend them."
                  },
                  {
                    text: "Stop playing a game where the rules are written against you.",
                    sub: "AKSHON gives you the information edge to arbitrate the system, not just survive it."
                  },
                  {
                    text: "True sovereignty means owning assets that cannot be printed away.",
                    sub: "Use our intelligence matrix to identify value before the currency debasement erodes it."
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6 items-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl md:text-2xl font-bold text-foreground italic tracking-tight mb-2 leading-tight">
                        {item.text}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] leading-relaxed">
                        {item.sub}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Agentic Research Section */}
      <section className="py-32 relative overflow-hidden text-center">
        <div className="container mx-auto px-4">
          <header className="mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-foreground italic uppercase tracking-tighter">
              Built for <span className="text-muted-foreground italic">Agents</span>
            </h2>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto italic mt-4">
              Our platform provides the high-fidelity data feeds and synthesis outputs required for autonomous research agents to execute with precision.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Structured Feeds", icon: Activity, desc: "Clean JSON research deltas processed from raw PDF streams." },
              { title: "API First", icon: Cpu, desc: "REST & GraphQL conduits for seamless agent integration." },
              { title: "Verifiable IDs", icon: Shield, desc: "Cryptographic proofs for every insight synthesized." },
              { title: "Global Scale", icon: Zap, desc: "Ingesting research papers at global scale." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass-chroma p-8 rounded-3xl border border-white/30 hover:bg-white/40 transition-colors shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-6 mx-auto">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground uppercase italic mb-2">{feature.title}</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-medium leading-relaxed italic">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-32 bg-primary/[0.02]">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto glass-chroma p-12 md:p-20 rounded-[60px] border border-white/20 relative overflow-hidden shadow-soft-depth"
          >
            <Zap className="absolute top-10 right-10 w-20 h-20 text-primary opacity-5 animate-pulse" />
            <h2 className="text-4xl md:text-6xl font-black text-foreground italic uppercase tracking-tighter mb-8">
              Join the <span className="text-muted-foreground italic">Sovereign</span>
            </h2>
            <p className="text-muted-foreground font-light mb-12 italic text-lg leading-relaxed">
              Stop speculating. Start arbitrating. Secure your access to the world&apos;s most
              powerful intelligence matrix today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button
                onClick={() => triggerCapture("Alpha Access")}
                onMouseEnter={() => {
                   // Prefetch the component code
                   import("@/components/GetEdgeJourney");
                }}
                size="lg"
                className="w-full sm:w-auto h-16 px-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-sm hover:scale-105 transition-transform shadow-lg"
              >
                Acquire Access
              </Button>
              <Link href="/corpus" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 px-12 rounded-2xl border-input text-foreground font-black uppercase tracking-[0.2em] text-sm glass-chroma hover:bg-white/50">
                  Browser Vault
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {hasOpened && (
        <GetEdgeJourney
          isOpen={isCaptureOpen}
          onClose={() => setIsCaptureOpen(false)}
          tier={selectedTier}
        />
      )}


      {/* Footer */}
      <footer className="py-20 border-t border-border bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center font-black text-primary-foreground text-xs">A</div>
            <span className="text-sm font-black text-foreground uppercase italic tracking-widest">Akshon.org</span>
          </div>
          <div className="flex gap-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            <Link href="/docs/node" className="hover:text-primary transition-colors">Documentation</Link>

            <a href="https://discord.gg/QVsmmNK2" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Community</a>
            <Link href="/terms" className="hover:text-primary transition-colors">Sovereign Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground/60">
            EST. 2026 // KINETIC_INTELLIGENCE_LTD
          </div>
        </div>
      </footer>
    </main>
  );
}
