"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Shield, Mail, Calendar, Zap, LogOut, Wallet } from "lucide-react";

const ADMIN_EMAIL = "mezianiyani0@gmail.com";

export default function AdminDashboard() {
    const [user, setUser] = useState<any>(null);
    const [leads, setLeads] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"leads" | "payments">("leads");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user?.email === ADMIN_EMAIL) {
            const leadsQ = query(collection(db, "leads"), orderBy("timestamp", "desc"));
            const unsubscribeLeads = onSnapshot(leadsQ, (snapshot) => {
                const leadsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setLeads(leadsData);
            });

            const paymentsQ = query(collection(db, "payments"), orderBy("timestamp", "desc"));
            const unsubscribePayments = onSnapshot(paymentsQ, (snapshot) => {
                const paymentsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPayments(paymentsData);
            });

            return () => {
                unsubscribeLeads();
                unsubscribePayments();
            };
        }
    }, [user]);

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login Error:", error);
        }
    };

    const handleLogout = () => signOut(auth);

    const handleVerify = async (id: string) => {
        try {
            await updateDoc(doc(db, "payments", id), {
                status: "verified"
            });
        } catch (error) {
            console.error("Error verifying payment:", error);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!user || user.email !== ADMIN_EMAIL) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center p-4">
                <Navbar />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-12 rounded-[40px] border-primary/20 text-center max-w-md w-full"
                >
                    <Shield className="w-16 h-16 text-primary mx-auto mb-8 animate-pulse" />
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Restricted Access</h1>
                    <p className="text-muted-foreground font-light mb-8 italic">
                        The Command Dashboard is reserved for Sovereign administrators.
                        Authenticate via primary channel to proceed.
                    </p>
                    <button
                        onClick={handleLogin}
                        className="w-full h-14 bg-primary text-black font-black uppercase tracking-[0.2em] text-xs rounded-xl hover:scale-105 transition-transform"
                    >
                        Authenticate Command
                    </button>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black pt-32 pb-24">
            <Navbar />
            <div className="container mx-auto px-4">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="text-primary w-5 h-5" />
                            <span className="text-primary font-mono text-[10px] uppercase tracking-[0.4em]">Internal Command_01</span>
                        </div>
                        <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">Command <span className="text-primary italic">Intelligence</span></h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">{user.email}</div>
                            <button onClick={handleLogout} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1">
                                <LogOut className="w-3 h-3" /> Terminate Session
                            </button>
                        </div>
                        {user.photoURL && (
                            <div className="w-12 h-12 rounded-full border border-primary/20 overflow-hidden">
                                <img src={user.photoURL} alt="Admin" className="w-full h-full object-cover grayscale" />
                            </div>
                        )}
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab("leads")}
                        className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === "leads"
                            ? "bg-primary text-black"
                            : "bg-white/5 text-white/40 hover:bg-white/10"
                            }`}
                    >
                        Leads ({leads.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("payments")}
                        className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === "payments"
                            ? "bg-primary text-black"
                            : "bg-white/5 text-white/40 hover:bg-white/10"
                            }`}
                    >
                        Settlements ({payments.length})
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {activeTab === "leads" ? (
                        leads.length === 0 ? (
                            <div className="glass p-20 rounded-[40px] text-center border-white/5">
                                <Zap className="w-12 h-12 text-white/10 mx-auto mb-6" />
                                <p className="text-muted-foreground font-light italic text-lg">No kinetic signals detected in the lead buffer.</p>
                            </div>
                        ) : (
                            leads.map((lead, i) => (
                                <motion.div
                                    key={lead.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass p-6 md:p-8 rounded-3xl border-white/5 hover:border-primary/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/10 shrink-0">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xl font-black text-white italic tracking-tight">{lead.email}</div>
                                            <div className="flex gap-3 mt-2">
                                                <span className="text-[9px] bg-primary/10 text-primary px-3 py-1 rounded-full font-black uppercase tracking-widest">
                                                    Tier: {lead.tier}
                                                </span>
                                                <span className="text-[9px] bg-white/5 text-muted-foreground px-3 py-1 rounded-full font-black uppercase tracking-widest">
                                                    ID: {lead.id.slice(0, 8)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right flex md:flex-col items-center md:items-end gap-4 md:gap-1">
                                        <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                                            <Calendar className="w-3 h-3" />
                                            {lead.timestamp?.toDate ? lead.timestamp.toDate().toLocaleString() : 'Just now'}
                                        </div>
                                        <div className="text-[9px] text-primary/60 font-mono uppercase font-bold">
                                            Source: {lead.source || '/root'}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )
                    ) : (
                        payments.length === 0 ? (
                            <div className="glass p-20 rounded-[40px] text-center border-white/5">
                                <Shield className="w-12 h-12 text-white/10 mx-auto mb-6" />
                                <p className="text-muted-foreground font-light italic text-lg">No on-chain settlements detected.</p>
                            </div>
                        ) : (
                            payments.map((p, i) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass p-6 md:p-8 rounded-3xl border-white/5 hover:border-primary/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                                            <Wallet className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xl font-black text-white italic tracking-tight">{p.email}</div>
                                            <div className="flex gap-3 mt-2">
                                                <span className="text-[9px] bg-primary/20 text-primary px-3 py-1 rounded-full font-black uppercase tracking-widest">
                                                    Amount: {p.price}
                                                </span>
                                                <span className="text-[9px] bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                                                    Network: {p.network}
                                                </span>
                                                <span className="text-[9px] bg-white/5 text-muted-foreground px-3 py-1 rounded-full font-black uppercase tracking-widest shrink-0">
                                                    Tier: {p.tier}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-grow max-w-xs overflow-hidden mx-4">
                                        <div className="text-[9px] text-white/20 uppercase font-black tracking-widest mb-1">TX Hash</div>
                                        <a
                                            href={`https://basescan.org/tx/${p.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-mono text-primary hover:underline block truncate"
                                        >
                                            {p.txHash}
                                        </a>
                                    </div>

                                    <div className="text-right flex md:flex-col items-center md:items-end gap-4 md:gap-1">
                                        <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-bold tracking-widest">
                                            <Calendar className="w-3 h-3" />
                                            {p.timestamp?.toDate ? p.timestamp.toDate().toLocaleString() : 'Just now'}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${p.status === 'pending_verification' ? 'text-yellow-500 bg-yellow-500/10' : 'text-green-500 bg-green-500/10'
                                                }`}>
                                                {p.status}
                                            </div>
                                            {p.status === 'pending_verification' && (
                                                <button
                                                    onClick={() => handleVerify(p.id)}
                                                    className="text-[9px] font-black uppercase tracking-widest bg-primary text-black px-3 py-1 rounded hover:scale-105 transition-transform"
                                                >
                                                    Verify
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )
                    )}
                </div>
            </div>
        </main>
    );
}
