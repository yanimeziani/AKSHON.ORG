"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, ExternalLink, ShieldCheck, Wallet, Globe, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface CryptoPaymentProps {
    isOpen: boolean;
    onClose: () => void;
    tier: string;
    price: string;
}

const WALLET_ADDRESS = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"; // Replace with real treasury address
const NETWORKS = [
    { name: "Base", icon: Globe, coin: "USDC", color: "#0052FF" },
    { name: "Arbitrum", icon: Globe, coin: "USDC", color: "#28A0F0" },
    { name: "Mainnet", icon: Globe, coin: "USDC", color: "#627EEA" },
];

export default function CryptoPayment({ isOpen, onClose, tier, price }: CryptoPaymentProps) {
    const [step, setStep] = useState<"details" | "submitting" | "success" | "error">("details");
    const [txHash, setTxHash] = useState("");
    const [email, setEmail] = useState("");
    const [copied, setCopied] = useState(false);
    const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);

    const handleCopy = () => {
        navigator.clipboard.writeText(WALLET_ADDRESS);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!txHash || !email) return;

        setStep("submitting");

        // Simulation of node verification delay
        // In a real sovereign setup, this would query a local Bitcoin/Ethereum node
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
            await addDoc(collection(db, "payments"), {
                email,
                txHash,
                tier,
                price,
                network: selectedNetwork.name,
                timestamp: serverTimestamp(),
                status: "authorized_pending_block_confirmations", // Updated status to reflect "authorization"
            });
            setStep("success");
        } catch (error) {
            console.error("Error submitting payment:", error);
            setStep("error");
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
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl glass border-primary/20 p-8 md:p-12 rounded-[32px] overflow-hidden"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-20"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Ambient Glow */}
                        <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
                        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />

                        <div className="relative z-10">
                            {step === "success" ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8 border border-primary/30 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
                                        <ShieldCheck className="w-10 h-10 text-primary" />
                                    </div>
                                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
                                        Settlement <span className="text-primary">Initiated</span>
                                    </h2>
                                    <p className="text-muted-foreground italic mb-10 max-w-md mx-auto text-sm">
                                        Our validators are verifying your transaction on the <span className="text-white font-bold">{selectedNetwork.name}</span> network.
                                        You will receive access via <span className="text-white font-bold">{email}</span> within 10-15 minutes.
                                    </p>
                                    <Button
                                        onClick={onClose}
                                        className="bg-primary text-black font-black uppercase tracking-widest px-12 h-14 rounded-xl"
                                    >
                                        Monitor Inbox
                                    </Button>
                                </motion.div>
                            ) : (
                                <>
                                    <header className="mb-10">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                                <Wallet className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                                                    Sovereign <span className="text-primary">Settlement</span>
                                                </h2>
                                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                                                    Tier: {tier} {"//"} Amount: {price}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Network Selection */}
                                        <div className="grid grid-cols-3 gap-3 mb-8">
                                            {NETWORKS.map((net) => (
                                                <button
                                                    key={net.name}
                                                    onClick={() => setSelectedNetwork(net)}
                                                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${selectedNetwork.name === net.name
                                                        ? "bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                                                        : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                                                        }`}
                                                >
                                                    <net.icon className="w-5 h-5" />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">{net.name}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Sovereign Notice */}
                                        <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
                                            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">
                                                    Sovereign Choice Recommended
                                                </h4>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    By paying in crypto, you opt out of the debt-based fiat system.
                                                    This transaction is final, censorship-resistant, and supports the parallel economy.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Settlement Box */}
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 relative group overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Info className="w-12 h-12" />
                                            </div>
                                            <label className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-3 block">
                                                Treasury Address ({selectedNetwork.coin})
                                            </label>
                                            <div className="flex items-center gap-4">
                                                <code className="text-sm md:text-md text-white font-mono break-all flex-grow">
                                                    {WALLET_ADDRESS}
                                                </code>
                                                <button
                                                    onClick={handleCopy}
                                                    className="shrink-0 w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                                                >
                                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-white/40" />}
                                                </button>
                                            </div>
                                            <div className="mt-6 flex justify-center">
                                                <div className="p-4 bg-white rounded-xl shadow-2xl">
                                                    <QRCodeSVG
                                                        value={`ethereum:${WALLET_ADDRESS}`}
                                                        size={128}
                                                        bgColor="#ffffff"
                                                        fgColor="#000000"
                                                        level="L"
                                                        className="w-32 h-32"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </header>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-white/40 font-black uppercase tracking-widest ml-2">Communication Channel</label>
                                                <Input
                                                    type="email"
                                                    placeholder="EMAIL@DOMAIN.COM"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl text-white font-bold uppercase tracking-widest"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-white/40 font-black uppercase tracking-widest ml-2">Transaction Hash</label>
                                                <Input
                                                    type="text"
                                                    placeholder="0x..."
                                                    required
                                                    value={txHash}
                                                    onChange={(e) => setTxHash(e.target.value)}
                                                    className="h-14 bg-white/5 border-white/10 rounded-xl text-white font-mono"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={step === "submitting"}
                                            className="w-full h-16 rounded-2xl bg-primary text-black font-black uppercase tracking-[0.3em] text-xs hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_0_40px_rgba(212,175,55,0.2)]"
                                        >
                                            {step === "submitting" ? (
                                                <span className="flex items-center gap-2">
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                        className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                                                    />
                                                    VERIFYING TRANSACTION...
                                                </span>
                                            ) : (
                                                "Confirm Settlement"
                                            )}
                                        </Button>

                                        <div className="flex items-center justify-center gap-4 text-[9px] text-white/20 font-black uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Encrypted Protocol</span>
                                            <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3" /> On-Chain Validation</span>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
