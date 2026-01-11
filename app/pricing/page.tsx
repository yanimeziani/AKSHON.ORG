"use client";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Crown, HelpCircle, Wallet } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GetEdgeJourney from "@/components/GetEdgeJourney";
import CryptoPayment from "@/components/CryptoPayment";

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("annually");
    const [isCaptureOpen, setIsCaptureOpen] = useState(false);
    const [isCryptoOpen, setIsCryptoOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState("Standard");
    const [selectedPrice, setSelectedPrice] = useState("");

    const handleAcquire = (tier: string) => {
        setSelectedTier(tier);
        setIsCaptureOpen(true);
    };

    const handleCrypto = (tier: string, price: string) => {
        setSelectedTier(tier);
        setSelectedPrice(price);
        setIsCryptoOpen(true);
    };

    const tiers = [
        {
            name: "Researcher",
            price: billingCycle === "annually" ? "$2,400" : "$299",
            period: billingCycle === "annually" ? "/yr" : "/mo",
            desc: "Base access to the verified corpus for independent analysts.",
            features: [
                "Full Vault Access (Read)",
                "Standard Ingestion Rate",
                "Community Discord Access",
                "Basic Synthesis Reports",
                "Weekly PDF Exports"
            ],
            icon: Shield,
            cta: "Acquire Access",
            popular: false,
        },
        {
            name: "Arbitrageur",
            price: billingCycle === "annually" ? "$8,000" : "$999",
            period: billingCycle === "annually" ? "/yr" : "/mo",
            desc: "The professional's choice for identifying market-moving insights.",
            features: [
                "Real-time Kinetic Feed",
                "Synthesis AI Integration",
                "GCP Direct Download",
                "Priority Ingestion (24h)",
                "Full API Suite Access",
                "Custom Alert Configuration"
            ],
            icon: Zap,
            popular: true,
            cta: "Secure Edge",
        },
        {
            name: "Sovereign",
            price: "Custom",
            period: "",
            desc: "Institutional level control. Unrestricted intelligence swarms.",
            features: [
                "Dedicated GCP Bucket",
                "Proprietary Synthesis Models",
                "Fleet Manager Integration",
                "Direct API Conduit (L1)",
                "On-prem Deployment Options",
                "White-glove Concierge"
            ],
            icon: Crown,
            popular: false,
            cta: "Contact Command",
        },
    ];

    const faqs = [
        {
            q: "What is the 'Corpus' specifically?",
            a: "A meticulously curated vault of frontier research papers, source code, and data across AI, Biotech, and Physics, hosted on high-availability GCP storage."
        },
        {
            q: "How does 'Synthesis' provide an edge?",
            a: "Our proprietary AI models identify structural convergences between unrelated papers, flagging opportunities for 'knowledge arbitrage' before they hit the mainstream."
        },
        {
            q: "Can I cancel my subscription?",
            a: "Intelligence access can be paused or terminated at any billing cycle. No lock-ins, only sovereign control over your subscriptions."
        },
        {
            q: "Do you offer enterprise-wide licenses?",
            a: "Yes. Our 'Sovereign' tier is specifically designed for institutional fleets and high-frequency research desks. Contact us for custom integration."
        }
    ];

    return (
        <main className="min-h-screen bg-black pt-32 pb-24 overflow-hidden">
            <Navbar />

            {/* Ambient Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <header className="mb-16 text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-primary font-mono text-xs uppercase tracking-[0.4em] mb-4 block"
                    >
                        Monetize Intelligence
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl md:text-8xl font-black text-white italic uppercase tracking-tighter mb-6"
                    >
                        Buy the <span className="text-primary italic">Edge</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground font-light max-w-2xl mx-auto italic text-lg"
                    >
                        "Information is the only true arbitrage." — The Sovereign Philosophy.
                        Secure your access to frontier research before the market adjusts.
                    </motion.p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center mt-12 gap-4">
                        <span className={`text-xs font-bold uppercase tracking-widest ${billingCycle === "monthly" ? "text-white" : "text-muted-foreground"}`}>Monthly</span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === "monthly" ? "annually" : "monthly")}
                            className="w-16 h-8 rounded-full bg-white/5 border border-white/10 relative p-1 transition-colors hover:border-primary/50"
                        >
                            <motion.div
                                animate={{ x: billingCycle === "monthly" ? 0 : 32 }}
                                className="w-6 h-6 rounded-full bg-primary shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                            />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold uppercase tracking-widest ${billingCycle === "annually" ? "text-white" : "text-muted-foreground"}`}>Annually</span>
                            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Save 20%</span>
                        </div>
                    </div>
                </header>

                {/* Tiers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-24">
                    {tiers.map((tier, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative p-8 md:p-10 rounded-[40px] glass border-white/5 flex flex-col transform transition-all hover:translate-y-[-8px] ${tier.popular ? "border-primary/30 shadow-[0_0_80px_rgba(212,175,55,0.05)] bg-primary/[0.02]" : ""
                                }`}
                        >
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                                    Strategic Choice
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-8">
                                <tier.icon className={`w-12 h-12 ${tier.popular ? "text-primary" : "text-white/20"}`} />
                                {tier.popular && <Zap className="w-5 h-5 text-primary animate-pulse" />}
                            </div>

                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">{tier.name}</h3>
                            <p className="text-sm text-muted-foreground mb-8 min-h-[48px] italic leading-relaxed">
                                {tier.desc}
                            </p>

                            <div className="flex items-baseline gap-1 mb-10">
                                <span className="text-5xl font-black text-white tracking-tighter">{tier.price}</span>
                                <span className="text-muted-foreground font-bold text-sm uppercase tracking-widest ml-2">{tier.period}</span>
                            </div>

                            <ul className="w-full text-left space-y-5 mb-12 flex-grow">
                                {tier.features.map((feat, j) => (
                                    <li key={j} className="flex items-start gap-3 text-[11px] text-white/70 font-bold uppercase tracking-widest leading-none">
                                        <Check className="w-4 h-4 text-primary shrink-0" />
                                        {feat === "Community Discord Access" ? (
                                            <a href="https://discord.gg/QVsmmNK2" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors decoration-primary/30 underline underline-offset-4 decoration-dotted">
                                                {feat}
                                            </a>
                                        ) : (
                                            <span>{feat}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex flex-col gap-3 mt-auto">
                                <Button
                                    onClick={() => handleAcquire(tier.name)}
                                    className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${tier.popular
                                        ? "bg-white text-black hover:bg-white/90"
                                        : "bg-white/5 text-white hover:bg-white/10 border border-white/5"
                                        }`}
                                >
                                    {tier.cta}
                                </Button>
                                {tier.price !== "Custom" && (
                                    <Button
                                        onClick={() => handleCrypto(tier.name, tier.price)}
                                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Wallet className="w-4 h-4" />
                                        Settle with Crypto
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ Section */}
                <section className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <HelpCircle className="w-10 h-10 text-primary opacity-20 mx-auto mb-4" />
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Frequently <span className="text-primary italic">Interrogated</span></h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="glass p-6 rounded-3xl border-white/5"
                            >
                                <h4 className="text-white font-bold uppercase italic tracking-tight mb-3 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    {faq.q}
                                </h4>
                                <p className="text-sm text-muted-foreground font-light italic leading-relaxed">
                                    {faq.a}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>

            <GetEdgeJourney
                isOpen={isCaptureOpen}
                onClose={() => setIsCaptureOpen(false)}
                tier={selectedTier}
            />

            <CryptoPayment
                isOpen={isCryptoOpen}
                onClose={() => setIsCryptoOpen(false)}
                tier={selectedTier}
                price={selectedPrice}
            />
        </main>
    );
}
