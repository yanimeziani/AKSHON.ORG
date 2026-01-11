"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, ArrowRight, Github, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/firebase";
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.push("/corpus");
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/corpus");
        } catch (err: any) {
            setError(err.message || "Authentication failed");
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError("");
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            router.push("/corpus");
        } catch (err: any) {
            setError(err.message || "Google authentication failed");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_20%)] opacity-[0.03] pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 justify-center mb-12 group">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-black text-black text-2xl transition-transform group-hover:scale-110">
                        A
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-white uppercase italic">
                        Akshon<span className="text-primary tracking-normal">.org</span>
                    </span>
                </Link>

                <div className="glass p-8 md:p-12 rounded-[40px] border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                    <header className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
                            <Zap className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
                            Authorized <span className="text-primary">Access</span>
                        </h1>
                        <p className="text-muted-foreground text-sm italic font-light">
                            Enter your credentials to access the intelligence matrix.
                        </p>
                    </header>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-4 mb-8">
                        <Button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            variant="outline"
                            className="w-full h-14 rounded-xl border-white/5 bg-white/5 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                        >
                            <Chrome className="w-4 h-4" />
                            Continue with Google
                        </Button>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]">
                            <span className="bg-[#050505] px-4 text-white/20">Identity Protocol</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <Input
                                type="email"
                                placeholder="COMM_CHANNEL@DOMAIN.COM"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-14 bg-white/5 border-white/10 rounded-xl pl-12 text-sm text-white placeholder:text-white/20 focus:border-primary/50 transition-colors uppercase font-bold tracking-widest"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <Input
                                type="password"
                                placeholder="ACCESS_KEY"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-14 bg-white/5 border-white/10 rounded-xl pl-12 text-sm text-white placeholder:text-white/20 focus:border-primary/50 transition-colors uppercase font-bold tracking-widest"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-xl bg-primary text-black font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(212,175,55,0.2)] mt-6"
                        >
                            {loading ? "AUTHENTICATING..." : "Initiate Protocol"}
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </form>

                    <footer className="mt-10 text-center">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">
                            Need access? <Link href="/" className="text-primary hover:underline">Apply for Alpha</Link>
                        </p>
                    </footer>
                </div>

                <p className="text-center mt-8 text-[9px] text-white/20 uppercase tracking-[0.4em] font-black">
                    SECURE L1 ENCRYPTION ENABLED // SESSION_ID_{Math.floor(Math.random() * 1000000)}
                </p>
            </motion.div>
        </main>
    );
}
