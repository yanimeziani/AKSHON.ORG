import { NextResponse } from 'next/server';

export async function GET() {
    // Mock data for the kinetic feed
    const feed = [
        {
            id: "p1",
            title: "Scaling Laws for Generative Mixed-Modal Models",
            type: "PDF",
            timestamp: new Date().toISOString(),
            size: "2.4 MB",
            tags: ["AI", "Multimodal"]
        },
        {
            id: "p2",
            title: "Direct laser cooling of positronium",
            type: "PDF",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            size: "1.1 MB",
            tags: ["Physics", "CERN"]
        },
        {
            id: "p3",
            title: "Self-consuming generative models go MAD",
            type: "PDF",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            size: "890 KB",
            tags: ["AI", "Safety"]
        },
        {
            id: "p4",
            title: "CRISPR-Cas9 Off-target effects analysis",
            type: "Dataset",
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            size: "4.5 GB",
            tags: ["Biotech", "Genomics"]
        }
    ];
    return NextResponse.json({ feed });
}
