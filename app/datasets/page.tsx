
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Database, Download, Terminal, Copy, Check, Server, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrackedLink from "@/components/TrackedLink";

// Mock Data for Curated Packs
const DATASET_PACKS = [
    {
        id: "finance-q1-2024",
        title: "Global Finance Q1 2024",
        description: "Curated 10k documents on global market trends, central bank minutes, and crypto liquidity flows.",
        size: "2.4 GB",
        items: "12,403 Files",
        tags: ["Finance", "Macro", "Crypto"],
        mcpId: "mcp://akshon.org/d/finance-q1-24"
    },
    {
        id: "code-instruct-v3",
        title: "Sovereign Code Instruct v3",
        description: "High-quality instruction tuning dataset for coding agents. Filtered for security and performance.",
        size: "4.1 GB",
        items: "150k Samples",
        tags: ["Coding", "Instruct", "Python"],
        mcpId: "mcp://akshon.org/d/code-instruct-v3"
    },
    {
        id: "bio-synth-alpha",
        title: "Bio-Synthetic Alpha",
        description: "Research papers and datasets on synthetic biology and active inference models.",
        size: "1.2 GB",
        items: "5,200 Files",
        tags: ["Biology", "Active Inference", "Research"],
        mcpId: "mcp://akshon.org/d/bio-synth-a"
    },
    {
        id: "akshon-internal-logs",
        title: "Akshon Platform Logs (Anonymized)",
        description: "System logs and usage patterns for optimizing agentic workflows. Anonymized for privacy.",
        size: "800 MB",
        items: "2.1M Entries",
        tags: ["Internal", "Logs", "Optimization"],
        mcpId: "mcp://akshon.org/d/logs-anon"
    }
];

export default function DatasetsPage() {
    return (
        <main className="min-h-screen bg-black pt-32 pb-24">
            <Navbar />
            <div className="container mx-auto px-4">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Layers className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">
                            Data Aggregator
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-4">
                        Curated <span className="text-primary italic">Dataset Packs</span>
                    </h1>
                    <p className="text-muted-foreground font-light max-w-2xl">
                        Premium, curated datasets optimized for agentic training and RAG.
                        Directly compatible with your MCP fleet.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {DATASET_PACKS.map((pack) => (
                        <Card key={pack.id} className="glass-chroma border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Database className="w-24 h-24" />
                            </div>
                            <CardHeader>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-2">
                                        {pack.tags.map(tag => (
                                            <span key={tag} className="px-2 py-1 rounded-md bg-white/5 text-[10px] uppercase font-bold text-white/60">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="text-xs font-mono text-primary/80">
                                        {pack.size}
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">
                                    {pack.title}
                                </CardTitle>
                                <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                                    {pack.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-4">
                                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between group/code">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <Terminal className="w-4 h-4 text-primary shrink-0" />
                                            <code className="text-xs font-mono text-white/50 truncate">
                                                {pack.mcpId}
                                            </code>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 hover:text-white">
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-widest text-xs h-10">
                                            <Server className="w-4 h-4 mr-2" />
                                            Add to Fleet
                                        </Button>
                                        <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/5 text-white font-bold uppercase tracking-widest text-xs h-10">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download Pack
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* MCP Info Section */}
                <Card className="glass-chroma border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl font-bold text-white uppercase tracking-wider">
                            <Terminal className="w-6 h-6 text-primary" />
                            MCP Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div>
                                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                    To use these datasets with your local agents, add the AKSHON Aggregator to your MCP configuration file.
                                    This enables direct streaming of curated data into your agent's context window.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-white/80">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">1</div>
                                        <span>Copy the configuration block</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-white/80">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">2</div>
                                        <span>Paste into your <code className="bg-white/10 px-1 py-0.5 rounded text-xs">mcp_config.json</code></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-white/80">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">3</div>
                                        <span>Restart your agent runtime</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute top-0 right-0 p-2">
                                    <Button variant="ghost" size="sm" className="h-8 text-xs text-white/40 hover:text-white">
                                        <Copy className="w-3 h-3 mr-1" /> Copy Config
                                    </Button>
                                </div>
                                <pre className="p-6 rounded-xl bg-black/60 border border-white/5 overflow-x-auto">
                                    <code className="text-xs font-mono text-emerald-400">
                                        {`{
  "mcpServers": {
    "akshon-aggregator": {
      "command": "npx",
      "args": [
        "-y",
        "@akshon/mcp-aggregator"
      ],
      "env": {
        "AKSHON_API_KEY": "your-api-key"
      }
    }
  }
}`}
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
