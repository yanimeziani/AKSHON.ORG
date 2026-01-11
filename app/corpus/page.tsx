import Navbar from "@/components/Navbar";
import { listResearchPapers } from "@/lib/gcp";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Download, ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CorpusPage() {
    let papers = [];
    let restrictedAreas: any[] = [];

    try {
        papers = await listResearchPapers("research/");
        restrictedAreas = [
            { name: "admin_access_keys.json", size: "2 KB", path: "secrets/admin_access_keys.json" },
            { name: "config.env", size: "1 KB", path: "admin/config.env" },
        ];
    } catch (error) {
        console.error("GCP Fetch Error:", error);
        papers = [
            { name: "Sovereign_Intelligence_v1.pdf", size: "1.2 MB", updated: new Date().toISOString(), url: "#" },
            { name: "Kinetic_Flux_Dynamics.pdf", size: "4.5 MB", updated: new Date().toISOString(), url: "#" },
            { name: "Hamiltonian_Latents.pdf", size: "2.1 MB", updated: new Date().toISOString(), url: "#" },
        ];
    }

    return (
        <main className="min-h-screen bg-black pt-32 pb-24">
            <Navbar />
            <div className="container mx-auto px-4">
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-4">
                        The Research <span className="text-primary italic">Vault</span>
                    </h1>
                    <p className="text-muted-foreground font-light max-w-2xl">
                        Our proprietary corpus of frontier research. Hosted securely on Google Cloud.
                        Sovereign data. Verified insights.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {papers.map((paper: any, i: number) => (
                        <Card key={i} className="glass border-white/5 hover:border-primary/30 transition-all group">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-lg text-white font-bold leading-tight truncate">
                                        {paper.name.replace(".pdf", "").replace(/_/g, " ")}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono mt-1">
                                        {paper.size} • {new Date(paper.updated).toLocaleDateString()}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Button asChild variant="outline" size="sm" className="flex-1 rounded-full text-xs font-bold uppercase tracking-widest h-9 border-white/10 text-white hover:bg-white/10">
                                        <a href={paper.url} target="_blank" rel="noopener noreferrer">
                                            <Download className="w-3 h-3 mr-2" />
                                            Download
                                        </a>
                                    </Button>
                                    <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary">
                                        <a href={paper.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Honeypot Section */}
                <section className="mt-24 pt-12 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                            Restricted <span className="text-red-500">Assets</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 hover:opacity-100 transition-opacity">
                        {restrictedAreas.map((area, i) => (
                            <Card key={i} className="bg-red-950/20 border-red-900/30 hover:bg-red-950/30 transition-all cursor-not-allowed">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <div>
                                        <CardTitle className="text-sm text-red-200 font-mono">
                                            {area.name}
                                        </CardTitle>
                                        <p className="text-[10px] text-red-500/70 font-mono mt-1 uppercase">
                                            INTERNAL USE ONLY • ENCRYPTED
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-7 text-[10px] font-bold uppercase tracking-tight">
                                        Attempt Decrypt
                                    </Button>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono mt-6 text-center uppercase tracking-widest">
                        System Audited by AKSHON SecureSentinel. Every access attempt is logged with IP and Device ID.
                    </p>
                </section>
            </div>
        </main>
    );
}
