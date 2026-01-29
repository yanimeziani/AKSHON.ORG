"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, ArrowRight, ShieldCheck, Mail, Terminal, FileText, Check, Copy, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface GetEdgeJourneyProps {
    isOpen: boolean;
    onClose: () => void;
    tier?: string;
}

const MCP_CONFIG = `{
  "mcpServers": {
    "akshon-aggregator": {
      "command": "npx",
      "args": [
        "-y",
        "@akshon/mcp-aggregator"
      ],
      "env": {
        "AKSHON_API_KEY": "your-api-key"
      }
    }
  }
}`;

const AKSHON_MD = `# Akshon MCP Environment

This project is equipped with the Akshon Model Context Protocol (MCP) server.

## Capabilities

The Akshon MCP server provides access to curated datasets and tools directly within your agent's context.

## Usage

You can access datasets using the \`mcp://\` URI scheme.

### Available Datasets

- Global Finance Q1 2024: \`mcp://akshon.org/d/finance-q1-24\`
- Sovereign Code Instruct v3: \`mcp://akshon.org/d/code-instruct-v3\`
- Bio-Synthetic Alpha: \`mcp://akshon.org/d/bio-synth-a\`

### Instructions for Agents

When a user asks for data related to the above topics, use the appropriate \`read_resource\` tool with the corresponding \`mcp://\` URI.
`;

