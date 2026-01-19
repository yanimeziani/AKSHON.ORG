"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import TelemetryToggle from "./TelemetryToggle";

const GetEdgeJourney = dynamic(() => import("./GetEdgeJourney"), { ssr: false });

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
            className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-white/40 glass-chroma"
            aria-label="Main navigation"
        >
            <div className="container h-full mx-auto px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1 -m-1" aria-label="Akshon home">
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-black text-primary-foreground text-xl shadow-lg" aria-hidden="true">
                        A
                    </div>
                    <span className="text-xl font-black tracking-tighter text-foreground uppercase italic">
                        Akshon<span className="text-primary tracking-normal">.org</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {["Corpus", "Demos", "Datasets", "Pricing"].map((item) => (
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
                        className="hidden sm:flex items-center gap-2 text-muted-foreground font-bold hover:text-foreground transition-colors uppercase tracking-widest text-xs"
                    >
                        Community
                    </a>
                    {user ? (
                        <div className="flex items-center gap-2">
                            <Link href="/keys">
                                <Button variant="ghost" className="hidden sm:inline-flex text-muted-foreground font-bold hover:text-primary uppercase tracking-widest text-xs">
                                    API Keys
                                </Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button variant="ghost" className="hidden sm:inline-flex text-muted-foreground font-bold hover:text-foreground uppercase tracking-widest text-xs">
                                    Dashboard
                                </Button>
                            </Link>
                            <Button
                                onClick={handleSignOut}
                                variant="ghost"
                                className="hidden sm:inline-flex text-muted-foreground font-bold hover:text-destructive uppercase tracking-widest text-[10px] min-h-[44px]"
                                aria-label="Sign out of your account"
                            >
                                Sign Out
                            </Button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button variant="ghost" className="hidden sm:inline-flex text-muted-foreground font-bold hover:text-foreground uppercase tracking-widest text-xs">
                                Log In
                            </Button>
                        </Link>
                    )}
                    <Button
                        onClick={() => setIsCaptureOpen(true)}
                        onMouseEnter={() => import("./GetEdgeJourney")}
                        size="sm"
                        className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs px-6 shadow-md"
                    >
                        Get Edge
                    </Button>
                </div>
            </div>
            <GetEdgeJourney isOpen={isCaptureOpen} onClose={() => setIsCaptureOpen(false)} tier="Alpha Access" />
        </motion.nav>

    );
}
