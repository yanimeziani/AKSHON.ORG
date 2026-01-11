"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface LeadCaptureProps {
    isOpen: boolean;
    onClose: () => void;
    tier?: string;
}

export default function LeadCapture({ isOpen, onClose, tier = "Standard" }: LeadCaptureProps) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");
        try {
            await addDoc(collection(db, "leads"), {
                email,
                tier,
                timestamp: serverTimestamp(),
                source: window.location.pathname,
            });
            setStatus("success");
            setTimeout(() => {
                onClose();
                setStatus("idle");
                setEmail("");
            }, 3000);
        } catch (error) {
            console.error("Error capturing lead:", error);
            setStatus("error");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg glass border-primary/20 p-8 md:p-12 rounded-[40px] overflow-hidden"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full" />

                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20">
                                <Zap className="w-6 h-6 text-primary" />
                            </div>

                            <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
                                Acquire <span className="text-primary">Access</span>
                            </h2>
                            <p className="text-muted-foreground font-light mb-8 italic text-sm">
                                You are requesting entry to the <span className="text-white font-bold">{tier}</span> tier.
                                Leave your primary communication channel to receive authentication credentials.
                            </p>

                            {status === "success" ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 rounded-2xl bg-primary/10 border border-primary/20 text-center"
                                >
                                    <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                                    <h3 className="text-xl font-black text-white italic uppercase mb-2">Signal Received</h3>
                                    <p className="text-xs text-primary/70 font-bold uppercase tracking-widest">
                                        Check your transmission logs shortly.
                                    </p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <Input
                                            type="email"
                                            placeholder="COMM_CHANNEL@DOMAIN.COM"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-14 bg-white/5 border-white/10 rounded-xl pl-12 text-sm text-white placeholder:text-white/20 focus:border-primary/50 transition-colors uppercase font-bold tracking-widest"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={status === "loading"}
                                        className="w-full h-14 rounded-xl bg-primary text-black font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                                    >
                                        {status === "loading" ? "TRANSMITTING..." : "Initiate Protocol"}
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                    <p className="text-[9px] text-white/20 text-center uppercase tracking-widest font-black">
                                        SECURE L1 ENCRYPTION ENABLED // NO SPAM POLICY
                                    </p>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
