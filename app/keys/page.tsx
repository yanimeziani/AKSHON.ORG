"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Key,
    Plus,
    Copy,
    Check,
    Trash2,
    Shield,
    Eye,
    EyeOff,
    Clock,
    Activity,
    AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface APIKey {
    id: string;
    name: string;
    keyPrefix: string;
    createdAt: { seconds: number };
    lastUsed: { seconds: number } | null;
    expiresAt: { seconds: number } | null;
    isActive: boolean;
    scopes: string[];
    rateLimit: number;
    usageCount: number;
}

export default function APIKeysPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [keys, setKeys] = useState<APIKey[]>([]);
    const [newKeyName, setNewKeyName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newKey, setNewKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
            if (user) {
                fetchKeys(user.uid);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchKeys = async (userId: string) => {
        try {
            const res = await fetch("/api/keys", {
                headers: { "x-user-id": userId },
            });
            const data = await res.json();
            if (data.keys) {
                setKeys(data.keys);
            }
        } catch (err) {
            console.error("Failed to fetch keys:", err);
        }
    };

    const createKey = async () => {
        if (!user || !newKeyName.trim()) return;

        setIsCreating(true);
        setError("");

        try {
            const res = await fetch("/api/keys", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user.uid,
                },
                body: JSON.stringify({
                    name: newKeyName.trim(),
                    scopes: ["read", "corpus"],
                    rateLimit: 60,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error);
            }

            setNewKey(data.key);
            setNewKeyName("");
            fetchKeys(user.uid);
        } catch (err: any) {
            setError(err.message || "Failed to create API key");
        } finally {
            setIsCreating(false);
        }
    };

    const revokeKey = async (keyId: string) => {
        if (!user) return;

        try {
            const res = await fetch(`/api/keys?keyId=${keyId}`, {
                method: "DELETE",
                headers: { "x-user-id": user.uid },
            });

            if (res.ok) {
                fetchKeys(user.uid);
            }
        } catch (err) {
            console.error("Failed to revoke key:", err);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (timestamp: { seconds: number } | null) => {
        if (!timestamp) return "Never";
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center p-4">
                <Navbar />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-12 rounded-[40px] border-primary/20 text-center max-w-md w-full"
                >
                    <Shield className="w-16 h-16 text-primary mx-auto mb-8 animate-pulse" />
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">
                        Access Denied
                    </h1>
                    <p className="text-muted-foreground font-light mb-8 italic">
                        Please authenticate to manage your API keys.
                    </p>
                    <Link href="/login">
                        <Button className="w-full h-14 bg-primary text-black font-black uppercase tracking-[0.2em] text-xs rounded-xl hover:scale-105 transition-transform">
                            Log In
                        </Button>
                    </Link>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black pt-32 pb-24 relative overflow-hidden">
            <Navbar />

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 mb-4"
                    >
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">
                            Developer Tools
                        </span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4"
                    >
                        API <span className="text-primary italic">Keys</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground font-light max-w-2xl italic"
                    >
                        Generate and manage API keys for IDE, terminal, and agent integrations.
                    </motion.p>
                </header>

                {/* New Key Alert */}
                <AnimatePresence>
                    {newKey && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-8"
                        >
                            <Card className="glass border-primary/30 bg-primary/5">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <AlertTriangle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">
                                                Save Your API Key
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-4 italic">
                                                This is the only time your full API key will be shown. Store it securely!
                                            </p>
                                            <div className="flex items-center gap-2 bg-black/40 p-4 rounded-xl border border-white/10">
                                                <code className="text-sm font-mono text-white flex-1 break-all">
                                                    {newKey}
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(newKey)}
                                                    className="shrink-0 w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"
                                                >
                                                    {copied ? (
                                                        <Check className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <Copy className="w-4 h-4 text-white/40" />
                                                    )}
                                                </button>
                                            </div>
                                            <Button
                                                onClick={() => setNewKey(null)}
                                                className="mt-4 bg-primary text-black font-bold uppercase tracking-widest text-xs"
                                            >
                                                I've Saved My Key
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create Key Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-1"
                    >
                        <Card className="glass border-white/5 h-full">
                            <CardHeader>
                                <CardTitle className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                                    <Key className="w-5 h-5 text-primary" />
                                    New Key
                                </CardTitle>
                                <CardDescription className="italic">
                                    Create a new API key for your integrations.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    placeholder="Key name (e.g., VS Code Extension)"
                                    className="h-14 bg-white/5 border-white/10 rounded-xl text-white"
                                />

                                {error && (
                                    <p className="text-red-400 text-xs font-bold uppercase tracking-widest">
                                        {error}
                                    </p>
                                )}

                                <Button
                                    onClick={createKey}
                                    disabled={isCreating || !newKeyName.trim()}
                                    className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest rounded-xl"
                                >
                                    {isCreating ? (
                                        <span className="flex items-center gap-2">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                                            />
                                            Generating...
                                        </span>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Generate Key
                                        </>
                                    )}
                                </Button>

                                <div className="pt-4 border-t border-white/5">
                                    <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-3">
                                        Default Permissions
                                    </h4>
                                    <div className="space-y-2">
                                        {["read", "corpus"].map((scope) => (
                                            <div key={scope} className="flex items-center gap-2 text-xs text-white/60">
                                                <Check className="w-3 h-3 text-emerald-500" />
                                                <span className="uppercase font-bold tracking-wider">{scope}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Keys List */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2"
                    >
                        <Card className="glass border-white/5">
                            <CardHeader>
                                <CardTitle className="text-xl font-black text-white uppercase italic tracking-tighter">
                                    Active Keys ({keys.filter(k => k.isActive).length})
                                </CardTitle>
                                <CardDescription className="italic">
                                    Manage your existing API keys.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {keys.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Key className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                        <p className="text-muted-foreground italic">
                                            No API keys yet. Create one to get started.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {keys.map((key) => (
                                            <motion.div
                                                key={key.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`p-4 rounded-xl border transition-all ${key.isActive
                                                        ? "bg-white/5 border-white/10 hover:border-primary/30"
                                                        : "bg-white/[0.02] border-white/5 opacity-50"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="font-bold text-white uppercase tracking-tight">
                                                                {key.name}
                                                            </h4>
                                                            {!key.isActive && (
                                                                <span className="px-2 py-0.5 text-[8px] bg-red-500/20 text-red-400 rounded uppercase font-bold">
                                                                    Revoked
                                                                </span>
                                                            )}
                                                        </div>
                                                        <code className="text-sm text-white/40 font-mono">
                                                            {key.keyPrefix}••••••••••••••••
                                                        </code>
                                                        <div className="flex flex-wrap gap-4 mt-3 text-[10px] text-white/30 uppercase font-bold tracking-wider">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Created {formatDate(key.createdAt)}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Activity className="w-3 h-3" />
                                                                {key.usageCount} calls
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Eye className="w-3 h-3" />
                                                                Last used {formatDate(key.lastUsed)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {key.isActive && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => revokeKey(key.id)}
                                                            className="shrink-0 border-red-500/20 text-red-400 hover:bg-red-500/10"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Usage Example */}
                        <Card className="glass border-white/5 mt-8">
                            <CardHeader>
                                <CardTitle className="text-lg font-black text-white uppercase italic tracking-tighter">
                                    Quick Start
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-black/40 p-4 rounded-xl border border-white/5 overflow-x-auto">
                                    <pre className="text-sm font-mono text-white/70">
                                        {`# Terminal / Agent Usage
curl -X GET "https://akshon.org/api/v1/corpus" \\
     -H "Authorization: Bearer aksh_your_key_here"

# Python
import requests
headers = {"Authorization": "Bearer aksh_your_key_here"}
response = requests.get("https://akshon.org/api/v1/corpus", headers=headers)

# Node.js
const response = await fetch("https://akshon.org/api/v1/corpus", {
    headers: { "Authorization": "Bearer aksh_your_key_here" }
});`}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
