"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { motion } from "framer-motion";
import { Brain, Database, Cpu, ArrowRight, Zap, Shield, Crown, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import LeadCapture from "@/components/LeadCapture";
import { useState } from "react";

export default function Home() {
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState("Alpha");

  const triggerCapture = (tier = "Alpha") => {
    setSelectedTier(tier);
    setIsCaptureOpen(true);
  };

  return (
    <main className="min-h-screen bg-black overflow-hidden">
      <Navbar />
      <Hero />

      {/* Core Pillars Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <header className="mb-20 text-center">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-primary font-mono text-[10px] uppercase tracking-[0.4em] mb-4 block"
            >
              The Intelligence Stack
            </motion.span>
            <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter">
              A Triple-Threat <span className="text-primary italic">Paradigm</span>
            </h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Verified Corpus",
                icon: Database,
                href: "/corpus",
                desc: "High-integrity research vault hosted on GCP with cryptographic verification.",
                color: "text-blue-400"
              },
              {
                title: "AI Synthesis",
                icon: Brain,
                href: "/synthesis",
                desc: "Proprietary models finding structural alpha across disparate research domains.",
                color: "text-primary"
              },
              {
                title: "Strategic Fleet",
                icon: Cpu,
                href: "/fleet",
                desc: "Global command center for infrastructure, ingestion, and real-time scaling.",
                color: "text-emerald-400"
              }
            ].map((pillar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group glass p-10 rounded-[40px] border-white/5 hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center ${pillar.color} mb-8 group-hover:scale-110 transition-transform`}>
                  <pillar.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tight mb-4">{pillar.title}</h3>
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
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="glass p-12 md:p-24 rounded-[60px] border-primary/20 relative"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-black px-8 py-2 rounded-full font-black uppercase tracking-[0.3em] text-[10px] shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                The Mission
              </div>

              <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-16 text-center">
                Stop <span className="text-primary">Speculating</span>. <br />Start <span className="text-primary italic">Executing</span>.
              </h2>

              <div className="space-y-12">
                {[
                  {
                    text: "Never spend weeks building ideas without knowing if anyone will pay.",
                    sub: "AKSHON identifies the demand-signal before you write a single line of code."
                  },
                  {
                    text: "Never overthink features, tech, and tools instead of shipping something small.",
                    sub: "Our synthesis engine strips back the noise, focusing only on the kinetic core."
                  },
                  {
                    text: "Never watch other micro-SaaS founders win and wonder what you’re missing.",
                    sub: "Own the information edge. Be the one they wonder about."
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6 items-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 mt-1">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl md:text-2xl font-bold text-white italic tracking-tight mb-2 leading-tight">
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
            <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter">
              Built for <span className="text-primary italic">Agents</span>
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
              { title: "Global Scale", icon: Zap, desc: "Ingesting 100k+ research papers per minute via Fleet." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-8 rounded-3xl border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 mx-auto">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white uppercase italic mb-2">{feature.title}</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-medium leading-relaxed italic">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Feed Section */}
      <section className="py-32 bg-white/[0.02] border-y border-white/5 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_15%)] opacity-[0.03] pointer-events-none" />
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4"
              >
                Kinetic <span className="text-primary italic">Live Feed</span>
              </motion.h2>
              <p className="text-muted-foreground font-light italic text-lg">
                Real-time ingestion from 500+ global research sources.
              </p>
            </div>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-primary font-mono text-[10px] font-bold uppercase tracking-[0.3em] bg-primary/10 px-6 py-2 rounded-full border border-primary/20"
            >
              ● POLLING_GCP_BACKEND_VAULT_01
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Non-Euclidean Latent Spaces", category: "AI/MATH", time: "2m ago" },
              { title: "Synthetic Proteomics v4", category: "BIO/SYNTH", time: "12m ago" },
              { title: "Quantum Error Arbitrage", category: "PHYS/CRYPTO", time: "45m ago" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl glass border-white/5 hover:border-primary/10 transition-colors flex flex-col justify-between h-48"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-mono text-primary uppercase tracking-widest">{item.category}</span>
                    <span className="text-[10px] text-white/20 uppercase font-black">{item.time}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white italic uppercase tracking-tight leading-tight">
                    {item.title}
                  </h3>
                </div>
                <div className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-black italic">
                  Validated Entry_ID_{8823 + i}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-32 bg-black">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto glass p-12 md:p-20 rounded-[60px] border-white/5 relative overflow-hidden"
          >
            <Zap className="absolute top-10 right-10 w-20 h-20 text-primary opacity-5 animate-pulse" />
            <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-8">
              Join the <span className="text-primary italic">Sovereign</span>
            </h2>
            <p className="text-muted-foreground font-light mb-12 italic text-lg leading-relaxed">
              Stop speculating. Start arbitrating. Secure your access to the world&apos;s most
              powerful intelligence matrix today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button
                onClick={() => triggerCapture("Alpha Access")}
                size="lg"
                className="w-full sm:w-auto h-16 px-12 rounded-2xl bg-primary text-black font-black uppercase tracking-[0.2em] text-sm hover:scale-105 transition-transform shadow-[0_0_50px_rgba(212,175,55,0.2)]"
              >
                Acquire Access
              </Button>
              <Link href="/corpus" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 px-12 rounded-2xl border-white/10 text-white font-black uppercase tracking-[0.2em] text-sm glass hover:bg-white/5">
                  Browser Vault
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <LeadCapture
        isOpen={isCaptureOpen}
        onClose={() => setIsCaptureOpen(false)}
        tier={selectedTier}
      />


      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center font-black text-black text-xs">A</div>
            <span className="text-sm font-black text-white uppercase italic tracking-widest">Akshon.org</span>
          </div>
          <div className="flex gap-8 text-[10px] font-black text-white/40 uppercase tracking-widest">
            <Link href="/corpus" className="hover:text-primary transition-colors">Documentation</Link>
            <Link href="/fleet" className="hover:text-primary transition-colors">API Conduit</Link>
            <a href="https://discord.gg/QVsmmNK2" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Community</a>
            <Link href="/terms" className="hover:text-primary transition-colors">Sovereign Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
          <div className="text-[10px] font-mono text-white/20">
            EST. 2026 // KINETIC_INTELLIGENCE_LTD
          </div>
        </div>
      </footer>
    </main>
  );
}