export default function GetEdgeJourney({ isOpen, onClose, tier = "Standard" }: GetEdgeJourneyProps) {
    const [step, setStep] = useState<"email" | "mcp" | "akshon" | "done">("email");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [copiedConfig, setCopiedConfig] = useState(false);
    const [copiedMd, setCopiedMd] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");

        const captureLead = async () => {
            try {
                await addDoc(collection(db, "leads"), {
                    email,
                    tier,
                    timestamp: serverTimestamp(),
                    source: window.location.pathname,
                });
            } catch (error) {
                console.error("Error capturing lead (continuing anyway):", error);
            }
        };

        // Enforce a max wait time of 2s for the lead capture
        // If it hangs (e.g. connectivity issues), we proceed anyway
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000));
        await Promise.race([captureLead(), timeoutPromise]);

        setStatus("success");
        setTimeout(() => {
            setStatus("idle");
            setStep("mcp");
        }, 1500);
    };

    const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setStep("email");
        setEmail("");
        setStatus("idle");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        aria-hidden="true"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl glass-chroma border-primary/20 p-8 md:p-12 rounded-[40px] overflow-hidden"
                    >
                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-6 z-50 text-white/70 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

                        <div className="relative z-10">
                            <AnimatePresence mode="wait">
                                {step === "email" && (
                                    <motion.div
                                        key="step-email"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20">
                                            <Zap className="w-6 h-6 text-primary" />
                                        </div>

                                        <h2 id="modal-title" className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
                                            Acquire <span className="text-primary">Access</span>
                                        </h2>
                                        <p id="modal-description" className="text-muted-foreground font-light mb-8 italic text-sm">
                                            You are requesting entry to the <span className="text-white font-bold">{tier}</span> tier.
                                            Leave your primary communication channel to receive authentication credentials.
                                        </p>

                                        {status === "success" ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-6 rounded-2xl bg-primary/10 border border-primary/20 text-center"
                                                role="status"
                                                aria-live="polite"
                                            >
                                                <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                                                <h3 className="text-xl font-black text-white italic uppercase mb-2">Signal Received</h3>
                                                <p className="text-xs text-primary font-bold uppercase tracking-widest">
                                                    Initiating Setup Sequence...
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                                <div className="relative">
                                                    <label htmlFor="email-input" className="sr-only">
                                                        Email Address
                                                    </label>
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" aria-hidden="true" />
                                                    <Input
                                                        id="email-input"
                                                        type="email"
                                                        placeholder="COMM_CHANNEL@DOMAIN.COM"
                                                        required
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="h-14 bg-white/5 border-white/10 rounded-xl pl-12 text-sm text-white placeholder:text-white/40 focus:border-primary/50 transition-colors uppercase font-bold tracking-widest"
                                                        aria-describedby="email-description"
                                                    />
                                                </div>
                                                <Button
                                                    type="submit"
                                                    disabled={status === "loading"}
                                                    className="w-full h-14 rounded-xl bg-primary text-black font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                                                    aria-label={status === "loading" ? "Submitting email" : "Submit email to request access"}
                                                >
                                                    {status === "loading" ? "TRANSMITTING..." : (tier === "Researcher" || tier === "Arbitrageur" ? "Proceed to Payment" : "Initiate Protocol")}
                                                    <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
                                                </Button>
                                                <p id="email-description" className="text-[10px] text-white/60 text-center uppercase tracking-widest font-black">
                                                    SECURE L1 ENCRYPTION ENABLED // NO SPAM POLICY
                                                </p>
                                            </form>
                                        )}
                                    </motion.div>
                                )}

                                {step === "mcp" && (
                                    <motion.div
                                        key="step-mcp"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                                            <Terminal className="w-6 h-6 text-primary" />
                                        </div>

                                        <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
                                            Step 1: <span className="text-primary">MCP Configuration</span>
                                        </h2>
                                        <p className="text-muted-foreground font-light mb-6 italic text-sm">
                                            Add this configuration to your local MCP settings (e.g., <code className="bg-white/10 px-1 py-0.5 rounded text-xs text-white">mcp_config.json</code>).
                                            This connects your agents to the Akshon network.
                                        </p>

                                        <div className="relative mb-6">
                                            <div className="absolute top-2 right-2 z-10">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => copyToClipboard(MCP_CONFIG, setCopiedConfig)}
                                                    className="h-10 min-w-[88px] text-xs text-white/70 hover:text-white hover:bg-white/10"
                                                    aria-label={copiedConfig ? "Configuration copied to clipboard" : "Copy MCP configuration to clipboard"}
                                                >
                                                    {copiedConfig ? <Check className="w-3 h-3 mr-1 text-emerald-500" aria-hidden="true" /> : <Copy className="w-3 h-3 mr-1" aria-hidden="true" />}
                                                    {copiedConfig ? "Copied" : "Copy JSON"}
                                                </Button>
                                            </div>
                                            <pre className="p-4 rounded-xl bg-black/60 border border-white/5 overflow-x-auto h-48 custom-scrollbar" role="region" aria-label="MCP configuration code">
                                                <code className="text-xs font-mono text-emerald-400">
                                                    {MCP_CONFIG}
                                                </code>
                                            </pre>
                                        </div>

                                        <Button
                                            onClick={() => setStep("akshon")}
                                            className="w-full h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-[0.2em] text-xs transition-all border border-white/10"
                                        >
                                            Next: Agent Instructions
                                            <ChevronRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </motion.div>
                                )}

                                {step === "akshon" && (
                                    <motion.div
                                        key="step-akshon"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                                            <FileText className="w-6 h-6 text-primary" />
                                        </div>

                                        <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
                                            Step 2: <span className="text-primary">AKSHON.md</span>
                                        </h2>
                                        <p className="text-muted-foreground font-light mb-6 italic text-sm">
                                            Create a file named <code className="bg-white/10 px-1 py-0.5 rounded text-xs text-white">AKSHON.md</code> in your project root.
                                            This teaches your agents how to utilize the Akshon resources.
                                        </p>

                                        <div className="relative mb-6">
                                            <div className="absolute top-2 right-2 z-10">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => copyToClipboard(AKSHON_MD, setCopiedMd)}
                                                    className="h-10 min-w-[120px] text-xs text-white/70 hover:text-white hover:bg-white/10"
                                                    aria-label={copiedMd ? "Markdown copied to clipboard" : "Copy AKSHON markdown to clipboard"}
                                                >
                                                    {copiedMd ? <Check className="w-3 h-3 mr-1 text-emerald-500" aria-hidden="true" /> : <Copy className="w-3 h-3 mr-1" aria-hidden="true" />}
                                                    {copiedMd ? "Copied" : "Copy Markdown"}
                                                </Button>
                                            </div>
                                            <pre className="p-4 rounded-xl bg-black/60 border border-white/5 overflow-x-auto h-48 custom-scrollbar" role="region" aria-label="AKSHON markdown documentation">
                                                <code className="text-xs font-mono text-blue-400">
                                                    {AKSHON_MD}
                                                </code>
                                            </pre>
                                        </div>

                                        <Button
                                            onClick={() => setStep("done")}
                                            className="w-full h-14 rounded-xl bg-primary text-black font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                                        >
                                            Finalize Setup
                                            <Check className="ml-2 w-4 h-4" />
                                        </Button>
                                    </motion.div>
                                )}

                                {step === "done" && (
                                    <motion.div
                                        key="step-done"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-8"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20">
                                            <ShieldCheck className="w-10 h-10 text-primary" />
                                        </div>
                                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">
                                            System <span className="text-primary">Online</span>
                                        </h2>
                                        <p className="text-muted-foreground font-light mb-8 italic">
                                            Your environment is now ready for agentic operations.
                                            Welcome to the edge.
                                        </p>
                                        <Button
                                            onClick={handleClose}
                                            className="w-full h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-[0.2em] text-xs transition-all border border-white/10"
                                        >
                                            Enter Platform
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Progress Indicators */}
                            <div className="flex justify-center gap-2 mt-8">
                                {["email", "mcp", "akshon", "done"].map((s, i) => {
                                    const stepIndex = ["email", "mcp", "akshon", "done"].indexOf(step);
                                    return (
                                        <div
                                            key={s}
                                            className={`h-1 rounded-full transition-all duration-300 ${
                                                i <= stepIndex ? "w-8 bg-primary" : "w-2 bg-white/10"
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
