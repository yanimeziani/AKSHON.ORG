"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, Check, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { hasSetConsent, setConsent as saveConsent } from "@/lib/analytics";

export default function AnalyticsConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        if (!hasSetConsent()) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleChoice = (choice: boolean) => {
        saveConsent(choice);
        setIsVisible(false);
        // Refresh to apply changes if needed, or just let the app continue
        if (choice) {
            window.location.reload(); // Optional: reload to start tracking immediately
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-8 left-8 right-8 md:left-auto md:right-8 md:w-[400px] z-[200]"
                >
                    <div className="glass border-primary/20 p-6 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                <BarChart3 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white italic uppercase tracking-tight leading-tight">
                                    Telemetry <span className="text-primary">Optimization</span>
                                </h3>
                                <p className="text-[11px] text-muted-foreground font-light italic mt-1 leading-relaxed">
                                    We use high-integrity analytics to improve the Sovereign Intelligence Matrix.
                                    Capture is anonymous. You control the signal.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => handleChoice(true)}
                                size="sm"
                                className="flex-1 bg-primary text-black font-black uppercase tracking-widest text-[10px] h-10 rounded-xl hover:scale-[1.05] transition-transform"
                            >
                                <Check className="w-3 h-3 mr-2" />
                                Accept All
                            </Button>
                            <Button
                                onClick={() => handleChoice(false)}
                                variant="outline"
                                size="sm"
                                className="flex-1 border-white/10 text-white font-black uppercase tracking-widest text-[10px] h-10 rounded-xl hover:bg-white/5"
                            >
                                <X className="w-3 h-3 mr-2" />
                                Decline
                            </Button>
                        </div>

                        <p className="text-[8px] text-white/20 text-center uppercase tracking-widest font-black mt-4">
                            Sovereign Data Protection Protocol Active
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
