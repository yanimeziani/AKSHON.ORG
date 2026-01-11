"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import GetEdgeJourney from "./GetEdgeJourney";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import TelemetryToggle from "./TelemetryToggle";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const [isCaptureOpen, setIsCaptureOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
            setIsMobileMenuOpen(false);
        } catch (err) {
            console.error("Error signing out:", err);
        }
    };

    return (
        <>
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
                        {["Corpus", "Datasets", "Pricing"].map((item) => (
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
                    <div className="hidden sm:block">
                        <TelemetryToggle />
                    </div>
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
                                <Link href="/dashboard">
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
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden text-white hover:text-primary"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </Button>
                    </div>
                </div>
            </motion.nav>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-black/95 pt-24 px-4 md:hidden"
                    >
                        <div className="flex flex-col gap-6">
                            {["Corpus", "Datasets", "Pricing"].map((item) => (
                                <Link
                                    key={item}
                                    href={`/${item.toLowerCase()}`}
                                    className="text-2xl font-black text-white hover:text-primary transition-colors uppercase tracking-tighter"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item}
                                </Link>
                            ))}
                            <a
                                href="https://discord.gg/QVsmmNK2"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-2xl font-black text-white hover:text-primary transition-colors uppercase tracking-tighter"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Community
                            </a>
                            {user ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="text-2xl font-black text-white hover:text-primary transition-colors uppercase tracking-tighter"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="text-left text-2xl font-black text-white/60 hover:text-red-400 transition-colors uppercase tracking-tighter"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    className="text-2xl font-black text-white hover:text-primary transition-colors uppercase tracking-tighter"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Log In
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <GetEdgeJourney isOpen={isCaptureOpen} onClose={() => setIsCaptureOpen(false)} tier="Alpha Access" />
        </>
    );
}
