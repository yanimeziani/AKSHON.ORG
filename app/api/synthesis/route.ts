import { NextResponse } from 'next/server';

export async function GET() {
    // Mock data mimicking AI distillation of papers
    const insights = [
        {
            id: 1,
            title: "AlphaFold 3 Convergence",
            summary: "Predicted structural anomalies in protein folding suggest new pathways for drug discovery in neurodegenerative diseases.",
            confidence: "98%",
            source: "Isomorphic Labs",
            timestamp: new Date().toISOString()
        },
        {
            id: 2,
            title: "Quantum Error Correction",
            summary: "New surface code implementation reduces logical error rates by order of magnitude, enabling stable qubit operations at room temperature.",
            confidence: "92%",
            source: "Google Quantum AI",
            timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 3,
            title: "Liquid Neural Networks",
            summary: "Dynamic time-constant adjustment allows for continuous learning in deployed robotics with minimal compute overhead.",
            confidence: "87%",
            source: "MIT CSAIL",
            timestamp: new Date(Date.now() - 172800000).toISOString()
        },
    ];
    return NextResponse.json({ insights });
}
