import { uploadToCorpus } from "../lib/gcp";

const SAMPLE_PAPERS = [
    {
        name: "Attention_Is_All_You_Need.pdf",
        url: "https://arxiv.org/pdf/1706.03762.pdf"
    },
    {
        name: "Generative_Antigravity_Research.pdf",
        url: "https://arxiv.org/pdf/2301.00001.pdf" // Using a dummy placeholder or real one
    },
    {
        name: "Sovereign_Arbitrage_Framework.pdf",
        url: "https://arxiv.org/pdf/2401.00002.pdf"
    }
];

/**
 * Syncs the research corpus from external sources to GCP.
 */
async function syncCorpus() {
    console.log("🌊 Starting corpus download to GCP...");

    for (const paper of SAMPLE_PAPERS) {
        try {
            console.log(`📥 Fetching: ${paper.name}...`);
            const response = await fetch(paper.url);

            if (!response.ok) {
                console.warn(`⚠️ Failed to fetch ${paper.name}: ${response.statusText}`);
                continue;
            }

            const buffer = await response.arrayBuffer();
            await uploadToCorpus(paper.name, Buffer.from(buffer));

            console.log(`✅ Uploaded ${paper.name} to GCP.`);
        } catch (error) {
            console.error(`❌ Error syncing ${paper.name}:`, error);
        }
    }

    console.log("✨ Corpus sync complete.");
}

syncCorpus().catch(console.error);
