"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import LeadCapture from "./LeadCapture";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import TelemetryToggle from "./TelemetryToggle";

export default function Navbar() {
    const [isCaptureOpen, setIsCaptureOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            setUser(null);
        } catch (err) {
            console.error("Error signing out:", err);
        }
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-white/5 glass"
        >
            <div className="container h-full mx-auto px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-black text-black text-xl">
                        A
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white uppercase italic">
                        Akshon<span className="text-primary tracking-normal">.org</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {["Corpus", "Synthesis", "Fleet", "Pricing"].map((item) => (
                        <Link
                            key={item}
                            href={`/${item.toLowerCase()}`}
                            className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
                        >
                            {item}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <TelemetryToggle />
                    <a
                        href="https://discord.gg/QVsmmNK2"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:flex items-center gap-2 text-muted-foreground font-bold hover:text-white transition-colors uppercase tracking-widest text-xs"
                    >
                        Community
                    </a>
                    {user ? (
                        <div className="flex items-center gap-2">
                            <Link href="/corpus">
                                <Button variant="ghost" className="hidden sm:inline-flex text-muted-foreground font-bold hover:text-white uppercase tracking-widest text-xs">
                                    Dashboard
                                </Button>
                            </Link>
                            <Button
                                onClick={handleSignOut}
                                variant="ghost"
                                className="hidden sm:inline-flex text-white/40 font-bold hover:text-red-400 uppercase tracking-widest text-[9px]"
                            >
                                Sign Out
                            </Button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button variant="ghost" className="hidden sm:inline-flex text-muted-foreground font-bold hover:text-white uppercase tracking-widest text-xs">
                                Log In
                            </Button>
                        </Link>
                    )}
                    <Button
                        onClick={() => setIsCaptureOpen(true)}
                        size="sm"
                        className="rounded-full bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-xs px-6"
                    >
                        Get Edge
                    </Button>
                </div>
            </div>
            <LeadCapture isOpen={isCaptureOpen} onClose={() => setIsCaptureOpen(false)} tier="Alpha Access" />
        </motion.nav>

    );
}
